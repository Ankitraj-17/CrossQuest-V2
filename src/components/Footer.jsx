import { Swords, Heart, Zap, Star, Trophy, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative z-50 bg-white border-t-[5px] border-black py-12 px-6 md:px-12 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        
        {/* Top Section: Brand & Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-4 group">
            <div className="bg-[#fff200] p-2.5 rounded-xl border-4 border-black shadow-[4px_4px_0_#000] group-hover:rotate-6 transition-transform">
              <Swords size={24} color="#000" strokeWidth={3} />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-black text-xl uppercase tracking-tighter leading-none italic">Cross</span>
              <span className="font-black text-xl uppercase tracking-tighter leading-none italic opacity-30">Quest</span>
            </div>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-4">
            {['Home', 'Leaderboard', 'How to Play', 'Saved Games', 'Profile'].map((link) => (
              <Link 
                key={link} 
                to={link === 'Home' ? '/' : `/${link.toLowerCase().replace(/ /g, '-')}`} 
                className="font-black uppercase text-xs tracking-widest hover:text-[#ff3399] transition-colors"
              >
                {link}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a href="#" className="p-2 bg-white border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all shadow-[3px_3px_0_#000] active:translate-y-0.5 active:shadow-none"><Zap size={18} strokeWidth={3} /></a>
            <a href="#" className="p-2 bg-white border-2 border-black rounded-lg hover:bg-[#fff200] hover:text-black transition-all shadow-[3px_3px_0_#000] active:translate-y-0.5 active:shadow-none"><Star size={18} strokeWidth={3} /></a>
            <a href="#" className="p-2 bg-white border-2 border-black rounded-lg hover:bg-[#ff3399] hover:text-white transition-all shadow-[3px_3px_0_#000] active:translate-y-0.5 active:shadow-none"><Trophy size={18} strokeWidth={3} /></a>
          </div>
        </div>

        {/* Middle Section: Credits */}
        <div className="flex flex-col md:flex-row justify-between items-center py-8 border-t-2 border-dashed border-black/10 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-black flex items-center justify-center">
               <Heart size={18} fill="#ff3399" className="text-[#ff3399] animate-pulse" />
            </div>
            <p className="font-black uppercase text-[10px] tracking-[0.15em] text-black/40">
               Engineered with passion by <span className="text-black opacity-100 italic">Ankit Raj Jha</span>
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-[#00f3ff]/10 px-4 py-2 rounded-full border-2 border-[#00f3ff]/30">
               <ShieldCheck size={16} className="text-[#00ccff]" />
               <span className="text-[10px] font-black uppercase text-[#0088aa]">Secure Arena v2.5</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">
               © 2026 Battle Arcade Project
            </p>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="text-center">
           <div className="inline-block px-8 py-2 bg-black text-white text-[9px] font-black uppercase tracking-[0.4em] rounded-full border-2 border-black">
              The Ultimate Cross-Platform Mini-Game Hub
           </div>
        </div>

      </div>
    </footer>
  );
}
