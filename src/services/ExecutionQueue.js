import { gameStateManager } from '../stores/GameStateManager';

const TURN_RIGHT = { Norte: 'Leste', Leste: 'Sul', Sul: 'Oeste', Oeste: 'Norte' };
const TURN_LEFT  = { Norte: 'Oeste', Oeste: 'Sul', Sul: 'Leste', Leste: 'Norte' };

/**
 * ExecutionQueue
 * Executes an array of parsed actions one at a time, with a fixed delay between
 * each step, updating GameStateManager after every action so the canvas redraws
 * incrementally (tick-based animation).
 */
export class ExecutionQueue {
  /**
   * Start the tick loop for the given action list.
   * Reads the hero's current state from GameStateManager before each step so
   * that state accumulated across ticks is always respected.
   *
   * Halts immediately if an `andar` action would move the hero outside the grid.
   *
   * @param {Array<{action: string}>} actions - Parsed action array from CommandParser.
   * @param {number} gridSize - Number of cells per side of the grid.
   * @param {number} [tickMs=500] - Milliseconds between ticks.
   */
  startTickLoop(actions, gridSize, tickMs = 500) {
    const step = (index) => {
      if (index >= actions.length) return;

      const { x, y, direcao } = gameStateManager.heroi;
      const { action } = actions[index];

      let newX = x;
      let newY = y;
      let newDirecao = direcao;

      if (action === 'andar') {
        if (direcao === 'Leste')  newX = x + 1;
        if (direcao === 'Oeste')  newX = x - 1;
        if (direcao === 'Sul')    newY = y + 1;
        if (direcao === 'Norte')  newY = y - 1;

        // Stop the loop when the hero would leave the grid
        if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) return;
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
