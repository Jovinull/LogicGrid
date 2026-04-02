/**
 * Entity
 * Represents any actor that can be placed on the logic grid.
 *
 * Properties:
 *   id       {string} - Unique identifier for the entity.
 *   x        {number} - Column index (0-based, left→right).
 *   y        {number} - Row index (0-based, top→bottom).
 *   direcao  {string} - Cardinal direction the entity faces: 'Norte'|'Sul'|'Leste'|'Oeste'.
 *   cor      {string} - CSS colour used to render the entity on the canvas.
 */
export class Entity {
  /**
   * @param {string} id
   * @param {number} x
   * @param {number} y
   * @param {string} direcao
   * @param {string} cor
   */
  constructor(id, x, y, direcao, cor) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.direcao = direcao;
    this.cor = cor;
  }
}
