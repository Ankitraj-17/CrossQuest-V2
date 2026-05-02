import { useState, useMemo, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Trophy, RotateCcw, ChevronLeft, Target, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLeaderboard, clearLeaderboard } from '../utils/leaderboard';

const GAME_LABELS = {
  snakeladder: 'Snake & Ladder',
  ludo:        'Classic Ludo',
  tictactoe:   'Tic Tac Toe',
  chess:       'Chess Arena',
};

const GAMES_LIST = ['snakeladder', 'ludo', 'tictactoe', 'chess'];

const MEDAL = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [lb, setLb] = useState(getLeaderboard());
  const [win, setWin] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWin({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    const interval = setInterval(refresh, 2000); // Auto-refresh every 2s
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const bgParticles = useMemo(() => {
    return Array.from({ length: 15 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10
    }));
  }, []);

  const energyStreaks = useMemo(() => {
    return Array.from({ length: 6 }).map(() => ({
      y: Math.random() * 100,
      width: 150 + Math.random() * 300,
      duration: 1.5 + Math.random() * 2.5,
      delay: Math.random() * 15
    }));
  }, []);

  const refresh = () => {
    const newLb = getLeaderboard();
    setLb(prev => JSON.stringify(prev) === JSON.stringify(newLb) ? prev : newLb);
  };
  const reset   = () => { if(confirm("Clear all scores?")) { clearLeaderboard(); refresh(); } };

  const getResumePath = (gameId) => {
    switch(gameId) {
      case 'snakeladder': return '/snake-ladder?resume=true';
      case 'ludo':        return '/ludo?resume=true';
      case 'tictactoe':   return '/tictactoe?resume=true';
      case 'chess':       return '/chess?resume=true';
      default:            return '#';
    }
  };

  return (
    <div 
      onMouseMove={(e) => {
        mouseX.set(e.clientX - window.innerWidth / 2);
        mouseY.set(e.clientY - window.innerHeight / 2);
      }}
      className="relative w-full min-h-screen bg-white font-mono select-none overflow-x-hidden p-4 md:p-12 flex flex-col items-center"
    >
      
      {/* --- ATMOSPHERIC BACKGROUND (Consistency with Landing) --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {energyStreaks.map((s, i) => (
          <motion.div
            key={`streak-${i}`}
            initial={{ x: "-150%", opacity: 0 }}
            animate={{ x: "250%", opacity: [0, 0.6, 0] }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "linear" }}
            style={{ top: `${s.y}vh`, width: s.width, height: '2px' }}
            className="absolute bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f3ff]"
          />
        ))}

        {bgParticles.map((p, i) => (
          <motion.div
            key={`bgp-${i}`}
            initial={{ opacity: 0, y: "110vh" }}
            animate={{ opacity: [0, 0.3, 0], y: "-10vh" }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
            style={{ left: `${p.x}vw`, width: p.size, height: p.size }}
            className="absolute bg-black rounded-full"
          />
        ))}


        <motion.div 
          style={{ 
            x: useTransform(mouseX, [-win.w/2, win.w/2], [15, -15]),
            y: useTransform(mouseY, [-win.h/2, win.h/2], [15, -15]),
            backgroundImage: 'radial-gradient(rgba(0,0,0,0.1) 2px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
          className="absolute inset-[-100px]"
        />
      </div>

      {/* --- HEADER --- */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between mb-16">
        <Link to="/" className="flex items-center gap-2 bg-white px-4 md:px-5 py-2 md:py-2.5 rounded-full border-4 border-black shadow-[4px_4px_0_#000] md:shadow-[6px_6px_0_#000] font-black uppercase text-[10px] md:text-sm hover:-translate-y-1 transition-transform">
          <ChevronLeft size={16} md:size={20} /> Home
        </Link>
        <div className="flex flex-col items-center">
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Trophy size={32} md:size={48} className="text-[#ffcc00] drop-shadow-[0_0_15px_rgba(255,204,0,0.5)] shrink-0" fill="#ffcc00" />
          </motion.div>
          <h1 className="text-3xl md:text-7xl font-black uppercase italic tracking-tighter text-black mt-1 md:mt-2 text-center leading-none">Hall of Fame</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} title="Clear Leaderboard" className="bg-white px-4 md:px-5 py-2 md:py-2.5 rounded-2xl border-4 border-black shadow-[4px_4px_0_#000] md:shadow-[6px_6px_0_#000] font-black uppercase text-[10px] md:text-xs hover:bg-red-50 text-red-500 transition-colors">
            Reset
          </button>
          <button onClick={refresh} className="bg-white px-4 md:px-5 py-2 md:py-2.5 rounded-2xl border-4 border-black shadow-[4px_4px_0_#000] md:shadow-[6px_6px_0_#000] font-black uppercase text-[10px] md:text-xs hover:bg-cyan-50 transition-colors">
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {/* --- CONTENT --- */}
      <section className="relative z-10 w-full max-w-5xl space-y-12 pb-20">
        {GAMES_LIST.filter(game => {
          const hasScore = lb[game] && Object.keys(lb[game]).length > 0;
          const hasLive = !!localStorage.getItem(`active_game_${game}`);
          return hasScore || hasLive;
        }).length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/80 backdrop-blur-md p-20 rounded-[3rem] border-[6px] border-black shadow-[20px_20px_0_#000] text-center">
             <div className="text-3xl font-black uppercase opacity-20 italic">No legends found yet.</div>
             <div className="mt-4 text-black font-bold uppercase tracking-widest text-sm">Play a game to claim your spot!</div>
          </motion.div>
        ) : (
          GAMES_LIST.map((game, gi) => {
            const hasScore = lb[game] && Object.keys(lb[game]).length > 0;
            const hasLive = !!localStorage.getItem(`active_game_${game}`);
            if (!hasScore && !hasLive) return null;

            const players = lb[game] || {};
            const sorted = Object.entries(players).sort(([, a], [, b]) => b.wins - a.wins);
            return (
              <motion.div
                key={game}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.1 }}
                className="bg-white rounded-[2.5rem] border-[6px] border-black shadow-[15px_15px_0_#000] overflow-hidden"
              >
                <div className="bg-black p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                    {GAME_LABELS[game] || game}
                  </h2>
                  <div className="flex gap-4">
                    <Target size={20} className="text-cyan-400" />
                    <Zap size={20} className="text-yellow-400" />
                    <Star size={20} className="text-pink-400" />
                  </div>
                </div>
                
                <div className="p-0 md:p-8 overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="text-left border-b-4 border-black/10">
                        <th className="p-4 font-black uppercase text-xs md:text-sm">Rank</th>
                        <th className="p-4 font-black uppercase text-xs md:text-sm">Player</th>
                        <th className="p-4 font-black uppercase text-xs md:text-sm text-center">Score (Wins)</th>
                        <th className="p-4 font-black uppercase text-xs md:text-sm text-center">Total Played</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black/5">
                      {/* --- LIVE MATCH TRACKING --- */}
                      {(() => {
                        const active = localStorage.getItem(`active_game_${game}`);
                        if (!active) return null;
                        const d = JSON.parse(active);
                        return (
                          <tr className="bg-red-50/50 group">
                            <td className="p-4 font-black text-red-500 italic">
                               <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                 LIVE
                               </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm md:text-lg uppercase text-black/60 truncate max-w-[150px]">{d.playerA || d.playerNames?.[0] || 'Player A'} <span className="italic opacity-30 text-xs">vs</span> {d.playerB || d.playerNames?.[1] || 'Player B'}</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                               <div className="inline-block bg-red-500 text-white px-3 md:px-4 py-1 rounded-full border-2 border-black font-black text-xs md:text-sm">
                                 {d.posA || d.scoreA || d.scores?.RED || 0} - {d.posB || d.scoreB || d.scores?.GREEN || 0}
                                </div>
                            </td>
                            <td className="p-4 text-center">
                               <Link to={getResumePath(game)}>
                                 <button className="bg-black text-white px-4 md:px-6 py-2 rounded-xl font-black text-[10px] md:text-xs uppercase hover:bg-red-600 transition-colors shadow-[2px_2px_0_rgba(0,0,0,0.2)] active:translate-y-0.5">
                                   Resume
                                 </button>
                               </Link>
                            </td>
                          </tr>
                        );
                      })()}

                      {sorted.map(([name, stats], ri) => (
                        <tr key={name} className="hover:bg-black/5 transition-colors group">
                          <td className="p-4 font-black text-xl md:text-2xl italic">
                             {ri < 3 ? <span className="text-2xl md:text-3xl">{MEDAL[ri]}</span> : <span className="opacity-20">#{ri+1}</span>}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-black text-sm md:text-xl uppercase tracking-tighter truncate max-w-[120px] md:max-w-none">{name}</span>
                              <span className="text-[8px] md:text-[10px] font-bold text-black/30 uppercase">Champion Grade</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                             <div className="inline-block bg-[#00ff88]/20 px-3 md:px-4 py-1 rounded-full border-2 border-black font-black text-sm md:text-lg">
                               {stats.wins} Wins
                             </div>
                          </td>
                          <td className="p-4 text-center">
                             <div className="font-bold text-black/40 text-[10px] md:text-sm italic">{stats.games} Games</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            );
          })
        )}
      </section>

    </div>
  );
}
