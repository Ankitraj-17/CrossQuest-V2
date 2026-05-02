import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw, Trophy } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GameHeader from '../components/GameHeader';
import { playClick, playScore, playWin } from '../utils/sounds';
import ExitGameDialog from '../components/ExitGameDialog';
import { recordResult } from '../utils/leaderboard';

const WIN_LINES = [ [0,1,2],[3,4,5],[6,7,8], [0,3,6],[1,4,7],[2,5,8], [0,4,8],[2,4,6] ];

function calcWinner(sq) {
  for (const [a, b, c] of WIN_LINES) {
    if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) return { winner: sq[a], line: [a, b, c] };
  }
  return null;
}

export default function TicTacToe() {
  const { user, recordMatch } = useAuth();
  const [playerA, setPlayerA] = useState(user?.name || "Player 1 (X)");
  const [playerB, setPlayerB] = useState("Player 2 (O)");
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isA, setIsA] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [editingA, setEditingA] = useState(false);
  const [editingB, setEditingB] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldResume = searchParams.get('resume') === 'true';

  // --- PERSISTENCE: LOAD ---
  useEffect(() => {
    if (shouldResume) {
      const saved = localStorage.getItem('active_game_tictactoe');
      if (saved) {
        const d = JSON.parse(saved);
        setSquares(d.squares); setIsA(d.isA);
        setScoreA(d.scoreA); setScoreB(d.scoreB);
        setPlayerA(d.playerA); setPlayerB(d.playerB);
      }
    }
  }, [shouldResume]);

  const saveState = () => {
    const state = { squares, isA, scoreA, scoreB, playerA, playerB };
    localStorage.setItem('active_game_tictactoe', JSON.stringify(state));
    navigate('/');
  };

  const deleteStateAndExit = () => {
    if (user && squares.some(s => s !== null)) {
      recordMatch('Tic Tac Toe', 'Left the game', 0);
    }
    localStorage.removeItem('active_game_tictactoe');
    navigate('/');
  };

  const deleteState = () => {
    localStorage.removeItem('active_game_tictactoe');
  };

  const res = calcWinner(squares);
  const winner = res?.winner;
  const winLine = res?.line || [];
  const isDraw = !winner && squares.every(Boolean);

  useEffect(() => {
    if (winner || isDraw) deleteState();
  }, [winner, isDraw]);

  const handleClick = useCallback((i) => {
    if (winner || squares[i] || isDraw) return;
    playClick();
    const next = [...squares];
    next[i] = isA ? 'X' : 'O';
    setSquares(next);

    const r = calcWinner(next);
    if (r) {
      playWin();
      if (r.winner === 'X') {
        setScoreA(s => s + 1);
        recordResult('tictactoe', playerA, 'win');
        if (user) recordMatch('Tic Tac Toe', 'Win', 100);
      } else {
        setScoreB(s => s + 1);
        recordResult('tictactoe', playerB, 'win');
        if (user) recordMatch('Tic Tac Toe', 'Loss', 20);
      }
    } else if (next.every(Boolean)) {
      playScore(); // Draw sound
      if (user) recordMatch('Tic Tac Toe', 'Draw', 50);
    }
    setIsA(!isA);
  }, [squares, isA, winner, isDraw, user, recordMatch]);

  const restart = () => {
    playClick();
    setSquares(Array(9).fill(null));
    setIsA(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex h-full w-full flex-col bg-[#fefefe] notebook-paper overflow-y-auto">
      
      {/* --- ULTRA-COMPACT SKETCH HEADER --- */}
      <div className="z-50 flex w-full shrink-0 items-center justify-between gap-2 px-3 py-2 md:px-8 md:py-6 border-b-2 border-dashed border-black/5 bg-white/50 backdrop-blur-sm">
        <button onClick={() => setShowExitDialog(true)} className="flex items-center gap-1 rounded-full border-2 md:border-4 border-black bg-white px-2.5 py-1 md:px-5 md:py-2.5 font-black uppercase text-[10px] md:text-sm shadow-[3px_3px_0_#000] md:shadow-[6px_6px_0_#000] hover:-translate-y-1 transition-all" style={{ fontFamily: 'Patrick Hand' }}>
          <ChevronLeft size={14} md:size={20} /> Close Book
        </button>
        <h2 style={{ fontFamily: 'Caveat' }} className="min-w-0 flex-1 truncate px-1 text-center text-xl md:text-5xl font-black uppercase tracking-tight md:tracking-widest text-black/40 italic drop-shadow-[1px_1px_0_#fff]">Sketch Edition</h2>
        <button onClick={() => { playClick(); setScoreA(0); setScoreB(0); }} className="flex items-center gap-1 rounded-full border-2 md:border-4 border-black bg-white px-2.5 py-1 md:px-5 md:py-2.5 font-black uppercase text-[10px] md:text-sm shadow-[3px_3px_0_#000] md:shadow-[6px_6px_0_#000] hover:bg-red-50 transition-colors" style={{ fontFamily: 'Patrick Hand' }}>
          <RotateCcw size={14} md:size={18} /> Erase
        </button>
      </div>

      <div className="flex-1 w-full flex flex-col lg:flex-row items-center justify-center gap-4 md:gap-20 px-2 md:px-8 py-2 md:py-8 min-h-0">
        
        {/* PLAYER A (X) - DESKTOP SIDEBAR */}
        <div className="hidden lg:flex flex-col items-center justify-center gap-4 shrink-0 w-64">
          <motion.div 
            style={{ fontFamily: 'Caveat', rotate: -3 }}
            className={`w-full flex flex-col items-center p-8 border-2 border-black/10 relative ${isA && !winner ? 'bg-cyan-50 shadow-[8px_8px_0_rgba(0,243,255,0.1)]' : 'bg-white shadow-[4px_4px_0_rgba(0,0,0,0.05)]'}`}
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-8 bg-blue-400/20 rotate-1" />
            <div className="text-7xl font-black mb-4 text-cyan-600">X</div>
            <div className="w-full flex flex-col items-center">
              {editingA ? (
                <input autoFocus className="text-2xl font-black uppercase text-black bg-transparent border-b-2 border-black/20 w-full text-center outline-none" value={playerA} onChange={(e) => setPlayerA(e.target.value)} onBlur={() => setEditingA(false)} onKeyDown={(e) => e.key === 'Enter' && setEditingA(false)} />
              ) : (
                <div onClick={() => setEditingA(true)} className="text-3xl font-black uppercase text-black/80 cursor-edit hover:bg-black/5 px-2 rounded-lg transition-colors">{playerA} ✎</div>
              )}
              <div className="flex items-center gap-4 mt-6">
                <button onClick={() => { playClick(); setScoreA(s => Math.max(0, s - 1)); }} className="text-xl opacity-30 hover:opacity-100">−</button>
                <div className="text-5xl font-black">{scoreA}</div>
                <button onClick={() => { playClick(); setScoreA(s => s + 1); }} className="text-xl opacity-30 hover:opacity-100">+</button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* THE SKETCHED BOARD - MAXIMIZED FOR MOBILE */}
        <div className="w-full max-w-[min(96vw,calc(100vh-280px),500px)] shrink-0 z-10 relative">
          <div className="relative">
            
            {/* Header Text Overlay */}
            <AnimatePresence mode="wait">
              {winner ? (
                <motion.div key="win" initial={{ scale: 0.8, opacity: 0, rotate: -5 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} className="text-center py-2 md:py-4 mb-2 md:mb-8 font-black text-3xl md:text-5xl uppercase text-cyan-600 italic" style={{ fontFamily: 'Caveat' }}>
                  <Trophy size={24} md:size={32} className="inline mr-2 md:mr-3 mb-1 md:mb-2" /> {winner === 'X' ? playerA : playerB} Wins!
                </motion.div>
              ) : isDraw ? (
                <motion.div key="draw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2 md:py-4 mb-2 md:mb-8 font-black text-3xl md:text-5xl uppercase text-gray-400 italic" style={{ fontFamily: 'Caveat' }}>
                  Tied! 🤝 Draw Match
                </motion.div>
              ) : (
                <div className="text-center py-2 md:py-4 mb-1 md:mb-8 font-black text-base md:text-2xl uppercase tracking-widest text-black/30" style={{ fontFamily: 'Inter' }}>
                  Player <span style={{ color: isA ? '#00ccff' : '#ff3399' }}>{isA ? playerA : playerB}</span>'s Turn
                </div>
              )}
            </AnimatePresence>

            <div className="relative p-1 md:p-6 border-2 border-dashed border-black/5 rounded-2xl md:rounded-3xl">
              {/* Hand-drawn Grid Lines */}
              <div className="absolute inset-0 pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M33.3 0 L33.3 100" stroke="black" strokeWidth="0.5" fill="none" strokeLinecap="round" className="opacity-30" />
                  <path d="M66.6 0 L66.6 100" stroke="black" strokeWidth="0.5" fill="none" strokeLinecap="round" className="opacity-30" />
                  <path d="M0 33.3 L100 33.3" stroke="black" strokeWidth="0.5" fill="none" strokeLinecap="round" className="opacity-30" />
                  <path d="M0 66.6 L100 66.6" stroke="black" strokeWidth="0.5" fill="none" strokeLinecap="round" className="opacity-30" />
                </svg>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0px' }}>
                {squares.map((sq, i) => {
                  const isW = winLine.includes(i);
                  return (
                    <button 
                      key={i} 
                      onClick={() => handleClick(i)} 
                      disabled={!!winner || isDraw || sq} 
                      className="aspect-square flex items-center justify-center relative group touch-manipulation"
                    >
                      {isW && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }} 
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-2 bg-yellow-400/10 rounded-full blur-xl"
                        />
                      )}
                      
                      <AnimatePresence>
                        {sq && (
                          <motion.span 
                            initial={{ pathLength: 0, opacity: 0, scale: 0.5, rotate: -10 }} 
                            animate={{ pathLength: 1, opacity: 1, scale: 1, rotate: 0 }} 
                            style={{ 
                              fontFamily: 'Caveat', 
                              fontSize: 'min(4.5rem, 18vw)',
                              color: sq === 'X' ? '#2563eb' : '#db2777',
                              lineHeight: 1
                            }}
                            className="z-10 select-none font-bold"
                          >
                            {sq}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>
            </div>

            {(winner || isDraw) && (
              <motion.button 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={restart} 
                style={{ fontFamily: 'Caveat' }}
                className="mt-4 md:mt-12 w-full py-3 md:py-4 bg-black text-white rounded-xl md:rounded-2xl font-black uppercase text-xl md:text-3xl hover:bg-cyan-600 transition-all flex items-center justify-center gap-3 shadow-[6px_6px_0_rgba(0,0,0,0.1)] active:translate-y-1"
              >
                <RotateCcw size={20} md:size={24} /> New Sketch
              </motion.button>
            )}
          </div>
        </div>

        {/* PLAYER B (O) - DESKTOP SIDEBAR */}
        <div className="hidden lg:flex flex-col items-center justify-center gap-4 shrink-0 w-64">
          <motion.div 
            style={{ fontFamily: 'Caveat', rotate: 3 }}
            className={`w-full flex flex-col items-center p-8 border-2 border-black/10 relative ${!isA && !winner ? 'bg-pink-50 shadow-[8px_8px_0_rgba(219,39,119,0.1)]' : 'bg-white shadow-[4px_4px_0_rgba(0,0,0,0.05)]'}`}
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-8 bg-pink-400/20 -rotate-2" />
            <div className="text-7xl font-black mb-4 text-pink-600">O</div>
            <div className="w-full flex flex-col items-center">
              {editingB ? (
                <input autoFocus className="text-2xl font-black uppercase text-black bg-transparent border-b-2 border-black/20 w-full text-center outline-none" value={playerB} onChange={(e) => setPlayerB(e.target.value)} onBlur={() => setEditingB(false)} onKeyDown={(e) => e.key === 'Enter' && setEditingB(false)} />
              ) : (
                <div onClick={() => setEditingB(true)} className="text-3xl font-black uppercase text-black/80 cursor-edit hover:bg-black/5 px-2 rounded-lg transition-colors">{playerB} ✎</div>
              )}
              <div className="flex items-center gap-4 mt-6">
                <button onClick={() => { playClick(); setScoreB(s => Math.max(0, s - 1)); }} className="text-xl opacity-30 hover:opacity-100">−</button>
                <div className="text-5xl font-black">{scoreB}</div>
                <button onClick={() => { playClick(); setScoreB(s => s + 1); }} className="text-xl opacity-30 hover:opacity-100">+</button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- MOBILE SKETCHBOOK CONTROL CENTER --- */}
        <div className="lg:hidden w-full max-w-[500px] shrink-0 rounded-[1.5rem] border-4 border-black bg-[#fff] p-2 shadow-[6px_6px_0_#000] mt-auto mb-4">
          <div className="grid grid-cols-2 gap-3 p-1">
             {/* Player A Mini Card */}
             <div onClick={() => setEditingA(true)} className={`flex items-center gap-3 p-2 rounded-xl border-2 transition-all ${isA && !winner ? 'bg-cyan-50 border-black shadow-[3px_3px_0_rgba(0,180,255,0.2)] -translate-y-0.5' : 'bg-slate-50 border-transparent opacity-60'}`}>
                <div style={{ fontFamily: 'Caveat' }} className="text-2xl font-black text-cyan-600">X</div>
                <div className="flex-1 min-w-0">
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none mb-0.5">Player A</div>
                   <div className="text-xs font-black uppercase truncate italic">{playerA}</div>
                </div>
                <div className="text-lg font-black">{scoreA}</div>
             </div>

             {/* Player B Mini Card */}
             <div onClick={() => setEditingB(true)} className={`flex items-center gap-3 p-2 rounded-xl border-2 transition-all ${!isA && !winner ? 'bg-pink-50 border-black shadow-[3px_3px_0_rgba(219,39,119,0.2)] -translate-y-0.5' : 'bg-slate-50 border-transparent opacity-60'}`}>
                <div style={{ fontFamily: 'Caveat' }} className="text-2xl font-black text-pink-600">O</div>
                <div className="flex-1 min-w-0">
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none mb-0.5">Player B</div>
                   <div className="text-xs font-black uppercase truncate italic">{playerB}</div>
                </div>
                <div className="text-lg font-black">{scoreB}</div>
             </div>
          </div>
        </div>

      </div>

      <ExitGameDialog 
        isOpen={showExitDialog} 
        onSave={saveState} 
        onDelete={deleteStateAndExit} 
        onCancel={() => setShowExitDialog(false)} 
      />

    </div>
  );
}
