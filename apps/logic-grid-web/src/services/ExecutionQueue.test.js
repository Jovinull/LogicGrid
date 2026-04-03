import { describe, it, expect } from 'vitest';
import { ExecutionQueue } from './ExecutionQueue';

const queue = new ExecutionQueue();

// ---------------------------------------------------------------------------
// flattenActions
// ---------------------------------------------------------------------------
describe('ExecutionQueue.flattenActions', () => {
  it('returns simple actions unchanged', () => {
    const actions = [{ action: 'andar' }, { action: 'virarDireita' }];
    expect(queue.flattenActions(actions)).toEqual(actions);
  });

  it('expands a repetir(3) block into 3 copies of its inner commands', () => {
    const actions = [
      { action: 'repetir', count: 3, commands: [{ action: 'andar' }] },
    ];
    expect(queue.flattenActions(actions)).toEqual([
      { action: 'andar' },
      { action: 'andar' },
      { action: 'andar' },
    ]);
  });

  it('expands repetir(4) { andar(); virarDireita() } into 8 actions', () => {
    const actions = [
      {
        action: 'repetir',
        count: 4,
        commands: [{ action: 'andar' }, { action: 'virarDireita' }],
      },
    ];
    const flat = queue.flattenActions(actions);
    expect(flat).toHaveLength(8);
    // Pattern should repeat: andar, virarDireita x4
    for (let i = 0; i < 4; i++) {
      expect(flat[i * 2]).toEqual({ action: 'andar' });
      expect(flat[i * 2 + 1]).toEqual({ action: 'virarDireita' });
    }
  });

  it('expands nested repetir blocks correctly', () => {
    // repetir(2) { repetir(3) { andar() } } => 6x andar
    const actions = [
      {
        action: 'repetir',
        count: 2,
        commands: [
          {
            action: 'repetir',
            count: 3,
            commands: [{ action: 'andar' }],
          },
        ],
      },
    ];
    const flat = queue.flattenActions(actions);
    expect(flat).toHaveLength(6);
    expect(flat.every((a) => a.action === 'andar')).toBe(true);
  });

  it('returns empty array for repetir(0)', () => {
    const actions = [
      { action: 'repetir', count: 0, commands: [{ action: 'andar' }] },
    ];
    expect(queue.flattenActions(actions)).toEqual([]);
  });

  it('handles mixed simple and repetir actions', () => {
    const actions = [
      { action: 'andar' },
      { action: 'repetir', count: 2, commands: [{ action: 'virarDireita' }] },
      { action: 'andar' },
    ];
    expect(queue.flattenActions(actions)).toEqual([
      { action: 'andar' },
      { action: 'virarDireita' },
      { action: 'virarDireita' },
      { action: 'andar' },
    ]);
  });

  it('produces the correct sequence for a perfect square path', () => {
    // repetir(4) { andar(); virarDireita() } should trace a square
    const actions = [
      {
        action: 'repetir',
        count: 4,
        commands: [{ action: 'andar' }, { action: 'virarDireita' }],
      },
    ];
    const flat = queue.flattenActions(actions);
    expect(flat).toHaveLength(8);
    const expected = Array.from({ length: 4 }, () => [
      { action: 'andar' },
      { action: 'virarDireita' },
    ]).flat();
    expect(flat).toEqual(expected);
  });
});
