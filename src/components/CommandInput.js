import React, { useState } from 'react';
import { CommandParser } from '../services/CommandParser';

const parser = new CommandParser();

/**
 * CommandInput
 * Renders a textarea for the user to type commands and a submit button.
 * Parses the input with CommandParser and calls onSubmit(actions) on success.
 * Displays an inline error message if a SyntaxError is detected.
 *
 * Props:
 *   onSubmit {Function} - Called with the parsed action array when valid.
 */
function CommandInput({ onSubmit }) {
  const [text, setText] = useState('');
  const [error, setError] = useState(null);

  function handleSubmit() {
    setError(null);
    try {
      const actions = parser.parseCommands(text);
      onSubmit(actions);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.wrapper}>
      <label style={styles.label} htmlFor="command-input">
        Comandos
      </label>
      <textarea
        id="command-input"
        style={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'andar()\nvirarDireita()\nandar()'}
        rows={10}
        spellCheck={false}
      />
      {error && <div style={styles.error}>{error}</div>}
      <button style={styles.button} onClick={handleSubmit}>
        Executar
      </button>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
    minWidth: '220px',
    maxWidth: '320px',
    boxSizing: 'border-box',
  },
  label: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#333',
  },
  textarea: {
    fontFamily: 'monospace',
    fontSize: '14px',
    padding: '8px',
    border: '1px solid #CCCCCC',
    borderRadius: '4px',
    resize: 'vertical',
    outline: 'none',
    lineHeight: '1.5',
  },
  error: {
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#D32F2F',
    backgroundColor: '#FFEBEE',
    border: '1px solid #EF9A9A',
    borderRadius: '4px',
    padding: '6px 8px',
    whiteSpace: 'pre-wrap',
  },
  button: {
    fontFamily: 'monospace',
    fontSize: '14px',
    padding: '8px 16px',
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default CommandInput;
