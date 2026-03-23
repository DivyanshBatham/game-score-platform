import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import {
  loadState,
  saveState,
  createGame as createGameData,
  generateId,
  getPastGames,
  WINNING_SCORE,
} from '../lib/storage';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, setState] = useState(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const currentGame = state.currentGameId ? state.games[state.currentGameId] : null;

  const createNewGame = useCallback((playerNames = []) => {
    const players = playerNames.length
      ? playerNames.map((name) => ({ id: generateId(), name: name.trim() || 'Player' }))
      : [{ id: generateId(), name: 'Player 1' }];
    const game = createGameData(players);
    setState((s) => ({
      ...s,
      currentGameId: game.id,
      games: { ...s.games, [game.id]: game },
    }));
    return game.id;
  }, []);

  const setCurrentGameId = useCallback((id) => {
    setState((s) => ({ ...s, currentGameId: id }));
  }, []);

  const updateGame = useCallback((gameId, updates) => {
    setState((s) => {
      const g = s.games[gameId];
      if (!g) return s;
      return {
        ...s,
        games: { ...s.games, [gameId]: { ...g, ...updates } },
      };
    });
  }, []);

  const addPlayer = useCallback((gameId, name = '') => {
    const id = generateId();
    setState((s) => {
      const g = s.games[gameId];
      if (!g) return s;
      const players = [...g.players, { id, name: name.trim() || `Player ${g.players.length + 1}` }];
      const totalScores = { ...g.totalScores, [id]: 0 };
      const currentRoundScores = { ...g.currentRoundScores };
      return {
        ...s,
        games: {
          ...s.games,
          [gameId]: {
            ...g,
            players,
            totalScores,
            currentRoundScores,
          },
        },
      };
    });
  }, []);

  const updatePlayerName = useCallback((gameId, playerId, name) => {
    setState((s) => {
      const g = s.games[gameId];
      if (!g) return s;
      const cleaned = name.trim(); // allow temporarily empty while editing
      const players = g.players.map((p) =>
        p.id === playerId ? { ...p, name: cleaned } : p
      );
      return {
        ...s,
        games: { ...s.games, [gameId]: { ...g, players } },
      };
    });
  }, []);

  const removePlayer = useCallback((gameId, playerId) => {
    setState((s) => {
      const g = s.games[gameId];
      if (!g || g.players.length <= 1) return s;
      const players = g.players.filter((p) => p.id !== playerId);
      const { [playerId]: _, ...totalScores } = g.totalScores;
      const { [playerId]: __, ...currentRoundScores } = g.currentRoundScores;
      return {
        ...s,
        games: {
          ...s.games,
          [gameId]: {
            ...g,
            players,
            totalScores,
            currentRoundScores,
          },
        },
      };
    });
  }, []);

  const setPlayerRoundResult = useCallback((gameId, playerId, roundScore, details) => {
    setState((s) => {
      const g = s.games[gameId];
      if (!g) return s;
      const prevRoundScore = g.currentRoundScores?.[playerId];
      const delta = prevRoundScore === undefined ? roundScore : roundScore - prevRoundScore;
      const currentRoundScores = { ...g.currentRoundScores, [playerId]: roundScore };
      const totalScores = {
        ...g.totalScores,
        [playerId]: (g.totalScores[playerId] ?? 0) + delta,
      };
      const currentRoundDetails = {
        ...(g.currentRoundDetails ?? {}),
        [playerId]: details,
      };
      return {
        ...s,
        games: {
          ...s.games,
          [gameId]: {
            ...g,
            currentRoundScores,
            totalScores,
            currentRoundDetails,
          },
        },
      };
    });
  }, []);

  const completeRound = useCallback((gameId) => {
    setState((s) => {
      const g = s.games[gameId];
      if (!g) return s;
      const roundScores = [
        ...g.roundScores,
        { round: g.currentRound, scores: { ...g.currentRoundScores } },
      ];
      const totalScores = g.totalScores;
      const anyoneAt200 = g.players.some((p) => (totalScores[p.id] ?? 0) >= WINNING_SCORE);
      const winnerId = anyoneAt200
        ? g.players.reduce(
            (best, p) =>
              (totalScores[p.id] ?? 0) > (totalScores[best.id] ?? 0) ? p : best,
            g.players[0]
          ).id
        : g.winnerId;

      const nextRoundNumber = anyoneAt200 ? g.currentRound : g.currentRound + 1;
      return {
        ...s,
        games: {
          ...s.games,
          [gameId]: {
            ...g,
            roundScores,
            currentRound: nextRoundNumber,
            currentRoundScores: {},
            currentRoundDetails: {},
            ...(anyoneAt200 && {
              status: 'finished',
              finishedAt: Date.now(),
              winnerId,
            }),
          },
        },
      };
    });
  }, []);

  const endGameEarly = useCallback((gameId, winnerId) => {
    updateGame(gameId, {
      status: 'finished',
      finishedAt: Date.now(),
      winnerId: winnerId || null,
    });
  }, [updateGame]);

  const pastGames = useMemo(() => getPastGames(state.games), [state.games]);

  const value = useMemo(
    () => ({
      games: state.games,
      currentGameId: state.currentGameId,
      currentGame,
      createNewGame,
      setCurrentGameId,
      updateGame,
      addPlayer,
      updatePlayerName,
      removePlayer,
      setPlayerRoundResult,
      completeRound,
      endGameEarly,
      pastGames,
    }),
    [
      state.games,
      state.currentGameId,
      currentGame,
      createNewGame,
      setCurrentGameId,
      updateGame,
      addPlayer,
      updatePlayerName,
      removePlayer,
      setPlayerRoundResult,
      completeRound,
      endGameEarly,
      pastGames,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
