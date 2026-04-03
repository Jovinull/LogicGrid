/**
 * CommandParser
 * Parses a multi-line string of commands into an array of action objects.
 *
 * Supported commands: andar(), virarDireita(), virarEsquerda()
 * Supported structures: repetir(n) { ... }  (nestable)
 * Whitespace, blank lines, and semicolons are handled gracefully.
 * Throws a SyntaxError on the first unrecognised command or malformed block.
 */

const VALID_COMMANDS = new Set(['andar', 'virarDireita', 'virarEsquerda']);

// Matches a simple command identifier followed by ()
const COMMAND_RE = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*\)$/;

// Matches a repetir header: repetir(n) — n must be a non-negative integer
const REPETIR_RE = /^repetir\s*\(\s*(\d+)\s*\)$/;

export class CommandParser {
  /**
   * Parse a string of commands, including repetir(n) { ... } blocks.
   *
   * @param {string} text - Raw input from the textarea.
   * @returns {Array<{action: string} | {action: 'repetir', count: number, commands: Array}>}
   * @throws {SyntaxError} If an unrecognised command or malformed block is found.
   */
  parseCommands(text) {
    const tokens = this._tokenize(text);
    const { commands, consumed } = this._parseBlock(tokens, 0, false);

    if (consumed < tokens.length) {
      throw new SyntaxError(
        `Erro de sintaxe: "}" inesperado (bloco não aberto)`
      );
    }

    return commands;
  }

  /**
   * Tokenize the raw input into an array of string tokens.
   * Braces and semicolons are treated as separators so that inline syntax like
   * `repetir(4) { andar(); virarDireita(); }` is parsed correctly.
   *
   * @param {string} text
   * @returns {string[]}
   */
  _tokenize(text) {
    // Pad { and } with spaces so they become isolated tokens after splitting
    const spaced = text.replace(/\{/g, ' { ').replace(/\}/g, ' } ');
    // Split on whitespace, newlines, and semicolons; drop empty strings
    return spaced
      .split(/[\s;]+/)
      .map((t) => t.trim())
      .filter((t) => t !== '');
  }

  /**
   * Recursively parse a sequence of tokens into a command array.
   * Stops when it encounters "}" (if inside a block) or runs out of tokens.
   *
   * @param {string[]} tokens
   * @param {number}   start       - Token index to start from.
   * @param {boolean}  insideBlock - Whether we are inside a repetir { } block.
   * @returns {{ commands: Array, consumed: number }}
   */
  _parseBlock(tokens, start, insideBlock) {
    const commands = [];
    let i = start;

    while (i < tokens.length) {
      const token = tokens[i];

      if (token === '{') {
        throw new SyntaxError(
          `Erro de sintaxe: "{" inesperado sem comando "repetir"`
        );
      }

      if (token === '}') {
        if (!insideBlock) {
          // Let the caller detect the stray brace via leftover consumed count
          break;
        }
        // Consume the closing brace and return
        return { commands, consumed: i - start + 1 };
      }

      // repetir(n) header
      const repetirMatch = REPETIR_RE.exec(token);
      if (repetirMatch) {
        const count = parseInt(repetirMatch[1], 10);

        // Expect "{" as the very next token
        i++;
        if (i >= tokens.length || tokens[i] !== '{') {
          throw new SyntaxError(
            `Erro de sintaxe: esperado "{" após "repetir(${count})"`
          );
        }
        i++; // consume "{"

        const inner = this._parseBlock(tokens, i, true);
        // _parseBlock throws if it hits EOF without "}" when insideBlock=true,
        // so reaching here means it found the closing brace.
        commands.push({ action: 'repetir', count, commands: inner.commands });
        i += inner.consumed;
        continue;
      }

      // Simple command
      const cmdMatch = COMMAND_RE.exec(token);
      if (!cmdMatch) {
        throw new SyntaxError(
          `Erro de sintaxe: token desconhecido "${token}"`
        );
      }

      const commandName = cmdMatch[1];
      if (!VALID_COMMANDS.has(commandName)) {
        throw new SyntaxError(
          `Comando desconhecido: "${commandName}()"`
        );
      }

      commands.push({ action: commandName });
      i++;
    }

    if (insideBlock) {
      throw new SyntaxError(
        `Erro de sintaxe: bloco "repetir" não foi fechado com "}"`
      );
    }

    return { commands, consumed: i - start };
  }
}
