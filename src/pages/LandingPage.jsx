import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Swords, Trophy, Target, Zap, Star, Sparkles, 
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { playSlash } from '../utils/sounds';
import { useEffect, useMemo, useState } from 'react';

export default function LandingPage({ onEnter }) {
  const [burstingTiles, setBurstingTiles] = useState(new Set());
  
  // Track window size for pixel-perfect collision math
  const [win, setWin] = useState({ 
    w: typeof window !== 'undefined' ? window.innerWidth : 1200, 
    h: typeof window !== 'undefined' ? window.innerHeight : 800 
  });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Subtle 3D rotation based on mouse movement
  const rotateX = useTransform(y, [-300, 300], [5, -5]);
  const rotateY = useTransform(x, [-300, 300], [-5, 5]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      x.set(e.clientX - win.w / 2);
      y.set(e.clientY - win.h / 2);
    };

    const handleResize = () => {
      setWin({ w: window.innerWidth, h: window.innerHeight });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [x, y, win.w, win.h]);

  const handleEnter = () => {
    playSlash();
    onEnter();
  };

  const handleTileClick = (index) => {
    if (burstingTiles.has(index)) return;
    
    // Trigger burst animation
    setBurstingTiles(prev => new Set([...prev, index]));
    
    // Respawn the tile after 1.5 seconds
    setTimeout(() => {
      setBurstingTiles(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 1500);
  };

  // Generate responsive, mathematically perfect bouncing animations
  const floatingElements = useMemo(() => {
    const icons = [Trophy, Target, Zap, Star, Sparkles, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const colors = ['#ffcc00', '#ff3333', '#00f3ff', '#86efac', '#ff3399', '#00ff88'];
    
    const generateItem = (side, i, total) => {
      // 1. PRECISE BOUNDARY CALCULATION (CRITICAL: ZERO OVERLAP)
      // Card max-widths from CSS: sm:672px, lg:896px
      const cardWidth = win.w < 640 ? win.w * 0.85 : (win.w < 1024 ? Math.min(win.w * 0.85, 672) : 896);
      const cardShadow = win.w < 640 ? 15 : 20;
      const safetyBuffer = 30; // Mandatory 30px air gap from the shadow edge
      
      // Tile radius (approx half-width including padding/borders)
      const tileRadius = win.w < 768 ? 22 : 38;
      
      // The absolute inner-most X coordinate a tile's CENTER can have
      const minSafeX = (cardWidth / 2) + cardShadow + safetyBuffer + tileRadius;
      const screenMaxX = win.w / 2;
      
      // The absolute outer-most X coordinate to stay on screen
      const maxSafeX = screenMaxX - tileRadius - 10;
      
      const availableSpace = Math.max(0, maxSafeX - minSafeX);
      
      // 2. Vertical distribution (Perfect spacing)
      const ySpread = win.h * 0.85;
      const yStep = total > 1 ? ySpread / (total - 1) : 0;
      const baseY = -(ySpread / 2) + (i * yStep);
      
      // 3. Dynamic Pattern Logic
      let baseX;
      if (availableSpace > 80) {
        // Desktop: High-end zigzag pattern using the full available corridor
        const isOuter = i % 2 === 0;
        baseX = minSafeX + (isOuter ? availableSpace : 0);
      } else {
        // Mobile/Small Screen: Center perfectly in whatever small gap remains
        baseX = minSafeX + (availableSpace / 2);
      }
      
      // 4. Final coordinates and organic float
      const finalX = (side === 'left' ? -baseX : baseX) + (Math.random() - 0.5) * 10;
      const finalY = baseY + (Math.random() - 0.5) * 15;
      
      const startX = side === 'left' ? -win.w - 100 : win.w + 100;

      return {
        Icon: icons[Math.floor(Math.random() * icons.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: i * 0.08, 
        
        startX: startX,
        startY: finalY,
        bounceX: finalX,
        bounceY: finalY,
        restX: finalX,
        restY: finalY,
        
        rotateStart: side === 'left' ? -180 : 180,
        rotateBounce: side === 'left' ? -20 : 20,
        rotateRest: (Math.random() - 0.5) * 30,

        scale: win.w < 768 ? 0.5 : 0.8 + (Math.random() * 0.2), 
        depth: 0.5 + Math.random() * 1.5 
      };
    };

    const elements = [];
    const tilesPerSide = 8; // Reduced count for a clean, premium, uncluttered look
    
    // Generate Right Side
    for (let i = 0; i < tilesPerSide; i++) {
      elements.push(generateItem('right', i, tilesPerSide));
    }
    // Generate Left Side
    for (let i = 0; i < tilesPerSide; i++) {
      elements.push(generateItem('left', i, tilesPerSide));
    }
    
    return elements;
  }, [win.w, win.h]);

  // Subtle background dust particles
  const bgParticles = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10
    }));
  }, []);

  // Rapid energy streaks for a "high-speed" feel
  const energyStreaks = useMemo(() => {
    return Array.from({ length: 8 }).map(() => ({
      y: Math.random() * 100,
      width: 150 + Math.random() * 300,
      duration: 1.5 + Math.random() * 2,
      delay: Math.random() * 15
    }));
  }, []);

  return (
    // STRICT NO SCROLLING: Reverted to overflow-hidden.
    <div 
      onMouseMove={(e) => {
        x.set(e.clientX - window.innerWidth / 2);
        y.set(e.clientY - window.innerHeight / 2);
      }}
      className="relative w-full h-[100dvh] overflow-hidden bg-white font-mono select-none flex items-center justify-center p-4 sm:p-8"
    >
      
      {/* 1. ATMOSPHERIC BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Dynamic Energy Streaks */}
        {energyStreaks.map((s, i) => (
          <motion.div
            key={`streak-${i}`}
            initial={{ x: "-150%", opacity: 0 }}
            animate={{ x: "250%", opacity: [0, 0.8, 0] }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "linear" }}
            style={{ top: `${s.y}vh`, width: s.width, height: '2px' }}
            className="absolute bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f3ff]"
          />
        ))}

        {/* Floating Dust Particles */}
        {bgParticles.map((p, i) => (
          <motion.div
            key={`bgp-${i}`}
            initial={{ opacity: 0, y: "110vh" }}
            animate={{ opacity: [0, 0.4, 0], y: "-10vh" }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
            style={{ left: `${p.x}vw`, width: p.size, height: p.size }}
            className="absolute bg-black rounded-full"
          />
        ))}

        {/* Vibrant Drifting Glows */}
        <motion.div 
          animate={{ 
            x: [0, 150, 0], 
            y: [0, 100, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-cyan-200/40 rounded-full blur-[140px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -150, 0], 
            y: [0, -100, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-pink-200/40 rounded-full blur-[140px]"
        />


        {/* Moving Dot Grid (Parallax) */}
        <motion.div 
          style={{ 
            x: useTransform(x, [-win.w/2, win.w/2], [25, -25]),
            y: useTransform(y, [-win.h/2, win.h/2], [25, -25]),
            backgroundImage: 'radial-gradient(rgba(0,0,0,0.15) 2px, transparent 0)',
            backgroundSize: '50px 50px'
          }}
          className="absolute inset-[-150px]"
        />

        {/* Pulsing Vignette Overlay */}
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"
        />
      </div>

      {/* 2. RESPONSIVE BOUNCE ANIMATION LAYER */}
      <div className="absolute top-1/2 left-1/2 z-40 w-full h-full pointer-events-none">
        {floatingElements.map((item, i) => {
          const isBursting = burstingTiles.has(i);
          
          return (
            <motion.div
              key={i}
              onClick={() => handleTileClick(i)}
              className="absolute p-2 sm:p-3 md:p-4 bg-white border-[2px] sm:border-[3px] border-black shadow-[4px_4px_0_#000] rounded-xl pointer-events-auto cursor-pointer"
              style={{ 
                zIndex: isBursting ? 100 : Math.floor(item.depth * 10),
                x: '-50%',
                y: '-50%',
                left: 0, 
                top: 0
              }}
              
              drag
              dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
              dragElastic={0.2}
              whileDrag={{ scale: 1.2, zIndex: 100, boxShadow: "10px 10px 0 #000" }}
              
              initial={{ 
                x: item.startX, 
                y: item.startY, 
                scale: 0, 
                opacity: 0,
                rotate: item.rotateStart
              }}
              animate={isBursting ? {
                // The BURST explosion effect
                scale: [item.scale, item.scale * 3, 0],
                opacity: [1, 0.8, 0],
                rotate: [item.rotateRest, item.rotateRest + 180, item.rotateRest + 360],
                x: item.restX, // Stay in place while bursting
                y: item.restY
              } : { 
                // Normal bounce sequence
                x: [item.startX, item.bounceX, item.restX],
                y: [item.startY, item.bounceY, item.restY],
                scale: [0, item.scale * 1.3, item.scale], 
                opacity: [0, 1, 1], 
                rotate: [item.rotateStart, item.rotateBounce, item.rotateRest],
              }}
              transition={isBursting ? {
                duration: 0.6,
                ease: "easeOut"
              } : { 
                duration: 2.5,
                times: [0, 0.4, 1], 
                ease: ["easeIn", "easeOut"],
                delay: item.delay
              }}
            >
              <motion.div
                animate={isBursting ? {} : { 
                  y: [0, -10 * item.depth, 0], 
                  rotate: [0, 5 * item.depth, 0],
                }}
                transition={{ 
                  duration: 3 + item.depth, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: item.delay + 2.5 
                }}
              >
                <item.Icon className="w-5 h-5 sm:w-8 sm:h-8" color={item.color} fill={item.color + '20'} strokeWidth={2.5} />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. OPTIMIZED CENTER CARD */}
      {/* 
        This is perfectly optimized to NEVER overflow on mobile or desktop. 
        It uses max-h-full, flexible gaps, and strict max-widths.
      */}
      <main className="relative z-30 w-full flex items-center justify-center h-full max-h-[90vh] md:max-h-[85vh]">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="relative flex flex-col items-center justify-center bg-white p-6 sm:p-8 md:p-12 border-[4px] sm:border-[6px] md:border-[8px] border-black shadow-[15px_15px_0_#000] sm:shadow-[20px_20px_0_#000] rounded-[2rem] sm:rounded-[3rem] w-full max-w-[85%] sm:max-w-2xl lg:max-w-4xl max-h-full overflow-hidden"
        >
          {/* Internal wrapper handles flexible spacing without overflowing the parent */}
          <div className="flex flex-col items-center justify-center w-full h-full gap-4 sm:gap-6 md:gap-8">
            
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="bg-[#ff3399] px-4 sm:px-8 py-2 border-[3px] border-black shadow-[4px_4px_0_#000] rounded-full text-white font-black text-xs sm:text-sm md:text-base uppercase tracking-widest whitespace-nowrap flex-shrink-0"
            >
              Level Up Your Fun!
            </motion.div>

            <motion.div
              animate={{ rotateZ: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="bg-yellow-300 p-3 sm:p-4 rounded-2xl border-[3px] sm:border-[4px] border-black shadow-[4px_4px_0_#000] flex-shrink-0"
            >
              <Swords className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" color="#000" strokeWidth={3} />
            </motion.div>

            {/* Fluid typography automatically shrinks on small screens */}
            <h1 className="font-black text-[clamp(3rem,10vw,6rem)] md:text-[clamp(5rem,8vw,8rem)] leading-[0.85] uppercase tracking-tighter text-black text-center italic w-full flex-shrink">
              <motion.span 
                style={{ WebkitTextStroke: '2px black' }}
                className="md:[WebkitTextStroke:3px_black]"
                animate={{ color: ['#000', '#00f3ff', '#ff3399', '#000'] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                CROSS
              </motion.span>
              <br/>
              <span className="text-[#ff3399] inline-block shadow-none [text-shadow:4px_4px_0_#000] sm:[text-shadow:6px_6px_0_#000] md:[text-shadow:8px_8px_0_#000]" style={{ WebkitTextStroke: '2px black' }} >
                QUEST
              </span>
            </h1>

            <p className="font-bold text-[clamp(0.7rem,2vw,1rem)] md:text-[clamp(1rem,1.5vw,1.2rem)] uppercase tracking-widest text-black bg-[#86efac] border-[3px] md:border-[4px] border-black px-4 sm:px-8 py-2 md:py-3 shadow-[4px_4px_0_#000] md:shadow-[6px_6px_0_#000] -rotate-2 text-center w-full max-w-[90%] flex-shrink-0">
              The Ultimate Board Game Arena
            </p>

            <motion.button
              whileHover={{ 
                scale: 1.05, 
                rotate: 2,
                boxShadow: "8px 8px 0 #000",
                backgroundColor: "#00f3ff"
              }}
              whileTap={{ scale: 0.95, rotate: 0, boxShadow: "0px 0px 0 #000" }}
              onClick={handleEnter}
              className="bg-[#00ff88] text-black font-black text-[clamp(1.2rem,4vw,2rem)] md:text-[clamp(2rem,3vw,3rem)] uppercase tracking-widest py-3 sm:py-4 md:py-5 px-8 sm:px-12 md:px-16 border-[4px] sm:border-[5px] border-black shadow-[6px_6px_0_#000] md:shadow-[8px_8px_0_#000] rounded-xl sm:rounded-2xl transition-colors duration-300 flex items-center justify-center gap-2 sm:gap-4 w-auto flex-shrink-0 mt-2"
            >
              PLAY NOW <Zap className="w-5 h-5 sm:w-8 sm:h-8" fill="currentColor" />
            </motion.button>

          </div>
        </motion.div>
      </main>

    </div>
  );
}
