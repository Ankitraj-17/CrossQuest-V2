import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';

export default function ResetDialog({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-md bg-white border-8 border-black p-8 rounded-[2rem] shadow-[15px_15px_0_#000] relative"
        >
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 bg-yellow-300 border-4 border-black rounded-3xl flex items-center justify-center shadow-[6px_6px_0_#000]">
              <RotateCcw size={40} className="text-black" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase italic tracking-tight">Restart Match?</h2>
              <p className="text-gray-600 font-medium">All current progress will be lost. Are you sure you want to go back to setup?</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full pt-4">
              <button 
                onClick={onCancel}
                className="py-4 bg-white border-4 border-black font-black uppercase rounded-2xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                className="py-4 bg-yellow-400 border-4 border-black font-black uppercase rounded-2xl shadow-[4px_4px_0_#000] hover:translate-y-1 hover:shadow-none transition-all"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
