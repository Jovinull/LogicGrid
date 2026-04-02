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
