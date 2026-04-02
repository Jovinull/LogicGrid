/**
 * GridRenderer
 * Responsible for rendering the logic grid onto an HTML5 Canvas 2D context.
 */
export class GridRenderer {
  /** Background color for each cell */
  static CELL_BACKGROUND = '#FFFFFF';

  /** Border color for each cell */
  static CELL_BORDER = '#CCCCCC';

  /**
   * Renders the full grid onto the given Canvas 2D context.
   *
   * @param {CanvasRenderingContext2D} ctx            - The 2D rendering context of the canvas element.
   * @param {number}                  tamanhoDoGrid   - Number of cells per side (e.g. 5 → 5×5 grid).
   * @param {number}                  tamanhoDaCelula - Pixel size of each individual cell.
   * @param {import('../models/Entity').Entity|null} heroi - Hero entity to draw, or null to skip.
   */
  renderGrid(ctx, tamanhoDoGrid, tamanhoDaCelula, heroi = null) {
    const totalSize = tamanhoDoGrid * tamanhoDaCelula;

    // Clear the canvas area that the grid will occupy
    ctx.clearRect(0, 0, totalSize, totalSize);

    for (let row = 0; row < tamanhoDoGrid; row++) {
      for (let col = 0; col < tamanhoDoGrid; col++) {
        const x = col * tamanhoDaCelula;
        const y = row * tamanhoDaCelula;

        // Fill cell background
        ctx.fillStyle = GridRenderer.CELL_BACKGROUND;
        ctx.fillRect(x, y, tamanhoDaCelula, tamanhoDaCelula);

        // Draw subtle cell border
        ctx.strokeStyle = GridRenderer.CELL_BORDER;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, tamanhoDaCelula, tamanhoDaCelula);
      }
    }

    if (heroi) {
      this._drawHeroi(ctx, heroi, tamanhoDaCelula);
    }
  }

  /**
   * Draws the hero entity inside its grid cell, including a directional
   * triangle that indicates which way the hero is facing.
   *
   * The triangle is drawn as an equilateral-ish arrow pointing in the hero's
   * direction (Norte / Sul / Leste / Oeste).
   *
   * @param {CanvasRenderingContext2D}              ctx
   * @param {import('../models/Entity').Entity}     heroi
   * @param {number}                               tamanhoDaCelula
   */
  _drawHeroi(ctx, heroi, tamanhoDaCelula) {
    const cellX = heroi.x * tamanhoDaCelula;
    const cellY = heroi.y * tamanhoDaCelula;
    const cx = cellX + tamanhoDaCelula / 2;
    const cy = cellY + tamanhoDaCelula / 2;

    // Circle that fills ~60 % of the cell
    const radius = (tamanhoDaCelula / 2) * 0.6;

    ctx.fillStyle = heroi.cor;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Directional triangle — sits inside the circle, points outward
    const triSize = radius * 0.55;

    // Rotation angle (radians) per cardinal direction
    const angles = {
      Leste: 0,
      Sul: Math.PI / 2,
      Oeste: Math.PI,
      Norte: -Math.PI / 2,
    };
    const angle = angles[heroi.direcao] ?? 0;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Triangle pointing right (Leste) before rotation
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(triSize, 0);           // tip
    ctx.lineTo(-triSize * 0.6, -triSize * 0.6); // top-left
    ctx.lineTo(-triSize * 0.6, triSize * 0.6);  // bottom-left
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
