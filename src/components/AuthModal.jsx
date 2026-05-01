import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, Swords, User, Zap, ChevronLeft } from 'lucide-react';
import { playClick } from '../utils/sounds';

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      playClick();
      onLogin({ 
        name: name.trim(), 
        avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name.trim()}` 
      });
      onClose();
    }
  };

  const handleClose = () => {
    playClick();
    onClose();
  };

  // Pixel border helper
  const pixelBorder = "border-[4px] border-black shadow-none";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-white/20 backdrop-blur-md cursor-pointer"
          />

          {/* PIXEL ART MODAL (Matches Hub Design) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`relative w-full max-w-[360px] bg-white ${pixelBorder} p-10 overflow-hidden`}
            style={{
              // Creating a pixelated corner look using CSS clip-path or multiple borders
              // For simplicity and maximum compatibility with their existing styles, 
              // I will use a solid blocky design with no rounded corners to feel like pixel art.
              borderRadius: '0px', 
              clipPath: 'polygon(0 8px, 4px 8px, 4px 4px, 8px 4px, 8px 0, calc(100% - 8px) 0, calc(100% - 8px) 4px, calc(100% - 4px) 4px, calc(100% - 4px) 8px, 100% 8px, 100% calc(100% - 8px), calc(100% - 4px) calc(100% - 8px), calc(100% - 4px) calc(100% - 4px), calc(100% - 8px) calc(100% - 4px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 4px), 4px calc(100% - 4px), 4px calc(100% - 8px), 0 calc(100% - 8px))'
            }}
          >
            {/* Inner Border Line (Pixel Detail) */}
            <div className="absolute inset-2 border-2 border-slate-100 pointer-events-none" />
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8 relative z-10">
              <button 
                onClick={handleClose}
                className="p-2 border-4 border-black hover:bg-slate-50 transition-colors bg-white"
              >
                <ChevronLeft size={20} color="#000" strokeWidth={3} />
              </button>
              <span className="font-black text-[11px] uppercase tracking-tighter text-black">Login Token</span>
              <button 
                onClick={handleClose}
                className="p-2 border-4 border-black hover:bg-slate-50 transition-colors bg-white"
              >
                <X size={20} color="#000" strokeWidth={3} />
              </button>
            </div>

            {/* Icon & Title (8-bit style) */}
            <div className="text-center mb-10 relative z-10">
              <div className="bg-[#fff200] w-16 h-16 border-4 border-black flex items-center justify-center mx-auto mb-6">
                 <Swords size={32} className="text-black" strokeWidth={3} />
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-black leading-none italic">
                Player <br/> <span className="bg-[#00f3ff] px-2 border-2 border-black inline-block mt-2">Login</span>
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                   <User size={20} className="text-black" strokeWidth={3} />
                </div>
                <input 
                  autoFocus
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="NAME..."
                  className="w-full bg-slate-50 border-4 border-black p-5 pl-14 font-black text-lg text-black focus:outline-none focus:bg-white transition-all placeholder:text-black/10 uppercase tracking-tighter"
                />
              </div>

              <button 
                type="submit"
                disabled={!name.trim()}
                className="w-full bg-black text-white border-4 border-black p-5 font-black uppercase text-xl italic hover:bg-[#00f3ff] hover:text-black transition-all disabled:opacity-20 flex items-center justify-center gap-3"
              >
                <LogIn size={24} strokeWidth={3} /> ENTER HUB
              </button>
            </form>

            <div className="mt-10 flex flex-col items-center gap-2">
               <div className="flex items-center gap-2 px-3 py-1 bg-white border-2 border-black">
                  <Zap size={14} className="text-[#fff200] fill-[#fff200]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-black">Arcade v2.5</span>
               </div>
               <div className="w-full h-2 bg-slate-50 border-2 border-black mt-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-[#00f3ff]" 
                  />
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
