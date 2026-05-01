import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { RotateCcw, Trash2, Play, Swords, Clock, User } from 'lucide-react';
import { playClick } from '../utils/sounds';

const GAMES_CONFIG = {
  chess:       { name: 'Chess Arena', path: '/chess', color: '#8B5E3C', icon: '♟️' },
  snakeladder: { name: 'Snake & Ladder', path: '/snake-ladder', color: '#00ff88', icon: '🐍' },
  ludo:        { name: 'Ludo Arena', path: '/ludo', color: '#ffcc00', icon: '🎲' },
  tictactoe:   { name: 'Tic Tac Toe', path: '/tictactoe', color: '#00f3ff', icon: '⭕' },
};

const LUDO_COLORS = { RED: '#ef4444', GREEN: '#22c55e', YELLOW: '#eab308', BLUE: '#3b82f6' };

export default function SavedGames() {
  const [savedGames, setSavedGames] = useState([]);
  const navigate = useNavigate();

  const loadGames = () => {
    const games = [];
    Object.keys(GAMES_CONFIG).forEach(id => {
      const saved = localStorage.getItem(`active_game_${id}`);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          games.push({ id, ...GAMES_CONFIG[id], data });
        } catch (e) { console.error(e); }
      }
    });
    games.sort((a, b) => (b.data.timestamp || 0) - (a.data.timestamp || 0));
    setSavedGames(games);
  };

  useEffect(() => {
    loadGames();
    const interval = setInterval(loadGames, 3000);
    return () => clearInterval(interval);
  }, []);

  const deleteGame = (id) => {
    playClick();
    localStorage.removeItem(`active_game_${id}`);
    loadGames();
  };

  const renderStats = (g) => {
    if (g.id === 'ludo') {
      const activePlayers = Object.keys(g.data.players).filter(c => g.data.players[c]);
      return (
        <div className="grid grid-cols-2 gap-4 bg-slate-50 border-2 border-black rounded-3xl p-6 mb-8">
          {activePlayers.map(color => (
            <div key={color} className="flex flex-col items-center p-2 rounded-2xl border border-black/5">
              <div className="w-4 h-4 rounded-full border-2 border-black mb-1" style={{ background: LUDO_COLORS[color] }} />
              <span className="text-[9px] font-black uppercase text-black/40 mb-1">{color}</span>
              <span className="text-xl font-black leading-none">{g.data.scores[color] || 0}</span>
              <span className="text-[7px] font-black uppercase opacity-40">Home</span>
            </div>
          ))}
        </div>
      );
    }

    if (g.id === 'chess') {
      const turnColor = g.data.fen.split(' ')[1] === 'w' ? 'White' : 'Black';
      return (
        <div className="flex items-center justify-between bg-slate-50 border-2 border-black rounded-3xl p-6 mb-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-black italic text-black/10">VS</div>
          <div className="flex flex-col items-center flex-1">
             <User size={20} className="mb-2 text-black" />
             <span className="text-[10px] font-black uppercase text-black/40 truncate w-20 text-center mb-1">{g.data.nameW || 'Player 1'}</span>
             <span className="text-xl font-black leading-none">White</span>
             <span className="text-[8px] font-black uppercase mt-1 opacity-40">Pieces</span>
          </div>
          <div className="w-[1px] h-10 bg-black/10 mx-2" />
          <div className="flex flex-col items-center flex-1">
             <User size={20} className="mb-2 text-zinc-600" />
             <span className="text-[10px] font-black uppercase text-black/40 truncate w-20 text-center mb-1">{g.data.nameB || 'Player 2'}</span>
             <span className="text-xl font-black leading-none">Black</span>
             <span className="text-[8px] font-black uppercase mt-1 opacity-40">Pieces</span>
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase shadow-md">
            {turnColor}'s Turn
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between bg-slate-50 border-2 border-black rounded-3xl p-6 mb-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-black italic text-black/10">VS</div>
        <div className="flex flex-col items-center flex-1">
           <User size={20} className="mb-2 text-green-500" />
           <span className="text-[10px] font-black uppercase text-black/40 truncate w-20 text-center mb-1">{g.data.playerA || 'Player A'}</span>
           <span className="text-2xl font-black leading-none">{g.data.scoreA || 0}</span>
           <span className="text-[8px] font-black uppercase mt-1 opacity-40">Points</span>
           <div className="mt-2 text-[9px] font-black bg-green-100 border border-green-500 px-2 py-0.5 rounded-full">Square: {g.data.posA || 1}</div>
        </div>
        <div className="w-[1px] h-10 bg-black/10 mx-2" />
        <div className="flex flex-col items-center flex-1">
           <User size={20} className="mb-2 text-yellow-500" />
           <span className="text-[10px] font-black uppercase text-black/40 truncate w-20 text-center mb-1">{g.data.playerB || 'Player B'}</span>
           <span className="text-2xl font-black leading-none">{g.data.scoreB || 0}</span>
           <span className="text-[8px] font-black uppercase mt-1 opacity-40">Points</span>
           <div className="mt-2 text-[9px] font-black bg-yellow-100 border border-yellow-500 px-2 py-0.5 rounded-full">Square: {g.data.posB || 1}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full p-8 bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-black flex items-center gap-4">
              <RotateCcw size={48} className="text-red-500 animate-spin-slow" />
              Active Battles
            </h1>
            <p className="text-black/40 font-bold uppercase tracking-widest text-sm mt-2">Resume your ongoing matches anytime</p>
          </div>
          <Link to="/" onClick={playClick} className="bg-white border-4 border-black px-6 py-3 rounded-2xl shadow-[6px_6px_0_#000] font-black uppercase hover:-translate-y-1 transition-transform flex items-center gap-2">
            <Swords size={20} /> Back to Hub
          </Link>
        </div>

        {savedGames.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border-8 border-black p-20 rounded-[3rem] text-center shadow-[20px_20px_0_#e2e8f0]">
            <div className="text-8xl mb-8">🎮</div>
            <h2 className="text-4xl font-black uppercase italic mb-4">No Active Games</h2>
            <p className="text-black/40 font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed">Start a new match and save your progress to see it here!</p>
            <Link to="/" onClick={playClick} className="mt-12 inline-block bg-[#00f3ff] border-4 border-black px-12 py-5 rounded-2xl shadow-[8px_8px_0_#000] font-black uppercase text-xl hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">Go to Games Hub</Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {savedGames.map((g) => (
                <motion.div key={g.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="group relative bg-white border-4 border-black rounded-[2.5rem] p-8 shadow-[10px_10px_0_#000] hover:shadow-[15px_15px_0_#000] transition-all">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{g.icon}</span>
                      <div>
                        <h3 className="font-black uppercase italic leading-none">{g.name}</h3>
                        <div className="flex items-center gap-1 text-[10px] text-black/30 font-black mt-1"><Clock size={10} />{g.data.timestamp ? new Date(g.data.timestamp).toLocaleDateString() : 'Active Match'}</div>
                      </div>
                    </div>
                  </div>
                  {renderStats(g)}
                  <div className="flex gap-4">
                    <button onClick={() => { playClick(); navigate(`${g.path}?resume=true`); }} className="flex-1 bg-[#00ff88] border-4 border-black py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase italic shadow-[5px_5px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"><Play size={18} /> Resume</button>
                    <button onClick={() => deleteGame(g.id)} className="bg-red-500 text-white border-4 border-black p-4 rounded-2xl shadow-[5px_5px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"><Trash2 size={18} /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
