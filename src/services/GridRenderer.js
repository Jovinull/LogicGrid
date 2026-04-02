/**
 * GridRenderer
 * Responsible for rendering the logic grid onto an HTML5 Canvas 2D context.
 */
export class GridRenderer {
  /** Background color for each cell */
  static CELL_BACKGROUND = '#FFFFFF';

  /** Border color for each cell */
  static CELL_BORDER = '#CCCCCC';

  /** Fill color for obstacle cells */
  static OBSTACLE_COLOR = '#424242';

  /** Fill color for the goal cell */
  static GOAL_COLOR = '#4CAF50';

  /**
   * Renders the full grid onto the given Canvas 2D context.
   *
   * @param {CanvasRenderingContext2D} ctx            - The 2D rendering context of the canvas element.
   * @param {number}                  tamanhoDoGrid   - Number of cells per side (e.g. 5 → 5×5 grid).
   * @param {number}                  tamanhoDaCelula - Pixel size of each individual cell.
   * @param {import('../models/Entity').Entity|null} heroi - Hero entity to draw, or null to skip.
   * @param {object|null} nivel        - Loaded level data (obstacles, goal), or null.
   * @param {boolean}     blinkVisible - Whether the goal is visible in the current blink frame.
   */
  renderGrid(ctx, tamanhoDoGrid, tamanhoDaCelula, heroi = null, nivel = null, blinkVisible = true) {
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

    if (nivel) {
      this._drawObstacles(ctx, nivel.obstacles, tamanhoDaCelula);
      this._drawGoal(ctx, nivel.goal, tamanhoDaCelula, blinkVisible);
    }

    if (heroi) {
      this._drawHeroi(ctx, heroi, tamanhoDaCelula);
    }
  }

  /**
   * Draws each obstacle cell as a solid dark-gray square.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {Array<{x: number, y: number}>} obstacles
   * @param {number} tamanhoDaCelula
   */
  _drawObstacles(ctx, obstacles, tamanhoDaCelula) {
    ctx.fillStyle = GridRenderer.OBSTACLE_COLOR;
    for (const obs of obstacles) {
      ctx.fillRect(
        obs.x * tamanhoDaCelula,
        obs.y * tamanhoDaCelula,
        tamanhoDaCelula,
        tamanhoDaCelula
      );
    }
  }

  /**
   * Draws the goal cell as a green square with a small inset padding.
   * When blinkVisible is false the cell is skipped, producing a blink effect.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {{x: number, y: number}} goal
   * @param {number} tamanhoDaCelula
   * @param {boolean} blinkVisible
   */
  _drawGoal(ctx, goal, tamanhoDaCelula, blinkVisible) {
    if (!blinkVisible) return;
    const padding = tamanhoDaCelula * 0.1;
    ctx.fillStyle = GridRenderer.GOAL_COLOR;
    ctx.fillRect(
      goal.x * tamanhoDaCelula + padding,
      goal.y * tamanhoDaCelula + padding,
      tamanhoDaCelula - padding * 2,
      tamanhoDaCelula - padding * 2
    );
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
