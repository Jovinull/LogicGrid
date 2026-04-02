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
   * @param {CanvasRenderingContext2D} ctx       - The 2D rendering context of the canvas element.
   * @param {number}                  tamanhoDoGrid  - Number of cells per side (e.g. 5 → 5×5 grid).
   * @param {number}                  tamanhoDaCelula - Pixel size of each individual cell.
   */
  renderGrid(ctx, tamanhoDoGrid, tamanhoDaCelula) {
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
  }
}
