import { gameStateManager } from '../stores/GameStateManager';

/**
 * SensorService
 * Provides runtime sensor functions that query the current game state to allow
 * the hero to "perceive" the map. All functions read the live state from
 * GameStateManager so they reflect the hero's position at the exact moment
 * they are called (i.e. at tick time).
 */
export class SensorService {
  /**
   * Returns true if the cell directly ahead of the hero is within the grid
   * and contains no obstacle.
   *
   * @param {object} nivel - Loaded level data (gridSize, obstacles).
   * @returns {boolean}
   */
  caminhoLivre(nivel) {
    const { x, y, direcao } = gameStateManager.heroi;
    const { gridSize, obstacles } = nivel;
    const obstacleSet = new Set(obstacles.map((o) => `${o.x},${o.y}`));

    let nx = x;
    let ny = y;
    if (direcao === 'Leste')  nx = x + 1;
    if (direcao === 'Oeste')  nx = x - 1;
    if (direcao === 'Sul')    ny = y + 1;
    if (direcao === 'Norte')  ny = y - 1;

    if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) return false;
    return !obstacleSet.has(`${nx},${ny}`);
  }

  /**
   * Returns true if the hero's current cell matches the level's goal cell.
   *
   * @param {object} nivel - Loaded level data (goal).
   * @returns {boolean}
   */
  sobreObjetivo(nivel) {
    const { x, y } = gameStateManager.heroi;
    const { goal } = nivel;
    return x === goal.x && y === goal.y;
  }

  /**
   * Returns true if the cell directly ahead is a wall (grid boundary) or
   * an obstacle — i.e. the path is blocked.
   *
   * @param {object} nivel - Loaded level data.
   * @returns {boolean}
   */
  temParede(nivel) {
    return !this.caminhoLivre(nivel);
  }

  /**
   * Evaluate a named sensor condition against the current game state.
   *
   * @param {string} conditionName - One of 'caminhoLivre', 'sobreObjetivo', 'temParede'.
   * @param {object} nivel         - Loaded level data.
   * @returns {boolean}
   * @throws {Error} If the condition name is not recognised.
   */
  evaluate(conditionName, nivel) {
    switch (conditionName) {
      case 'caminhoLivre':  return this.caminhoLivre(nivel);
      case 'sobreObjetivo': return this.sobreObjetivo(nivel);
      case 'temParede':     return this.temParede(nivel);
      default:
        throw new Error(`Sensor desconhecido: "${conditionName}"`);
    }
  }
}
