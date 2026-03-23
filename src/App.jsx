import { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Lobby } from './components/Lobby';
import { GameView } from './components/GameView';
import { PastGames } from './components/PastGames';

function AppContent() {
  const { currentGame, currentGameId, setCurrentGameId } = useGame();
  const [view, setView] = useState('lobby'); // 'lobby' | 'game' | 'past'

  const hasSelectedGame = !!currentGameId && !!currentGame;
  const showGame = view === 'game' && hasSelectedGame;
  const showPast = view === 'past';

  return (
    <div className="min-h-screen bg-flip-blue text-flip-cream">
      {showPast ? (
        <PastGames onBack={() => setView('game')} />
      ) : showGame ? (
        <GameView
          onBackToLobby={() => setView('lobby')}
          onGameOver={() => {
            setView('lobby');
            setCurrentGameId(null);
          }}
        />
      ) : (
        <Lobby
          onStartGame={() => setView('game')}
          onViewPastGames={() => setView('past')}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
