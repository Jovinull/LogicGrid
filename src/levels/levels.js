/**
 * Level definitions for LogicGrid.
 *
 * Each level schema:
 *   id        {number}   - Unique level identifier.
 *   gridSize  {number}   - Number of cells per side (square grid).
 *   start     {object}   - Hero spawn: { x, y, dir } where dir is 'Norte'|'Sul'|'Leste'|'Oeste'.
 *   goal      {object}   - Win cell: { x, y }.
 *   obstacles {object[]} - Impassable cells: [{ x, y }, ...].
 */
export const levels = [
  {
    id: 1,
    gridSize: 5,
    start: { x: 0, y: 0, dir: 'Leste' },
    goal: { x: 4, y: 4 },
    obstacles: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
    ],
  },
];
