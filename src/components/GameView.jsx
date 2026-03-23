import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { WINNING_SCORE } from '../lib/storage';
import { ScorePlayerModal } from './ScorePlayerModal';

export function GameView({ onBackToLobby, onGameOver }) {
  const {
    currentGame,
    setPlayerRoundResult,
    completeRound,
    endGameEarly,
  } = useGame();
  const [scoringPlayerId, setScoringPlayerId] = useState(null);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [showResults, setShowResults] = useState(false);

  if (!currentGame) {
    return (
      <div className="p-6 text-flip-cream">
        <p>No active game.</p>
        <button
          type="button"
          onClick={onBackToLobby}
          className="mt-4 text-flip-yellow hover:underline"
        >
          Back to lobby
        </button>
      </div>
    );
  }

  const { players, currentRound, totalScores, currentRoundScores, currentRoundDetails, roundScores, status } = currentGame;
  const allScoredThisRound = players.every((p) => currentRoundScores[p.id] !== undefined);
  const winner = status === 'finished' ? players.find((p) => p.id === currentGame.winnerId) : null;
  const anyoneAt200 = players.some((p) => (totalScores[p.id] ?? 0) >= WINNING_SCORE);

  const leaderboard = [...players].sort(
    (a, b) => (totalScores[b.id] ?? 0) - (totalScores[a.id] ?? 0)
  );

  const rounds = (roundScores ?? []).slice().sort((a, b) => a.round - b.round);

  const handleScoreDone = (playerId, result) => {
    setPlayerRoundResult(currentGame.id, playerId, result.score, result.selection);
    setScoringPlayerId(null);
  };

  const handleEditDone = (playerId, result) => {
    setPlayerRoundResult(currentGame.id, playerId, result.score, result.selection);
    setEditingPlayerId(null);
  };

  const handleNextRound = () => {
    completeRound(currentGame.id);
    if (anyoneAt200) setShowResults(true);
  };

  const isFinished = status === 'finished';
  const shouldShowResults = showResults || isFinished;

  const scoringPlayer = scoringPlayerId ? players.find((p) => p.id === scoringPlayerId) : null;
  const editingPlayer = editingPlayerId ? players.find((p) => p.id === editingPlayerId) : null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar leaderboard */}
      <aside className="lg:w-64 shrink-0 bg-flip-blue-dark border-b lg:border-b-0 lg:border-r border-flip-yellow/30 p-4">
        <h2 className="text-flip-yellow font-bold text-lg mb-3">Leaderboard</h2>
        <ol className="space-y-2">
          {leaderboard.map((p, i) => (
            <li
              key={p.id}
              className="flex items-center justify-between text-flip-cream py-1 px-2 rounded"
            >
              <span className="flex items-center gap-2">
                <span className="text-flip-yellow/80 font-mono w-5">{i + 1}.</span>
                <span className="font-medium truncate max-w-[120px]" title={p.name}>
                  {p.name}
                </span>
              </span>
              <span
                className={`font-bold ${
                  (totalScores[p.id] ?? 0) >= WINNING_SCORE ? 'text-flip-yellow' : ''
                }`}
              >
                {totalScores[p.id] ?? 0}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-flip-cream/70 text-sm mt-4">Round {currentRound}</p>
      </aside>

      {/* Main area */}
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBackToLobby}
            className="text-flip-yellow hover:underline text-sm"
          >
            ← Exit game
          </button>
          <h2 className="text-xl font-semibold text-flip-cream">
            {shouldShowResults ? 'Results' : `Round ${currentRound}`}
          </h2>
        </div>

        {shouldShowResults ? (
          <>
            <p className="text-flip-cream/80 text-sm mb-4">
              Final leaderboard (first to {WINNING_SCORE}; highest score wins at end of round).
            </p>
            {winner && (
              <div className="mb-6 bg-flip-blue-light/30 border border-flip-blue-light rounded-xl p-4">
                <p className="text-flip-yellow font-bold text-lg">
                  Winner: {winner.name} ({totalScores[winner.id] ?? 0})
                </p>
              </div>
            )}

            {rounds.length > 0 && (
              <div className="mt-8">
                <div className="overflow-auto rounded-xl border border-flip-blue-light">
                  <table className="min-w-[520px] w-full text-sm">
                    <thead className="bg-flip-blue-dark/60">
                      <tr>
                        <th className="text-left px-3 py-2 text-flip-cream/90">Player</th>
                        {rounds.map((r) => (
                          <th key={r.round} className="text-right px-3 py-2 text-flip-cream/90">
                            R{r.round}
                          </th>
                        ))}
                        <th className="text-right px-3 py-2 text-flip-yellow">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((p) => (
                        <tr key={p.id} className="odd:bg-flip-blue-light/20">
                          <td className="px-3 py-2 text-flip-cream font-medium whitespace-nowrap">
                            {p.name}
                          </td>
                          {rounds.map((r) => (
                            <td key={r.round} className="px-3 py-2 text-right text-flip-cream/90">
                              {r.scores?.[p.id] ?? '—'}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-right font-bold text-flip-yellow">
                            {totalScores[p.id] ?? 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={onGameOver ?? onBackToLobby}
                className="px-8 py-4 rounded-xl bg-flip-yellow text-flip-blue-dark font-bold text-lg shadow-lg hover:bg-flip-yellow-dark transition"
              >
                Back to menu
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-flip-cream/80 text-sm mb-4">
              Score each player for this round. First to {WINNING_SCORE} wins.
            </p>

            <ul className="space-y-3 max-w-md">
              {players.map((p) => {
                const scored = currentRoundScores[p.id] !== undefined;
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between bg-flip-blue-light/40 rounded-xl px-4 py-3 border border-flip-blue-light"
                  >
                    <span className="text-flip-cream font-medium">{p.name}</span>
                    <div className="flex items-center gap-3">
                      {scored ? (
                        <>
                          <span className="text-flip-yellow font-bold">
                            +{currentRoundScores[p.id]} this round
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingPlayerId(p.id)}
                            className="text-flip-cream/80 text-sm hover:text-flip-yellow transition"
                          >
                            Edit
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setScoringPlayerId(p.id)}
                          className="px-4 py-2 rounded-lg bg-flip-yellow text-flip-blue-dark font-semibold hover:bg-flip-yellow-dark transition"
                        >
                          Score player
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {allScoredThisRound && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="px-8 py-4 rounded-xl bg-flip-yellow text-flip-blue-dark font-bold text-lg shadow-lg hover:bg-flip-yellow-dark transition"
                >
                  {anyoneAt200 ? 'View Results / Leaderboard' : 'Next round →'}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {scoringPlayer && (
        <ScorePlayerModal
          playerName={scoringPlayer.name}
          initialSelection={currentRoundDetails?.[scoringPlayer.id]}
          onDone={(result) => handleScoreDone(scoringPlayer.id, result)}
          onCancel={() => setScoringPlayerId(null)}
        />
      )}

      {editingPlayer && (
        <ScorePlayerModal
          playerName={editingPlayer.name}
          initialSelection={currentRoundDetails?.[editingPlayer.id]}
          onDone={(result) => handleEditDone(editingPlayer.id, result)}
          onCancel={() => setEditingPlayerId(null)}
        />
      )}
    </div>
  );
}
