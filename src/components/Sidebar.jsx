import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Gamepad2, Trophy, BookOpen, Swords, RotateCcw, User, LogOut, LogIn, ChevronRight, Zap, Star } from 'lucide-react';
import { playClick } from '../utils/sounds';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const LINKS = [
  { to: '/',            label: 'Games Hub',    icon: Gamepad2, color: '#00f3ff' },
  { to: '/saved-games', label: 'Active Battles', icon: RotateCcw, color: '#00f3ff' },
  { to: '/leaderboard', label: 'Hall of Fame', icon: Trophy, color: '#fff200' },
  { to: '/how-to-play',   label: 'How to Play',  icon: BookOpen, color: '#00ff88' },
];

const GAME_NAMES = {
  '/ludo': 'Ludo Arena',
  '/snake-ladder': 'Snake & Ladder',
  '/tictactoe': 'Tic Tac Toe',
  '/chess': 'Chess Strategy',
};

export default function Sidebar({ onLogoClick }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, logout, login } = useAuth();
  const [activeCount, setActiveCount] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Logo Click Handler
  const handleLogoClick = (e) => {
    e.preventDefault();
    playClick();
    if (onLogoClick) onLogoClick();
    navigate('/');
  };

  useEffect(() => {
    const refresh = () => {
      let count = 0;
      ['snakeladder', 'ludo', 'tictactoe', 'chess'].forEach(id => {
        if (localStorage.getItem(`active_game_${id}`)) count++;
      });
      setActiveCount(count);
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentGame = GAME_NAMES[loc.pathname];

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-[280px] h-screen sticky top-0 bg-white border-r-[5px] border-black p-10 z-[100]">
        {/* Brand Header */}
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-4 mb-12 hover:-translate-y-0.5 transition-transform group">
          <div className="bg-[#fff200] p-3 rounded-2xl border-4 border-black shadow-[5px_5px_0_#000] group-hover:rotate-3 transition-transform">
            <Swords size={30} color="#000" strokeWidth={3} />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="font-black text-3xl uppercase tracking-tighter leading-none text-black italic">Cross</span>
            <span className="font-black text-3xl uppercase tracking-tighter leading-none text-black italic drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">Quest</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-3.5 mb-12">
          {LINKS.map(l => {
            const isActive = loc.pathname === l.to;
            return (
              <Link key={l.to} to={l.to} onClick={playClick} className="block group">
                <div className={`flex items-center gap-3.5 padding p-4 px-5 rounded-2xl border-4 border-black font-black text-sm uppercase relative transition-all ${isActive ? 'bg-[#00f3ff] translate-x-1 shadow-[4px_4px_0_#000]' : 'bg-white hover:bg-slate-50 hover:translate-x-1'}`}>
                  <l.icon size={20} strokeWidth={3} />
                  {l.label}
                  {l.to === '/saved-games' && activeCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-white font-black shadow-[0_0_0_2px_#ff0000]">
                      {activeCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Player Section */}
        <div className="pt-6 border-t-[5px] border-black relative">
          <div className="absolute -top-3.5 left-5 bg-white px-2.5 text-[10px] italic font-black uppercase text-black">Arena Pilot</div>
          <AnimatePresence mode="wait">
            {user ? (
              <motion.div key="user" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3.5">
                <div onClick={() => navigate('/profile')} className="p-4 rounded-3xl bg-white border-4 border-black cursor-pointer flex items-center gap-3 hover:translate-x-1 hover:bg-[#eefaff] transition-all group">
                  <div className="relative shrink-0">
                    <img src={user.avatar} alt="P" className="w-12 h-12 rounded-xl border-4 border-black bg-slate-100" />
                    <div className="absolute -bottom-1 -right-1 bg-[#fff200] rounded-full p-1 border-2 border-black">
                      <Star size={8} fill="#000" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-base uppercase truncate">{user.name}</div>
                    {currentGame ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse border border-black" />
                        <span className="text-[8px] font-black uppercase text-black/50 truncate">Live: {currentGame}</span>
                      </div>
                    ) : (
                      <div className="h-2.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden border-2 border-black">
                        <div className="h-full bg-[#00f3ff]" style={{ width: `${(user.xp % 1000) / 10}%` }} />
                      </div>
                    )}
                  </div>
                  <ChevronRight size={16} strokeWidth={3} className="text-black/30 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="flex justify-between items-center px-1">
                  <button onClick={logout} className="text-[9px] font-black uppercase opacity-30 hover:opacity-100 hover:underline">Exit Session</button>
                  <span className="text-[9px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded-lg border-2 border-black">LVL {String(user.level || 1).padStart(2, '0')}</span>
                </div>
              </motion.div>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="w-full p-5 rounded-3xl bg-[#fff200] border-4 border-black font-black uppercase text-base flex items-center justify-center gap-2.5 hover:translate-x-1 hover:bg-black hover:text-[#fff200] transition-all shadow-[6px_6px_0_#000] active:shadow-none active:translate-y-1">
                <LogIn size={22} strokeWidth={3} /> Enter Arena
              </button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1" />
        <p className="font-black text-[9px] uppercase italic text-black/10 tracking-[0.2em] text-center">Battle Arcade v2.5</p>
      </aside>

      {/* --- MOBILE BOTTOM NAV --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t-[5px] border-black flex items-center justify-around px-4 z-[1000] shadow-[0_-10px_25px_rgba(0,0,0,0.1)]">
        {LINKS.map(l => {
          const isActive = loc.pathname === l.to;
          return (
            <Link key={l.to} to={l.to} onClick={playClick} className="relative">
              <div className={`p-3 rounded-xl border-[3px] border-black transition-all ${isActive ? 'bg-[#00f3ff] -translate-y-2 shadow-[4px_4px_0_#000]' : 'bg-white'}`}>
                <l.icon size={22} strokeWidth={3} />
              </div>
              {l.to === '/saved-games' && activeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-black">
                  {activeCount}
                </span>
              )}
            </Link>
          );
        })}
        {user ? (
          <Link to="/profile" onClick={playClick} className="relative">
             <div className={`p-1.5 rounded-xl border-[3px] border-black transition-all ${loc.pathname === '/profile' ? 'bg-[#fff200] -translate-y-2 shadow-[4px_4px_0_#000]' : 'bg-white'}`}>
                <img src={user.avatar} alt="P" className="w-7 h-7 rounded-lg border-2 border-black" />
             </div>
          </Link>
        ) : (
          <button onClick={() => setIsAuthModalOpen(true)} className="p-3 rounded-xl border-[3px] border-black bg-[#fff200] active:scale-95 transition-all">
            <User size={22} strokeWidth={3} />
          </button>
        )}
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={login} 
      />
    </>
  );
}
