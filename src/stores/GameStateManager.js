import { Entity } from '../models/Entity';

/**
 * GameStateManager
 * Lightweight singleton that stores the current game state and notifies
 * subscribers when it changes.  Avoids an external dependency (e.g. Zustand)
 * since the project does not ship one.
 */
class GameStateManager {
  constructor() {
    /** @type {Entity} The player-controlled hero. */
    this.heroi = new Entity('heroi', 0, 0, 'Leste', '#4A90D9');

    /** @type {object|null} The currently loaded level, or null if none. */
    this.nivel = null;

    /** @type {Set<Function>} Registered listener callbacks. */
    this._listeners = new Set();
  }

  /**
   * Register a callback to be called whenever state changes.
   * Returns an unsubscribe function.
   *
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  /**
   * Load a level: positions the hero at the level's start cell and stores
   * the level data so other systems (renderer, execution queue) can access it.
   *
   * @param {object} nivel - Level definition from levels.js.
   */
  loadLevel(nivel) {
    this.nivel = nivel;
    this.heroi = new Entity(
      'heroi',
      nivel.start.x,
      nivel.start.y,
      nivel.start.dir,
      '#4A90D9'
    );
    this._notify();
  }

  /**
   * Reset the hero to the loaded level's start position and direction.
   * Does nothing if no level is loaded.
   */
  resetHeroi() {
    if (!this.nivel) return;
    this.moverHeroi({
      x: this.nivel.start.x,
      y: this.nivel.start.y,
      direcao: this.nivel.start.dir,
    });
  }

  /**
   * Update hero position and/or direction, then notify all subscribers.
   *
   * @param {Partial<{x: number, y: number, direcao: string}>} updates
   */
  moverHeroi(updates) {
    Object.assign(this.heroi, updates);
    this._notify();
  }

  _notify() {
    this._listeners.forEach((cb) => cb(this));
  }
}

/** Shared singleton instance. */
export const gameStateManager = new GameStateManager();
