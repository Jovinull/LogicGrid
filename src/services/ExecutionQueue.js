import { gameStateManager } from '../stores/GameStateManager';

const TURN_RIGHT = { Norte: 'Leste', Leste: 'Sul', Sul: 'Oeste', Oeste: 'Norte' };
const TURN_LEFT  = { Norte: 'Oeste', Oeste: 'Sul', Sul: 'Leste', Leste: 'Norte' };

/**
 * ExecutionQueue
 * Executes an array of parsed actions one at a time, with a fixed delay between
 * each step, updating GameStateManager after every action so the canvas redraws
 * incrementally (tick-based animation).
 *
 * Supports repetir(n) { ... } blocks by flattening them into a linear action
 * list before execution begins, so the tick loop stays simple and non-blocking.
 */
export class ExecutionQueue {
  /**
   * Recursively flatten a (possibly nested) action tree into a plain array of
   * simple actions. repetir nodes are expanded inline.
   *
   * @param {Array} actions - Output of CommandParser.parseCommands().
   * @returns {Array<{action: string}>} Flat list of simple action objects.
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
   * Halts and resets the hero if an `andar` action would move into an obstacle.
   * Halts if the hero would leave the grid.
   * After the final action, checks if the hero reached the goal and calls the
   * appropriate callback.
   *
   * @param {Array}    actions      - Parsed action array from CommandParser (may contain repetir nodes).
   * @param {object}   nivel        - Loaded level data (gridSize, goal, obstacles).
   * @param {number}   [tickMs=500] - Milliseconds between ticks.
   * @param {Function} [onSuccess]  - Called when the hero reaches the goal.
   * @param {Function} [onFailure]  - Called when the hero collides with an obstacle.
   */
  startTickLoop(actions, nivel, tickMs = 500, onSuccess, onFailure) {
    const { gridSize, goal, obstacles } = nivel;

    // Expand repetir blocks into a flat sequence before the tick loop starts
    const flatActions = this.flattenActions(actions);

    // Build a fast lookup set: "x,y" strings for O(1) collision tests
    const obstacleSet = new Set(obstacles.map((o) => `${o.x},${o.y}`));

    const step = (index) => {
      if (index >= flatActions.length) {
        // All actions consumed — check win condition
        const { x, y } = gameStateManager.heroi;
        if (x === goal.x && y === goal.y) {
          onSuccess?.();
        }
        return;
      }

      const { x, y, direcao } = gameStateManager.heroi;
      const { action } = flatActions[index];

      let newX = x;
      let newY = y;
      let newDirecao = direcao;

      if (action === 'andar') {
        if (direcao === 'Leste')  newX = x + 1;
        if (direcao === 'Oeste')  newX = x - 1;
        if (direcao === 'Sul')    newY = y + 1;
        if (direcao === 'Norte')  newY = y - 1;

        // Halt if the hero would leave the grid
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
      setTimeout(() => step(index + 1), tickMs);
    };

    step(0);
  }
}
