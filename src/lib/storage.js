const STORAGE_KEY = 'flip7_app_state';

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const WINNING_SCORE = 200;

/**
 * Load full app state from localStorage.
 * @returns {{ currentGameId: string|null, games: Object }}
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { currentGameId: null, games: {} };
    const data = JSON.parse(raw);
    return {
      currentGameId: data.currentGameId ?? null,
      games: data.games ?? {},
    };
  } catch {
    return { currentGameId: null, games: {} };
  }
}

/**
 * Save full app state to localStorage.
 * @param {{ currentGameId: string|null, games: Object }} state
 */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

/**
 * @typedef {Object} Player
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} Game
 * @property {string} id
 * @property {number} createdAt
 * @property {'active'|'finished'} status
 * @property {number} [finishedAt]
 * @property {string} [winnerId]
 * @property {Player[]} players
 * @property {number} currentRound 1-based
 * @property {Record<string, number>} totalScores playerId -> total score
 * @property {{ round: number, scores: Record<string, number> }[]} roundScores
 * @property {Record<string, number>} currentRoundScores playerId -> score for current round (until round complete)
 * @property {Record<string, { numberCards: number[], x2: boolean, addMods: string[], bust: boolean }>} currentRoundDetails playerId -> selections for current round (until round complete)
 */

/**
 * Create a new game with given players.
 * @param {Player[]} players
 * @returns {Game}
 */
export function createGame(players) {
  const id = generateId();
  const totalScores = {};
  players.forEach((p) => { totalScores[p.id] = 0; });
  return {
    id,
    createdAt: Date.now(),
    status: 'active',
    players,
    currentRound: 1,
    totalScores,
    roundScores: [],
    currentRoundScores: {},
    currentRoundDetails: {},
  };
}

/**
 * Get past (finished) games, newest first.
 * @param {Record<string, Game>} games
 * @returns {Game[]}
 */
export function getPastGames(games) {
  return Object.values(games)
    .filter((g) => g.status === 'finished')
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0));
}
