import { describe, it, expect } from 'vitest';
import { CommandParser } from './CommandParser';

const parser = new CommandParser();

// ---------------------------------------------------------------------------
// Simple commands (regression — existing behaviour must still work)
// ---------------------------------------------------------------------------
describe('CommandParser — simple commands', () => {
  it('parses a single andar()', () => {
    expect(parser.parseCommands('andar()')).toEqual([{ action: 'andar' }]);
  });

  it('parses multiple commands separated by newlines', () => {
    const result = parser.parseCommands('andar()\nvirarDireita()\nvirarEsquerda()');
    expect(result).toEqual([
      { action: 'andar' },
      { action: 'virarDireita' },
      { action: 'virarEsquerda' },
    ]);
  });

  it('ignores blank lines', () => {
    expect(parser.parseCommands('\n\nandar()\n\n')).toEqual([{ action: 'andar' }]);
  });

  it('handles commands separated by semicolons', () => {
    expect(parser.parseCommands('andar(); virarDireita()')).toEqual([
      { action: 'andar' },
      { action: 'virarDireita' },
    ]);
  });

  it('throws SyntaxError for unknown command', () => {
    expect(() => parser.parseCommands('pular()')).toThrow(SyntaxError);
    expect(() => parser.parseCommands('pular()')).toThrow('pular()');
  });

  it('throws SyntaxError for malformed token', () => {
    expect(() => parser.parseCommands('andar')).toThrow(SyntaxError);
  });
});

// ---------------------------------------------------------------------------
// repetir blocks
// ---------------------------------------------------------------------------
describe('CommandParser — repetir(n) { ... }', () => {
  it('parses a single repetir block (inline)', () => {
    const result = parser.parseCommands('repetir(3) { andar() }');
    expect(result).toEqual([
      {
        action: 'repetir',
        count: 3,
        commands: [{ action: 'andar' }],
      },
    ]);
  });

  it('parses a repetir block with multiple inner commands', () => {
    const result = parser.parseCommands('repetir(4) { andar(); virarDireita() }');
    expect(result).toEqual([
      {
        action: 'repetir',
        count: 4,
        commands: [{ action: 'andar' }, { action: 'virarDireita' }],
      },
    ]);
  });

  it('parses a repetir block spread across multiple lines', () => {
    const input = `repetir(2) {\n  andar()\n  virarEsquerda()\n}`;
    const result = parser.parseCommands(input);
    expect(result).toEqual([
      {
        action: 'repetir',
        count: 2,
        commands: [{ action: 'andar' }, { action: 'virarEsquerda' }],
      },
    ]);
  });

  it('parses nested repetir blocks', () => {
    const input = 'repetir(2) { repetir(3) { andar() } }';
    const result = parser.parseCommands(input);
    expect(result).toEqual([
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
    ]);
  });

  it('parses commands before and after a repetir block', () => {
    const input = 'andar()\nrepetir(2) { virarDireita() }\nandar()';
    const result = parser.parseCommands(input);
    expect(result).toEqual([
      { action: 'andar' },
      { action: 'repetir', count: 2, commands: [{ action: 'virarDireita' }] },
      { action: 'andar' },
    ]);
  });

  it('parses repetir(0) with empty result (no iterations)', () => {
    const result = parser.parseCommands('repetir(0) { andar() }');
    expect(result).toEqual([
      { action: 'repetir', count: 0, commands: [{ action: 'andar' }] },
    ]);
  });
});

// ---------------------------------------------------------------------------
// Error cases
// ---------------------------------------------------------------------------
describe('CommandParser — error cases', () => {
  it('throws SyntaxError when repetir block is not closed', () => {
    expect(() => parser.parseCommands('repetir(2) { andar()')).toThrow(SyntaxError);
    expect(() => parser.parseCommands('repetir(2) { andar()')).toThrow('não foi fechado');
  });

  it('throws SyntaxError when "{" appears without repetir', () => {
    expect(() => parser.parseCommands('{ andar() }')).toThrow(SyntaxError);
    expect(() => parser.parseCommands('{ andar() }')).toThrow('"{"');
  });

  it('throws SyntaxError for stray closing brace', () => {
    expect(() => parser.parseCommands('andar() }')).toThrow(SyntaxError);
    expect(() => parser.parseCommands('andar() }')).toThrow('"}"');
  });

  it('throws SyntaxError when repetir is missing opening brace', () => {
    expect(() => parser.parseCommands('repetir(2) andar()')).toThrow(SyntaxError);
    expect(() => parser.parseCommands('repetir(2) andar()')).toThrow('esperado "{"');
  });

  it('throws SyntaxError for unknown command inside a block', () => {
    expect(() => parser.parseCommands('repetir(2) { pular() }')).toThrow(SyntaxError);
    expect(() => parser.parseCommands('repetir(2) { pular() }')).toThrow('pular()');
  });
});
