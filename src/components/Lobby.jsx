import { useState } from 'react';
import { useGame } from '../context/GameContext';

export function Lobby({ onStartGame, onViewPastGames }) {
  const {
    currentGameId,
    currentGame,
    createNewGame,
    addPlayer,
    updatePlayerName,
    removePlayer,
  } = useGame();
  const [newPlayerName, setNewPlayerName] = useState('');

  const hasGame = currentGameId && currentGame && currentGame.status === 'active';
  const players = currentGame?.players ?? [];
  const canStart = players.length >= 2;
  const hasProgress =
    !!currentGame &&
    (currentGame.currentRound > 1 ||
      currentGame.roundScores.length > 0 ||
      Object.keys(currentGame.currentRoundScores ?? {}).length > 0 ||
      Object.values(currentGame.totalScores ?? {}).some((v) => (v ?? 0) > 0));

  const handleCreateNew = () => {
    createNewGame([]);
  };

  const handleAddPlayer = (e) => {
    e?.preventDefault();
    if (!currentGameId) return;
    addPlayer(currentGameId, newPlayerName);
    setNewPlayerName('');
  };

  const handleStart = () => {
    if (canStart) onStartGame?.();
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-3xl font-bold text-flip-yellow mb-2 text-center drop-shadow-md">
        Flip 7
      </h1>
      <p className="text-flip-cream/90 text-center mb-8 text-sm">Score Tracker</p>

      {!hasGame ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleCreateNew}
            className="w-full py-4 px-6 rounded-xl bg-flip-yellow text-flip-blue-dark font-bold text-lg shadow-lg hover:bg-flip-yellow-dark transition"
          >
            New Game
          </button>
          <button
            type="button"
            onClick={onViewPastGames}
            className="w-full py-3 px-6 rounded-xl border-2 border-flip-yellow text-flip-yellow font-medium hover:bg-flip-yellow/10 transition"
          >
            Past Games
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-flip-cream">Players</h2>
            <span className="text-flip-cream/80 text-sm">
              {players.length} player{players.length !== 1 ? 's' : ''}
            </span>
          </div>

          <ul className="space-y-3">
            {players.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-2 bg-flip-blue-light/50 rounded-lg px-4 py-3"
              >
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => updatePlayerName(currentGameId, p.id, e.target.value)}
                  className="flex-1 bg-transparent text-flip-cream font-medium placeholder-flip-cream/50 focus:outline-none focus:ring-1 ring-flip-yellow rounded px-1"
                  placeholder="Player name"
                />
                <button
                  type="button"
                  onClick={() => removePlayer(currentGameId, p.id)}
                  className="text-red-300 hover:text-red-400 text-sm font-medium px-2"
                  title="Remove player"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddPlayer} className="flex gap-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Add player..."
              className="flex-1 rounded-lg bg-flip-blue-light/50 text-flip-cream placeholder-flip-cream/50 px-4 py-2 focus:outline-none focus:ring-2 ring-flip-yellow"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-flip-yellow text-flip-blue-dark font-semibold hover:bg-flip-yellow-dark transition"
            >
              Add
            </button>
          </form>

          <div className="flex flex-col gap-3 pt-4">
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart}
              className="w-full py-4 px-6 rounded-xl bg-flip-yellow text-flip-blue-dark font-bold text-lg shadow-lg hover:bg-flip-yellow-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hasProgress ? 'Resume Game' : 'Start Game'}
            </button>
            {!canStart && (
              <p className="text-flip-cream/70 text-sm text-center">
                Add at least 2 players to start
              </p>
            )}
            {hasProgress && (
              <button
                type="button"
                onClick={() => {
                  createNewGame(players.map((p) => p.name));
                  onStartGame?.();
                }}
                className="text-flip-cream/80 text-sm hover:text-flip-yellow transition"
              >
                Restart Game
              </button>
            )}
            <button
              type="button"
              onClick={onViewPastGames}
              className="text-flip-cream/70 text-sm hover:text-flip-yellow transition"
            >
              Past Games
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
