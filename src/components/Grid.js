import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GridRenderer } from '../services/GridRenderer';
import { gameStateManager } from '../stores/GameStateManager';
import { levels } from '../levels/levels';
import CommandInput from './CommandInput';
import GameControlButtons from './GameControlButtons';

const gridRenderer = new GridRenderer();

// Load Level 1 immediately so the singleton has the correct initial state
const NIVEL = levels[0];
gameStateManager.loadLevel(NIVEL);

/**
 * Grid
 * React component that renders a square logic-grid using HTML5 Canvas.
 * Loads Level 1 on mount, renders obstacles and a blinking goal, and displays
 * a status message when the player wins or collides with an obstacle.
 *
 * Props:
 *   tamanhoDaCelula {number} - Max pixel size of each cell before responsive scaling (default: 100)
 */
function Grid({ tamanhoDaCelula = 100 }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Mirror the hero state so React re-renders when it changes
  const [heroi, setHeroi] = useState(() => ({ ...gameStateManager.heroi }));

  // Holds the last successfully parsed actions, ready for execution
  const [pendingActions, setPendingActions] = useState([]);

  // Toggles every 500 ms to produce the goal blink effect
  const [blinkVisible, setBlinkVisible] = useState(true);

  // 'success' | 'failure' | null
  const [gameResult, setGameResult] = useState(null);

  // Subscribe to GameStateManager updates
  useEffect(() => {
    const unsubscribe = gameStateManager.subscribe((state) => {
      setHeroi({ ...state.heroi });
    });
    return unsubscribe;
  }, []);

  // Blink interval — toggles goal visibility at 500 ms
  useEffect(() => {
    const id = setInterval(() => setBlinkVisible((v) => !v), 500);
    return () => clearInterval(id);
  }, []);

  /**
   * Computes the largest cell size that keeps the grid square and fits inside
   * the current container while respecting tamanhoDaCelula as a maximum.
   */
  const calcCellSize = useCallback(() => {
    if (!containerRef.current) return tamanhoDaCelula;
    const { clientWidth, clientHeight } = containerRef.current;
    const available = Math.min(clientWidth, clientHeight);
    return Math.min(tamanhoDaCelula, Math.floor(available / NIVEL.gridSize));
  }, [tamanhoDaCelula]);

  /** Resize the canvas element and repaint the grid. */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cellSize = calcCellSize();
    const totalSize = NIVEL.gridSize * cellSize;

    canvas.width = totalSize;
    canvas.height = totalSize;

    const ctx = canvas.getContext('2d');
    gridRenderer.renderGrid(ctx, NIVEL.gridSize, cellSize, heroi, NIVEL, blinkVisible);
  }, [calcCellSize, heroi, blinkVisible]);

  // Redraw whenever hero state, blink phase, or layout changes
  useEffect(() => {
    draw();

    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  function handleExecute(actions) {
    setGameResult(null);
    setPendingActions(actions);
  }

  return (
    <div style={styles.outer}>
      <div ref={containerRef} style={styles.container}>
        <canvas ref={canvasRef} style={styles.canvas} />
      </div>
      <div style={styles.sidebar}>
        <div style={styles.levelBadge}>Fase {NIVEL.id}</div>
        <CommandInput onExecute={handleExecute} />
        <GameControlButtons
          parsedActions={pendingActions}
          nivel={NIVEL}
          onSuccess={() => setGameResult('success')}
          onFailure={() => setGameResult('failure')}
        />
        {gameResult === 'success' && (
          <div style={styles.resultSuccess}>Fase Concluída!</div>
        )}
        {gameResult === 'failure' && (
          <div style={styles.resultFailure}>Obstáculo! Herói resetado.</div>
        )}
      </div>
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
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
  },
  levelBadge: {
    fontFamily: 'monospace',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#555',
  },
  resultSuccess: {
    fontFamily: 'monospace',
    fontSize: '14px',
    padding: '8px 12px',
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    border: '1px solid #A5D6A7',
    borderRadius: '4px',
  },
  resultFailure: {
    fontFamily: 'monospace',
    fontSize: '14px',
    padding: '8px 12px',
    backgroundColor: '#FFEBEE',
    color: '#C62828',
    border: '1px solid #EF9A9A',
    borderRadius: '4px',
  },
};

export default Grid;
