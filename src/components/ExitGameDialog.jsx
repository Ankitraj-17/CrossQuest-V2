import { motion, AnimatePresence } from 'framer-motion';
import { Save, Trash2, X, AlertTriangle } from 'lucide-react';

export default function ExitGameDialog({ isOpen, onSave, onDelete, onCancel }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md bg-white border-[6px] border-black shadow-[15px_15px_0_#000] rounded-[2.5rem] p-8 overflow-hidden"
          >
            {/* Top Warning Strip */}
            <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400" />
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-yellow-100 p-4 rounded-full mb-6 border-4 border-black">
                <AlertTriangle size={40} className="text-yellow-600" />
              </div>
              
              <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Wait a Minute!</h2>
              <p className="text-black/60 font-bold uppercase text-xs tracking-widest mb-8">You are leaving in the middle of a match</p>
              
              <div className="grid grid-cols-1 w-full gap-4">
                <button 
                  onClick={onSave}
                  className="bg-[#00ff88] py-4 px-6 border-4 border-black shadow-[6px_6px_0_#000] rounded-2xl flex items-center justify-center gap-3 font-black uppercase italic hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group"
                >
                  <Save size={20} /> Save Progress
                </button>
                
                <button 
                  onClick={onDelete}
                  className="bg-red-500 text-white py-4 px-6 border-4 border-black shadow-[6px_6px_0_#000] rounded-2xl flex items-center justify-center gap-3 font-black uppercase italic hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  <Trash2 size={20} /> Delete Match
                </button>
                
                <button 
                  onClick={onCancel}
                  className="py-4 px-6 font-black uppercase text-xs opacity-40 hover:opacity-100 flex items-center justify-center gap-2"
                >
                  <X size={16} /> Just Kidding, Keep Playing
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
