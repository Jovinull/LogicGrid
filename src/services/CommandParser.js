/**
 * CommandParser
 * Parses a multi-line string of commands into an array of action objects.
 *
 * Supported commands: andar(), virarDireita(), virarEsquerda()
 * Whitespace and blank lines are ignored.
 * Throws a SyntaxError on the first unrecognised command, stopping the parse.
 */

const VALID_COMMANDS = new Set(['andar', 'virarDireita', 'virarEsquerda']);

// Matches an identifier followed by ()  — e.g. "andar()" or "  virarDireita() "
const COMMAND_RE = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*\)\s*$/;

export class CommandParser {
  /**
   * Parse a string of commands.
   *
   * @param {string} text - Raw input from the textarea.
   * @returns {{ action: string }[]} Array of action objects.
   * @throws {SyntaxError} If an unrecognised command is found.
   */
  parseCommands(text) {
    const actions = [];

    const lines = text.split(/\r?\n/);

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Skip blank / whitespace-only lines
      if (line.trim() === '') continue;

      const match = COMMAND_RE.exec(line);

      if (!match) {
        throw new SyntaxError(
          `Erro de sintaxe na linha ${lineIndex + 1}: "${line.trim()}"`
        );
      }

      const commandName = match[1];

      if (!VALID_COMMANDS.has(commandName)) {
        throw new SyntaxError(
          `Comando desconhecido na linha ${lineIndex + 1}: "${commandName}()"`
        );
      }

      actions.push({ action: commandName });
    }

    return actions;
  }
}
