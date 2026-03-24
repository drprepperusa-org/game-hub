import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { connectSocket } from '@/lib/socket';
import { usePartySocket } from '@/hooks/usePartySocket';
import Lobby from '@/pages/Lobby';
import PartyLobby from '@/pages/PartyLobby';
import GameSelection from '@/pages/GameSelection';
import GameHippos from '@/pages/GameHippos';
import GameJeopardy from '@/pages/GameJeopardy';
import GameTrivia from '@/pages/GameTrivia';
import GameResults from '@/pages/GameResults';

// Connect socket and set up all listeners once globally
const AppInner: React.FC = () => {
  usePartySocket();

  useEffect(() => {
    connectSocket();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/party" element={<PartyLobby />} />
      <Route path="/select-game" element={<GameSelection />} />
      <Route path="/game/hippos" element={<GameHippos />} />
      <Route path="/game/jeopardy" element={<GameJeopardy />} />
      <Route path="/game/trivia" element={<GameTrivia />} />
      <Route path="/results" element={<GameResults />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
};

export default App;
