import { describe, it, expect, beforeEach } from 'vitest';
import { SensorService } from './SensorService';
import { gameStateManager } from '../stores/GameStateManager';

const nivel = {
  gridSize: 5,
  start: { x: 2, y: 2, dir: 'Leste' },
  goal: { x: 4, y: 4 },
  obstacles: [{ x: 3, y: 2 }], // one cell east of start
};

const sensor = new SensorService();

beforeEach(() => {
  gameStateManager.loadLevel(nivel);
});

// ---------------------------------------------------------------------------
// caminhoLivre
// ---------------------------------------------------------------------------
describe('SensorService.caminhoLivre', () => {
  it('returns false when the cell ahead contains an obstacle', () => {
    // Hero at (2,2) facing Leste — obstacle at (3,2)
    expect(sensor.caminhoLivre(nivel)).toBe(false);
  });

  it('returns true when the cell ahead is empty', () => {
    gameStateManager.moverHeroi({ direcao: 'Sul' });
    // (2,3) is free
    expect(sensor.caminhoLivre(nivel)).toBe(true);
  });

  it('returns false when facing the north grid boundary', () => {
    gameStateManager.moverHeroi({ x: 0, y: 0, direcao: 'Norte' });
    expect(sensor.caminhoLivre(nivel)).toBe(false);
  });

  it('returns false when facing the south grid boundary', () => {
    gameStateManager.moverHeroi({ x: 0, y: 4, direcao: 'Sul' });
    expect(sensor.caminhoLivre(nivel)).toBe(false);
  });

  it('returns false when facing the west grid boundary', () => {
    gameStateManager.moverHeroi({ x: 0, y: 0, direcao: 'Oeste' });
    expect(sensor.caminhoLivre(nivel)).toBe(false);
  });

  it('returns false when facing the east grid boundary', () => {
    gameStateManager.moverHeroi({ x: 4, y: 0, direcao: 'Leste' });
    expect(sensor.caminhoLivre(nivel)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// sobreObjetivo
// ---------------------------------------------------------------------------
describe('SensorService.sobreObjetivo', () => {
  it('returns false when the hero is not on the goal', () => {
    expect(sensor.sobreObjetivo(nivel)).toBe(false);
  });

  it('returns true when the hero is on the goal', () => {
    gameStateManager.moverHeroi({ x: 4, y: 4 });
    expect(sensor.sobreObjetivo(nivel)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// temParede
// ---------------------------------------------------------------------------
describe('SensorService.temParede', () => {
  it('returns true when an obstacle is directly ahead', () => {
    // Hero faces east, obstacle at (3,2)
    expect(sensor.temParede(nivel)).toBe(true);
  });

  it('returns false when the path is clear', () => {
    gameStateManager.moverHeroi({ direcao: 'Sul' });
    expect(sensor.temParede(nivel)).toBe(false);
  });

  it('returns true at a grid boundary', () => {
    gameStateManager.moverHeroi({ x: 0, y: 0, direcao: 'Norte' });
    expect(sensor.temParede(nivel)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// evaluate (dispatch)
// ---------------------------------------------------------------------------
describe('SensorService.evaluate', () => {
  it('delegates to caminhoLivre', () => {
    expect(sensor.evaluate('caminhoLivre', nivel)).toBe(sensor.caminhoLivre(nivel));
  });

  it('delegates to sobreObjetivo', () => {
    expect(sensor.evaluate('sobreObjetivo', nivel)).toBe(sensor.sobreObjetivo(nivel));
  });

  it('delegates to temParede', () => {
    expect(sensor.evaluate('temParede', nivel)).toBe(sensor.temParede(nivel));
  });

  it('throws an Error for an unknown sensor name', () => {
    expect(() => sensor.evaluate('voar', nivel)).toThrow(Error);
    expect(() => sensor.evaluate('voar', nivel)).toThrow('voar');
  });
});
