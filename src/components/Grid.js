import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GridRenderer } from '../services/GridRenderer';
import { gameStateManager } from '../stores/GameStateManager';

const gridRenderer = new GridRenderer();

/**
 * Grid
 * React component that renders a square logic-grid using HTML5 Canvas.
 *
 * Props:
 *   tamanhoDoGrid  {number} - Number of cells per side (default: 8)
 *   tamanhoDaCelula {number} - Pixel size of each cell before responsive scaling (default: 60)
 */
function Grid({ tamanhoDoGrid = 8, tamanhoDaCelula = 60 }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Mirror the hero state so React re-renders when it changes
  const [heroi, setHeroi] = useState(() => gameStateManager.heroi);

  // Subscribe to GameStateManager updates
  useEffect(() => {
    const unsubscribe = gameStateManager.subscribe((state) => {
      // Spread to produce a new object reference and trigger re-render
      setHeroi({ ...state.heroi });
    });
    return unsubscribe;
  }, []);

  /**
   * Computes the largest cell size that keeps the grid square and fits inside
   * the current container while respecting the requested cell size as a
   * maximum.  Returns the adjusted cell size.
   */
  const calcCellSize = useCallback(() => {
    if (!containerRef.current) return tamanhoDaCelula;
    const { clientWidth, clientHeight } = containerRef.current;
    const available = Math.min(clientWidth, clientHeight);
    // Never exceed the requested cell size; shrink to fit if needed
    return Math.min(tamanhoDaCelula, Math.floor(available / tamanhoDoGrid));
  }, [tamanhoDoGrid, tamanhoDaCelula]);

  /** Resize the canvas element and repaint the grid. */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cellSize = calcCellSize();
    const totalSize = tamanhoDoGrid * cellSize;

    // Keep the canvas bitmap in sync with the computed size
    canvas.width = totalSize;
    canvas.height = totalSize;

    const ctx = canvas.getContext('2d');
    gridRenderer.renderGrid(ctx, tamanhoDoGrid, cellSize, heroi);
  }, [tamanhoDoGrid, calcCellSize, heroi]);

  // Redraw whenever hero state or layout changes
  useEffect(() => {
    draw();

    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  return (
    <div ref={containerRef} style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  canvas: {
    display: 'block',
    // Aspect ratio is maintained via canvas.width/height set in draw()
  },
};

export default Grid;
