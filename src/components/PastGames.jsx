import { useGame } from '../context/GameContext';

function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PastGames({ onBack, onAfterRematch, onViewFinishedGame }) {
  const { pastGames, setCurrentGameId, createNewGame } = useGame();

  const playerNamesFromGame = (game) => game.players.map((p) => p.name);

  const handleSamePlayersLobby = (game) => {
    createNewGame(playerNamesFromGame(game));
    onAfterRematch?.();
  };

  if (pastGames.length === 0) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <h2 className="text-xl font-bold text-flip-yellow mb-4">Past Games</h2>
        <p className="text-flip-cream/80 mb-6">No finished games yet.</p>
        <button
          type="button"
          onClick={onBack}
          className="text-flip-yellow hover:underline"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-flip-yellow mb-6">Past Games</h2>
      <ul className="space-y-4">
        {pastGames.map((game) => {
          const winner = game.players.find((p) => p.id === game.winnerId);
          const winnerName = winner?.name ?? '—';
          return (
            <li
              key={game.id}
              className="bg-flip-blue-light/40 rounded-xl p-4 border border-flip-blue-light"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-flip-cream/70 text-sm">
                  {formatDate(game.finishedAt ?? game.createdAt)}
                </span>
                <span className="text-flip-yellow font-semibold">
                  Winner: {winnerName}
                </span>
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-flip-cream/90 text-sm">
                {game.players
                  .sort((a, b) => (game.totalScores[b.id] ?? 0) - (game.totalScores[a.id] ?? 0))
                  .map((p) => (
                    <li key={p.id}>
                      {p.name}: {game.totalScores[p.id] ?? 0}
                    </li>
                  ))}
              </ul>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => handleSamePlayersLobby(game)}
                  className="rounded-lg border border-flip-yellow/60 px-3 py-1.5 text-sm text-flip-yellow hover:bg-flip-yellow/10"
                >
                  Same players — lobby
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentGameId(game.id);
                    onViewFinishedGame?.();
                  }}
                  className="text-flip-yellow/90 text-sm hover:underline sm:text-right"
                >
                  View rounds & results →
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={onBack}
        className="mt-6 text-flip-yellow hover:underline"
      >
        ← Back
      </button>
    </div>
  );
}
