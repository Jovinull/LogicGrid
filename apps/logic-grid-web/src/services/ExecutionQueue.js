import { gameStateManager } from '../stores/GameStateManager';
import { SensorService } from './SensorService';

const TURN_RIGHT = { Norte: 'Leste', Leste: 'Sul', Sul: 'Oeste', Oeste: 'Norte' };
const TURN_LEFT  = { Norte: 'Oeste', Oeste: 'Sul', Sul: 'Leste', Leste: 'Norte' };

/**
 * ExecutionQueue
 * Executes an array of parsed actions one at a time, with a fixed delay between
 * each step, updating GameStateManager after every action so the canvas redraws
 * incrementally (tick-based animation).
 *
 * Supports repetir(n) { ... } blocks by flattening them into a linear action
 * list before execution begins.
 *
 * Supports se(condition) { ... } [senao { ... }] blocks by evaluating the
 * condition at the exact tick when that node is reached in the queue, so the
 * decision always reflects the hero's live position at that moment.
 */
export class ExecutionQueue {
  /**
   * Recursively flatten a (possibly nested) action tree into a plain array.
   * repetir nodes are expanded inline. se nodes are kept as-is so they can be
   * evaluated at runtime during the tick loop.
   *
   * @param {Array} actions - Output of CommandParser / ConditionalCommandParser.
   * @returns {Array} Flat list with repetir expanded and se nodes preserved.
   */
  flattenActions(actions) {
    const flat = [];
    for (const item of actions) {
      if (item.action === 'repetir') {
        for (let i = 0; i < item.count; i++) {
          flat.push(...this.flattenActions(item.commands));
        }
      } else {
        flat.push(item);
      }
    }
    return flat;
  }

  /**
   * Start the tick loop for the given action list.
   * Reads the hero's current state from GameStateManager before each step so
   * that state accumulated across ticks is always respected.
   *
   * se nodes are evaluated at the moment they reach the front of the execution
   * queue: the correct branch is expanded inline and processed on subsequent
   * ticks. This means the sensor reading is always based on the hero's actual
   * position at that point in time.
   *
   * Halts and resets the hero if an `andar` action would move into an obstacle.
   * Halts silently if the hero would leave the grid.
   * After the final action, checks if the hero reached the goal and calls the
   * appropriate callback.
   *
   * @param {Array}    actions      - Parsed action array (may contain repetir/se nodes).
   * @param {object}   nivel        - Loaded level data (gridSize, goal, obstacles).
   * @param {number}   [tickMs=500] - Milliseconds between ticks.
   * @param {Function} [onSuccess]  - Called when the hero reaches the goal.
   * @param {Function} [onFailure]  - Called when the hero collides with an obstacle.
   */
  startTickLoop(actions, nivel, tickMs = 500, onSuccess, onFailure) {
    const { gridSize, goal, obstacles } = nivel;
    const obstacleSet = new Set(obstacles.map((o) => `${o.x},${o.y}`));
    const sensorService = new SensorService();

    // Pre-expand repetir blocks; se nodes remain as lazy nodes for runtime eval
    const queue = [...this.flattenActions(actions)];

    const step = () => {
      // Evaluate and expand any se nodes at the front of the queue.
      // No tick delay is consumed: condition check is instantaneous.
      while (queue.length > 0 && queue[0].action === 'se') {
        const seNode = queue.shift();
        const conditionResult = sensorService.evaluate(seNode.condition, nivel);
        const branch = conditionResult ? seNode.commands : (seNode.elseCommands ?? []);
        // Flatten repetir inside the chosen branch before inserting
        queue.unshift(...this.flattenActions(branch));
      }

      if (queue.length === 0) {
        const { x, y } = gameStateManager.heroi;
        if (x === goal.x && y === goal.y) {
          onSuccess?.();
        }
        return;
      }

      const { x, y, direcao } = gameStateManager.heroi;
      const { action } = queue.shift();

      let newX = x;
      let newY = y;
      let newDirecao = direcao;

      if (action === 'andar') {
        if (direcao === 'Leste')  newX = x + 1;
        if (direcao === 'Oeste')  newX = x - 1;
        if (direcao === 'Sul')    newY = y + 1;
        if (direcao === 'Norte')  newY = y - 1;

        // Halt silently if the hero would leave the grid
        if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) return;

        // Halt and reset if the hero would enter an obstacle cell
        if (obstacleSet.has(`${newX},${newY}`)) {
          gameStateManager.resetHeroi();
          onFailure?.();
          return;
        }
      } else if (action === 'virarDireita') {
        newDirecao = TURN_RIGHT[direcao];
      } else if (action === 'virarEsquerda') {
        newDirecao = TURN_LEFT[direcao];
      }

      gameStateManager.moverHeroi({ x: newX, y: newY, direcao: newDirecao });
      setTimeout(step, tickMs);
    };

    step();
  }
}
