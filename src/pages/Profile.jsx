import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard } from '../utils/leaderboard';
import { Trophy, Clock, Target, Gamepad2, Swords, Award, Star, Zap, Trash2 } from 'lucide-react';
import { playClick } from '../utils/sounds';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const leaderboard = getLeaderboard();

  if (!user) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 bg-[#f8fafc]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center bg-white border-8 border-black p-12 rounded-[3rem] shadow-[20px_20px_0_#000]">
          <User size={80} className="mx-auto mb-6 opacity-20" />
          <h2 className="text-4xl font-black uppercase italic mb-4">Access Denied</h2>
          <p className="text-black/40 font-bold uppercase tracking-widest mb-8">Please login to view your player profile</p>
          <button onClick={() => navigate('/')} className="bg-yellow-300 border-4 border-black px-10 py-4 rounded-2xl shadow-[6px_6px_0_#000] font-black uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">Go to Hub</button>
        </motion.div>
      </div>
    );
  }

  // Calculate some stats from leaderboard
  // Use stats from user object
  const totalWins = user.matchesPlayed > 0 ? Math.floor(user.matchesPlayed * 0.6) : 0; // Simple simulation for now
  const totalGames = user.matchesPlayed || 0;
  const currentXp = user.xp || 0;
  const xpForNextLevel = 1000;
  const xpProgress = (currentXp % xpForNextLevel) / xpForNextLevel * 100;
  
  const mostPlayed = user.mostPlayed || "None";
  const recentBattles = user.recentBattles || [
    { game: 'System Boot', date: 'Just now', opponent: 'Arcade', result: 'Ready', reward: '+0 XP' }
  ];

  return (
    <div className="min-h-full p-8 bg-[#f0f9ff]">
      <div className="max-w-5xl mx-auto">
        
        {/* --- HERO PLAYER CARD --- */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="relative bg-white border-4 md:border-8 border-black rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 shadow-[10px_10px_0_#000] md:shadow-[25px_25px_0_#000] overflow-hidden mb-8 md:mb-12"
        >
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-yellow-300/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-12">
            {/* Avatar Section */}
            <div className="relative group">
              <motion.div 
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] md:rounded-[3rem] border-4 md:border-8 border-black bg-white shadow-[6px_6px_0_#00f3ff] overflow-hidden p-1.5"
              >
                <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-[1.5rem] md:rounded-[2rem]" />
              </motion.div>
              <div className="absolute -bottom-2 -right-2 md:-bottom-4 md:-right-4 bg-[#fff200] border-2 md:border-4 border-black px-3 md:px-6 py-1 md:py-2 rounded-xl md:rounded-2xl font-black italic shadow-[3px_3px_0_#000]">
                LVL {user.level || 1}
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4 mb-2 flex-wrap">
                <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-black break-words">{user.name}</h1>
                <Award size={30} className="text-[#ffcc00] animate-bounce shrink-0" />
              </div>
              <p className="text-black/40 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-sm mb-6 md:mb-8 flex items-center justify-center md:justify-start gap-2">
                <Star size={14} className="fill-black/40" /> Elite Arcade Member
              </p>
              
              {/* XP Bar */}
              <div className="max-w-md">
                <div className="flex justify-between items-end mb-1 md:mb-2">
                   <span className="font-black text-[9px] md:text-xs uppercase tracking-widest text-black/50">Experience Points (XP)</span>
                   <span className="font-black text-xs md:text-sm italic">{currentXp} / {xpForNextLevel * (user.level || 1)}</span>
                </div>
                <div className="h-4 md:h-6 w-full bg-black/5 rounded-full border-2 md:border-4 border-black overflow-hidden p-0.5 md:p-1">
                   <motion.div 
                     initial={{ width: 0 }} 
                     animate={{ width: `${xpProgress || 5}%` }} 
                     className="h-full bg-gradient-to-r from-[#00f3ff] to-[#fff200] rounded-full" 
                   />
                </div>
              </div>
            </div>

            {/* Quick Stats Header */}
            <div className="flex flex-row md:flex-col gap-3 md:gap-4 w-full md:w-auto">
               <div className="flex-1 md:w-48 bg-slate-50 border-2 md:border-4 border-black p-3 md:p-4 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-4 shadow-[4px_4px_0_#000]">
                  <div className="p-1.5 md:p-2 bg-yellow-300 rounded-lg md:rounded-xl border border-black"><Trophy size={16} /></div>
                  <div>
                    <div className="text-[8px] md:text-[10px] font-black uppercase opacity-40 leading-none mb-1">Wins</div>
                    <div className="text-xl md:text-2xl font-black italic leading-none">{totalWins}</div>
                  </div>
               </div>
               <div className="flex-1 md:w-48 bg-slate-50 border-2 md:border-4 border-black p-3 md:p-4 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-4 shadow-[4px_4px_0_#000]">
                  <div className="p-1.5 md:p-2 bg-[#00ff88] rounded-lg md:rounded-xl border border-black"><Swords size={16} /></div>
                  <div>
                    <div className="text-[8px] md:text-[10px] font-black uppercase opacity-40 leading-none mb-1">Rank</div>
                    <div className="text-xl md:text-2xl font-black italic leading-none">#{15 - (user.level || 1)}</div>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {[
            { label: 'Total Play Time', value: user.totalPlayTime ? `${(user.totalPlayTime / 60).toFixed(1)}m` : '0m', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Matches Played', value: totalGames, icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Most Played', value: mostPlayed, icon: Target, color: 'text-red-500', bg: 'bg-red-50' },
            { label: 'Skill Rating', value: 800 + (user.xp || 0), icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          ].map((s, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white border-4 border-black p-6 rounded-[2rem] shadow-[8px_8px_0_#000] flex flex-col items-center text-center"
            >
              <div className={`${s.bg} p-4 rounded-2xl border-2 border-black mb-4`}>
                <s.icon className={s.color} size={32} />
              </div>
              <div className="text-[10px] font-black uppercase opacity-40 mb-1">{s.label}</div>
              <div className="text-3xl font-black italic tracking-tighter">{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* --- RECENT ACTIVITY --- */}
        <div className="bg-white border-4 border-black rounded-[3rem] p-10 shadow-[15px_15px_0_#000]">
           <div className="flex items-center justify-between mb-8">
             <h2 className="text-3xl font-black uppercase italic flex items-center gap-3"><Clock size={28} className="text-red-500" /> Recent Battles</h2>
             <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Auto-Updating Stats</span>
           </div>
           
           <div className="space-y-4">
              {recentBattles.map((act, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 border-2 border-black rounded-2xl hover:bg-[#f0f9ff] transition-colors group">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white border-2 border-black rounded-xl flex items-center justify-center font-black group-hover:bg-[#00f3ff] transition-colors">{act.game[0]}</div>
                      <div>
                        <div className="font-black uppercase text-sm leading-none mb-1">{act.game}</div>
                        <div className="text-[10px] font-black opacity-30 uppercase tracking-widest flex items-center gap-2">
                           vs {act.opponent} <span className="w-1 h-1 rounded-full bg-black/20" /> {act.date}
                        </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className={`text-xl font-black italic uppercase ${act.result === 'Win' ? 'text-green-500' : 'text-red-500'}`}>{act.result}</div>
                      <div className="bg-white border-2 border-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{act.reward}</div>
                   </div>
                </div>
              ))}
           </div>

           <button 
             onClick={() => { playClick(); logout(); navigate('/'); }}
             className="mt-12 w-full bg-red-500 text-white border-4 border-black py-5 rounded-[2rem] shadow-[8px_8px_0_#000] font-black uppercase text-xl hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4 group"
           >
             <LogOut size={24} className="group-hover:-translate-x-1 transition-transform" /> Retire from Arena
           </button>
        </div>

      </div>
    </div>
  );
}

function LogOut({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

function User({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 7a4 4 0 0 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  );
}
