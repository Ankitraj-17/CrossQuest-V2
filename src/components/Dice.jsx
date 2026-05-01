import { motion } from 'framer-motion';

const faceLayouts = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 3, 6, 2, 5, 8]
};

const DiceFace = ({ value, style }) => {
  const dots = faceLayouts[value] || [4];
  return (
    <div 
      style={{ ...style, backgroundColor: '#ffffff' }}
      className="absolute inset-0 border-2 md:border-4 border-black rounded-lg md:rounded-xl flex items-center justify-center p-1 md:p-2 shadow-inner backface-hidden"
    >
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0.5 md:gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {dots.includes(i) && (
              <div className="w-[60%] h-[60%] rounded-full bg-black shadow-sm" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export function Dice({ value, rolling, size = 'default' }) {
  const faceRotations = {
    1: { rotateX: 0,   rotateY: 0 },
    2: { rotateX: 0,   rotateY: 90 },
    3: { rotateX: 90,  rotateY: 0 },
    4: { rotateX: -90, rotateY: 0 },
    5: { rotateX: 0,   rotateY: -90 },
    6: { rotateX: 0,   rotateY: 180 }
  };

  const targetRotation = faceRotations[value] || faceRotations[1];
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
  const cubeSize = size === 'sm' ? 40 : (isDesktop ? 80 : 64);
  const z = cubeSize / 2;

  return (
    <div className="flex items-center justify-center perspective-1000" style={{ width: cubeSize, height: cubeSize }}>
      <motion.div 
        className="relative preserve-3d w-full h-full"
        animate={rolling ? {
          rotateX: [0, 360, 720],
          rotateY: [0, 720, 1440],
          scale: [1, 1.1, 1],
        } : targetRotation}
        transition={rolling ? { duration: 0.8, repeat: Infinity, ease: "linear" } : { type: "spring", stiffness: 260, damping: 20 }}
      >
        <DiceFace value={1} style={{ transform: `rotateY(0deg) translateZ(${z}px)` }} />
        <DiceFace value={6} style={{ transform: `rotateY(180deg) translateZ(${z}px)` }} />
        <DiceFace value={5} style={{ transform: `rotateY(90deg) translateZ(${z}px)` }} />
        <DiceFace value={2} style={{ transform: `rotateY(-90deg) translateZ(${z}px)` }} />
        <DiceFace value={3} style={{ transform: `rotateX(-90deg) translateZ(${z}px)` }} />
        <DiceFace value={4} style={{ transform: `rotateX(90deg) translateZ(${z}px)` }} />
      </motion.div>
    </div>
  );
}

export function DiceCapsule({ value, rolling, color = '#ffffff', onRoll, label = "ROLL DICE" }) {
  return (
    <div 
      className="flex flex-col items-center gap-4 p-4 rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0_#000] w-full max-w-[170px] md:max-w-[200px] select-none"
      style={{ backgroundColor: color }}
    >
      <div 
        onClick={() => { if (!rolling && onRoll) onRoll(); }}
        className={`relative w-28 h-28 md:w-36 md:h-36 bg-white rounded-2xl border-2 border-black flex items-center justify-center ${!rolling ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
      >
         <Dice value={value} rolling={rolling} />
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); if (onRoll) onRoll(); }}
        disabled={rolling}
        className="w-full bg-black text-white py-3 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest active:translate-y-0.5 transition-all disabled:opacity-70"
      >
        {rolling ? "ROLLING" : label}
      </button>
    </div>
  );
}
