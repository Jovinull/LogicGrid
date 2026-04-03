'use client';

import React, { useState, useEffect } from 'react';
import { getSolutions } from '../app/actions';

/**
 * SolutionHistory
 * Lists the last 5 submitted solutions for the current phase.
 * Clicking a solution will call onSelect(codeText).
 */
function SolutionHistory({ levelId, onSelect, refreshTrigger }) {
  const [solutions, setSolutions] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await getSolutions(levelId);
      setSolutions(data);
    }
    load();
  }, [levelId, refreshTrigger]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Recordes</h3>
      {solutions.length === 0 && <p style={styles.empty}>Nenhum recorde ainda.</p>}
      <ul style={styles.list}>
        {solutions.map((s) => (
          <li key={s.id} style={styles.item} onClick={() => onSelect(s.codeText)} title="Clique para recarregar">
            <div style={styles.header}>
              <span style={styles.userName}>{s.userName}</span>
              <span style={styles.stars}>{'⭐'.repeat(s.stars)}</span>
            </div>
            <div style={styles.date}>{new Date(s.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    padding: '16px',
    backgroundColor: '#F9F9F9',
    borderLeft: '1px solid #EEE',
    minWidth: '200px',
    height: '100%',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  title: {
    fontFamily: 'monospace',
    fontSize: '16px',
    margin: '0 0 12px 0',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  item: {
    padding: '8px',
    marginBottom: '8px',
    backgroundColor: '#FFF',
    border: '1px solid #DDD',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background-color 0.2s',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  userName: {
    fontWeight: 'bold',
  },
  stars: {
    color: '#FFB300',
  },
  date: {
    color: '#888',
    fontSize: '10px',
  },
  empty: {
    fontSize: '12px',
    color: '#888',
    fontStyle: 'italic',
  }
};

export default SolutionHistory;
