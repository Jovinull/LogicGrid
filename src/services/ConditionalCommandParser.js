import { CommandParser } from './CommandParser';

/**
 * Known sensor function names accepted inside se(...) conditions.
 */
const SENSOR_COMMANDS = new Set(['caminhoLivre', 'sobreObjetivo', 'temParede']);

/**
 * Matches a fully-merged se token: se(sensorName()) — produced by _tokenize.
 * Capture group 1 is the sensor function name.
 */
const SE_RE = /^se\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*\)\s*\)$/;

/**
 * ConditionalCommandParser
 * Extends CommandParser to support the conditional construct:
 *
 *   se (sensorFn()) { comandos }
 *   se (sensorFn()) { comandos } senao { comandos }
 *
 * Sensor functions: caminhoLivre(), sobreObjetivo(), temParede()
 *
 * Parsed output for a se node:
 *   { action: 'se', condition: string, commands: Array, elseCommands?: Array }
 *
 * Conditions are NOT evaluated here — evaluation happens at tick time in
 * ExecutionQueue using SensorService.
 */
export class ConditionalCommandParser extends CommandParser {
  /**
   * Override tokenizer to merge a bare 'se' token with the immediately
   * following '(...)' token so that both `se(cond())` and `se (cond())`
   * produce the same single token that SE_RE can match.
   *
   * @param {string} text
   * @returns {string[]}
   */
  _tokenize(text) {
    const tokens = super._tokenize(text);
    const merged = [];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === 'se' && i + 1 < tokens.length && tokens[i + 1].startsWith('(')) {
        merged.push(`se${tokens[i + 1]}`);
        i++; // skip the '(...)' token — already merged
      } else {
        merged.push(tokens[i]);
      }
    }
    return merged;
  }

  /**
   * Handle se(condition) { ... } [senao { ... }] constructs.
   *
   * Called by CommandParser._parseBlock for any token that does not match a
   * brace, repetir, or simple command.
   *
   * @param {string[]} tokens
   * @param {number}   i - Index of the current token.
   * @returns {{ command: object, newIndex: number } | null}
   */
  _tryParseCustomToken(tokens, i) {
    const token = tokens[i];

    // ── se (condition) { ... } [senao { ... }] ───────────────────────────────
    const seMatch = SE_RE.exec(token);
    if (seMatch) {
      const conditionName = seMatch[1];
      if (!SENSOR_COMMANDS.has(conditionName)) {
        throw new SyntaxError(`Sensor desconhecido: "${conditionName}()"`);
      }

      let j = i + 1;

      // Expect opening brace
      if (j >= tokens.length || tokens[j] !== '{') {
        throw new SyntaxError(
          `Erro de sintaxe: esperado "{" após "se(${conditionName}())"`
        );
      }
      j++; // consume '{'

      // Parse the then-branch
      const inner = this._parseBlock(tokens, j, true);
      j += inner.consumed;

      const seCommand = {
        action: 'se',
        condition: conditionName,
        commands: inner.commands,
      };

      // Optional senao branch
      if (j < tokens.length && tokens[j] === 'senao') {
        j++; // consume 'senao'
        if (j >= tokens.length || tokens[j] !== '{') {
          throw new SyntaxError(`Erro de sintaxe: esperado "{" após "senao"`);
        }
        j++; // consume '{'
        const elseInner = this._parseBlock(tokens, j, true);
        j += elseInner.consumed;
        seCommand.elseCommands = elseInner.commands;
      }

      return { command: seCommand, newIndex: j };
    }

    // ── Stray 'senao' without a preceding 'se' ───────────────────────────────
    if (token === 'senao') {
      throw new SyntaxError(`Erro de sintaxe: "senao" sem "se" correspondente`);
    }

    return null;
  }
}
