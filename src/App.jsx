import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';

import Sidebar           from './components/Sidebar';
import Footer            from './components/Footer';

import LandingPage       from './pages/LandingPage';
import Home              from './pages/Home';
import Leaderboard       from './pages/Leaderboard';
import HowToPlay         from './pages/HowToPlay';
import SavedGames        from './pages/SavedGames';
import Profile           from './pages/Profile';

import TicTacToe         from './games/TicTacToe';
import SnakeLadder       from './games/SnakeLadder';
import ChessGame         from './games/ChessGame';
import Ludo              from './games/Ludo';

function PageWrapper({ children, isGame }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: isGame ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: isGame ? 0 : -18 }}
      transition={{ duration: 0.3 }}
      className={isGame ? "w-full h-screen overflow-hidden" : ""}
    >
      {children}
    </motion.div>
  );
}

function AppRoutes({ onLogoClick }) {
  const location = useLocation();
  const gameRoutes = ['/tictactoe', '/snake-ladder', '/chess', '/ludo'];
  const isGamePage = gameRoutes.includes(location.pathname);

  return (
    <div className={`h-screen overflow-hidden flex flex-col md:flex-row ${isGamePage ? 'w-full' : ''}`}>
      {!isGamePage && <Sidebar onLogoClick={onLogoClick} />}
      <main className={`flex-1 overflow-y-auto ${isGamePage ? 'w-full h-full' : 'p-4 md:p-10 h-full pb-24 md:pb-10'}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"            element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/tictactoe"   element={<PageWrapper isGame><TicTacToe /></PageWrapper>} />
            <Route path="/snake-ladder" element={<PageWrapper isGame><SnakeLadder /></PageWrapper>} />
            <Route path="/chess"       element={<PageWrapper isGame><ChessGame /></PageWrapper>} />
            <Route path="/ludo"        element={<PageWrapper isGame><Ludo /></PageWrapper>} />
            <Route path="/leaderboard" element={<PageWrapper><Leaderboard /></PageWrapper>} />
            <Route path="/how-to-play" element={<PageWrapper><HowToPlay /></PageWrapper>} />
            <Route path="/saved-games" element={<PageWrapper><SavedGames /></PageWrapper>} />
            <Route path="/profile"     element={<PageWrapper><Profile /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
        {location.pathname === '/' && <Footer />}
      </main>
    </div>
  );
}

export default function App() {
  const [entered, setEntered] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          {!entered ? (
            <motion.div key="landing" exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.5 }}>
              <LandingPage onEnter={() => setEntered(true)} />
            </motion.div>
          ) : (
            <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="relative z-10 min-h-screen flex flex-col">
              <AppRoutes onLogoClick={() => setEntered(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </BrowserRouter>
    </AuthProvider>
  );
}
