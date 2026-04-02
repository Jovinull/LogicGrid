import React from 'react';
import { ExecutionQueue } from '../services/ExecutionQueue';

const executionQueue = new ExecutionQueue();

/**
 * GameControlButtons
 * Renders the game control actions. Includes an "Executar Código" button that
 * starts the tick-based execution loop for the previously parsed actions.
 *
 * Props:
 *   parsedActions {Array<{action: string}>} - Actions returned by CommandParser.
 *   nivel         {object}                  - Loaded level data (gridSize, goal, obstacles).
 *   onSuccess     {Function}                - Called when the hero reaches the goal.
 *   onFailure     {Function}                - Called when the hero hits an obstacle.
 */
function GameControlButtons({ parsedActions, nivel, onSuccess, onFailure }) {
  function handleExecute() {
    if (!parsedActions || parsedActions.length === 0 || !nivel) return;
    executionQueue.startTickLoop(parsedActions, nivel, 500, onSuccess, onFailure);
  }

  return (
    <button style={styles.button} onClick={handleExecute}>
      Executar Código
    </button>
  );
}

const styles = {
  button: {
    fontFamily: 'monospace',
    fontSize: '14px',
    padding: '8px 16px',
    backgroundColor: '#2E7D32',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default GameControlButtons;
