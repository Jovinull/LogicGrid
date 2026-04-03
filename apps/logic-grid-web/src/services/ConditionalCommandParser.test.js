import { describe, it, expect } from 'vitest';
import { ConditionalCommandParser } from './ConditionalCommandParser';

const parser = new ConditionalCommandParser();

// ---------------------------------------------------------------------------
// Backward compatibility — existing commands must still parse correctly
// ---------------------------------------------------------------------------
describe('ConditionalCommandParser — backward compatibility', () => {
  it('parses simple commands', () => {
    expect(parser.parseCommands('andar()\nvirarDireita()\nvirarEsquerda()')).toEqual([
      { action: 'andar' },
      { action: 'virarDireita' },
      { action: 'virarEsquerda' },
    ]);
  });

  it('parses repetir blocks', () => {
    expect(parser.parseCommands('repetir(3) { andar() }')).toEqual([
      { action: 'repetir', count: 3, commands: [{ action: 'andar' }] },
    ]);
  });

  it('throws SyntaxError for unknown commands', () => {
    expect(() => parser.parseCommands('pular()')).toThrow(SyntaxError);
  });
});

// ---------------------------------------------------------------------------
// se — basic structure
// ---------------------------------------------------------------------------
describe('ConditionalCommandParser — se', () => {
  it('parses se(caminhoLivre()) { andar() }', () => {
    expect(parser.parseCommands('se(caminhoLivre()) { andar() }')).toEqual([
      { action: 'se', condition: 'caminhoLivre', commands: [{ action: 'andar' }] },
    ]);
  });

  it('parses se with a space before the condition: se (caminhoLivre())', () => {
    expect(parser.parseCommands('se (caminhoLivre()) { andar() }')).toEqual([
      { action: 'se', condition: 'caminhoLivre', commands: [{ action: 'andar' }] },
    ]);
  });

  it('parses se(sobreObjetivo())', () => {
    expect(parser.parseCommands('se(sobreObjetivo()) { virarDireita() }')).toEqual([
      { action: 'se', condition: 'sobreObjetivo', commands: [{ action: 'virarDireita' }] },
    ]);
  });

  it('parses se(temParede())', () => {
    expect(parser.parseCommands('se(temParede()) { virarEsquerda() }')).toEqual([
      { action: 'se', condition: 'temParede', commands: [{ action: 'virarEsquerda' }] },
    ]);
  });

  it('parses se with multiple commands in then-branch', () => {
    const result = parser.parseCommands('se(caminhoLivre()) { andar(); virarDireita() }');
    expect(result).toEqual([
      {
        action: 'se',
        condition: 'caminhoLivre',
        commands: [{ action: 'andar' }, { action: 'virarDireita' }],
      },
    ]);
  });

  it('parses se spread across multiple lines', () => {
    const input = `se (caminhoLivre()) {\n  andar()\n  virarEsquerda()\n}`;
    const result = parser.parseCommands(input);
    expect(result).toEqual([
      {
        action: 'se',
        condition: 'caminhoLivre',
        commands: [{ action: 'andar' }, { action: 'virarEsquerda' }],
      },
    ]);
  });
});

// ---------------------------------------------------------------------------
// se … senao
// ---------------------------------------------------------------------------
describe('ConditionalCommandParser — se/senao', () => {
  it('parses se with a senao branch', () => {
    const result = parser.parseCommands(
      'se(caminhoLivre()) { andar() } senao { virarDireita() }'
    );
    expect(result).toEqual([
      {
        action: 'se',
        condition: 'caminhoLivre',
        commands: [{ action: 'andar' }],
        elseCommands: [{ action: 'virarDireita' }],
      },
    ]);
  });

  it('parses se/senao multiline', () => {
    const input = `se (temParede()) {\n  virarDireita()\n} senao {\n  andar()\n}`;
    const result = parser.parseCommands(input);
    expect(result).toEqual([
      {
        action: 'se',
        condition: 'temParede',
        commands: [{ action: 'virarDireita' }],
        elseCommands: [{ action: 'andar' }],
      },
    ]);
  });
});

// ---------------------------------------------------------------------------
// Nesting: se inside repetir
// ---------------------------------------------------------------------------
describe('ConditionalCommandParser — nesting', () => {
  it('parses se nested inside repetir', () => {
    const result = parser.parseCommands('repetir(2) { se(caminhoLivre()) { andar() } }');
    expect(result).toEqual([
      {
        action: 'repetir',
        count: 2,
        commands: [
          { action: 'se', condition: 'caminhoLivre', commands: [{ action: 'andar' }] },
        ],
      },
    ]);
  });

  it('parses commands before and after a se block', () => {
    const result = parser.parseCommands(
      'virarDireita()\nse(caminhoLivre()) { andar() }\nvirarEsquerda()'
    );
    expect(result).toEqual([
      { action: 'virarDireita' },
      { action: 'se', condition: 'caminhoLivre', commands: [{ action: 'andar' }] },
      { action: 'virarEsquerda' },
    ]);
  });
});

// ---------------------------------------------------------------------------
// Error cases
// ---------------------------------------------------------------------------
describe('ConditionalCommandParser — error cases', () => {
  it('throws SyntaxError for an unknown sensor inside se', () => {
    expect(() => parser.parseCommands('se(voar()) { andar() }')).toThrow(SyntaxError);
    expect(() => parser.parseCommands('se(voar()) { andar() }')).toThrow('voar');
  });

  it('throws SyntaxError when se is missing its opening brace', () => {
    expect(() => parser.parseCommands('se(caminhoLivre()) andar()')).toThrow(SyntaxError);
    expect(() => parser.parseCommands('se(caminhoLivre()) andar()')).toThrow('esperado "{"');
  });

  it('throws SyntaxError for an unclosed se block', () => {
    expect(() => parser.parseCommands('se(caminhoLivre()) { andar()')).toThrow(SyntaxError);
  });

  it('throws SyntaxError when senao is missing its opening brace', () => {
    expect(() =>
      parser.parseCommands('se(caminhoLivre()) { andar() } senao andar()')
    ).toThrow(SyntaxError);
    expect(() =>
      parser.parseCommands('se(caminhoLivre()) { andar() } senao andar()')
    ).toThrow('esperado "{"');
  });

  it('throws SyntaxError for stray senao without se', () => {
    expect(() => parser.parseCommands('senao { andar() }')).toThrow(SyntaxError);
    expect(() => parser.parseCommands('senao { andar() }')).toThrow('senao');
  });
});
