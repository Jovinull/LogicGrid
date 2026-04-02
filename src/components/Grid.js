import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GridRenderer } from '../services/GridRenderer';
import { gameStateManager } from '../stores/GameStateManager';
import CommandInput from './CommandInput';

const gridRenderer = new GridRenderer();

/**
 * Grid
 * React component that renders a square logic-grid using HTML5 Canvas.
 *
 * Props:
 *   tamanhoDoGrid  {number} - Number of cells per side (default: 8)
 *   tamanhoDaCelula {number} - Pixel size of each cell before responsive scaling (default: 60)
 */
// Direction helpers for action execution
const TURN_RIGHT = { Norte: 'Leste', Leste: 'Sul', Sul: 'Oeste', Oeste: 'Norte' };
const TURN_LEFT  = { Norte: 'Oeste', Oeste: 'Sul', Sul: 'Leste', Leste: 'Norte' };

function executeActions(actions, gridSize) {
  let { x, y, direcao } = gameStateManager.heroi;

  for (const { action } of actions) {
    if (action === 'andar') {
      if (direcao === 'Leste')  x = Math.min(x + 1, gridSize - 1);
      if (direcao === 'Oeste')  x = Math.max(x - 1, 0);
      if (direcao === 'Sul')    y = Math.min(y + 1, gridSize - 1);
      if (direcao === 'Norte')  y = Math.max(y - 1, 0);
    } else if (action === 'virarDireita') {
      direcao = TURN_RIGHT[direcao];
    } else if (action === 'virarEsquerda') {
      direcao = TURN_LEFT[direcao];
    }
  }

  gameStateManager.moverHeroi({ x, y, direcao });
}

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
    <div style={styles.outer}>
      <div ref={containerRef} style={styles.container}>
        <canvas ref={canvasRef} style={styles.canvas} />
      </div>
      <CommandInput onSubmit={(actions) => executeActions(actions, tamanhoDoGrid)} />
    </div>
  );
}

const styles = {
  outer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 1 auto',
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
