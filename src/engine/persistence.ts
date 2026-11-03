import { GameState } from './types';

const SAVE_KEY = 'the-house-remembers-save';
const SAVE_VERSION = 1;

export function saveGame(state: GameState): void {
  try {
    const data = JSON.stringify({ ...state, saveVersion: SAVE_VERSION });
    localStorage.setItem(SAVE_KEY, data);
  } catch {
    // Storage full or unavailable
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as GameState;
    if (data.saveVersion !== SAVE_VERSION) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore
  }
}
