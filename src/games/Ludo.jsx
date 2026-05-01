import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, Trophy, RotateCcw, Star as StarIcon } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { playClick, playMove, playScore, playWin } from '../utils/sounds';
import { Dice, DiceCapsule } from '../components/Dice';
import { recordResult } from '../utils/leaderboard';
import ExitGameDialog from '../components/ExitGameDialog';
import ResetDialog from '../components/ResetDialog';
import { useAuth } from '../context/AuthContext';

// --- LUDO CONSTANTS ---
const COLORS = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
const CONFIG = {
  RED:    { startIdx: 0,  bg: '#e31e24', light: '#ffcccc', secondary: '#9b1418' },
  GREEN:  { startIdx: 13, bg: '#00a651', light: '#ccffcc', secondary: '#006d35' },
  YELLOW: { startIdx: 26, bg: '#fff200', light: '#ffffcc', secondary: '#b2a900' },
  BLUE:   { startIdx: 39, bg: '#00aeef', light: '#cce0ff', secondary: '#00719b' }
};

const commonPath = [
  [1,6],[2,6],[3,6],[4,6],[5,6],[6,5],[6,4],[6,3],[6,2],[6,1],[6,0], [7,0],
  [8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[9,6],[10,6],[11,6],[12,6],[13,6],[14,6], [14,7],
  [14,8],[13,8],[12,8],[11,8],[10,8],[9,8],[8,9],[8,10],[8,11],[8,12],[8,13],[8,14], [7,14],
  [6,14],[6,13],[6,12],[6,11],[6,10],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8], [0,7],
  [0,6]
];

const SAFE_SQUARES = [[1,6], [6,2], [8,1], [12,6], [13,8], [8,12], [6,13], [2,8]];

const getPathCoords = (color) => {
  const start = CONFIG[color].startIdx;
  const path = [];
  for (let i = 0; i < 51; i++) path.push(commonPath[(start + i) % 52]);
  const homeRuns = {
    RED: [[1,7],[2,7],[3,7],[4,7],[5,7]], GREEN: [[7,1],[7,2],[7,3],[7,4],[7,5]],
    YELLOW: [[13,7],[12,7],[11,7],[10,7],[9,7]], BLUE: [[7,13],[7,12],[7,11],[7,10],[7,9]]
  };
  return [...path, ...homeRuns[color], [7,7]];
};

const Confetti = ({ color }) => {
  const particles = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0 pointer-events-none z-[200]">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: "50%", y: "50%", scale: 0, opacity: 1 }}
          animate={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, scale: Math.random() * 2 + 1, opacity: 0, rotate: Math.random() * 360 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ backgroundColor: color, width: 8, height: 8, borderRadius: Math.random() > 0.5 ? '50%' : '2px', position: 'absolute' }}
        />
      ))}
    </div>
  );
};

const Star = ({ x, y }) => (
  <g transform={`translate(${x*40 + 20}, ${y*40 + 20}) scale(0.6)`}>
    <path d="M 0 -30 L 8 -10 L 30 -10 L 12 5 L 20 25 L 0 12 L -20 25 L -12 5 L -30 -10 L -8 -10 Z" fill="rgba(0,0,0,0.15)" />
  </g>
);

const BoardSVG = () => (
  <svg viewBox="0 0 600 600" className="w-full h-full bg-white border-2 border-black">
    {COLORS.map(c => {
      const isTop = c === 'RED' || c === 'GREEN', isLeft = c === 'RED' || c === 'BLUE';
      const x = isLeft ? 0 : 360, y = isTop ? 0 : 360;
      return (
        <g key={c}>
          <rect x={x} y={y} width="240" height="240" fill={CONFIG[c].bg} stroke="black" strokeWidth="1" />
          <rect x={x+40} y={y+40} width="160" height="160" fill="white" stroke="black" strokeWidth="2" />
          {[80, 160].map(cx => [80, 160].map(cy => <circle key={`${cx}-${cy}`} cx={x+cx} cy={y+cy} r="20" fill={CONFIG[c].bg} stroke="black" opacity="0.2" />))}
        </g>
      );
    })}
    {Array.from({length: 15}).map((_, r) => Array.from({length: 15}).map((_, c) => {
      if ((r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c < 6) || (r > 8 && c > 8)) return null;
      if (r >= 6 && r <= 8 && c >= 6 && c <= 8) return null;
      let fill = "white";
      if (r === 7 && c > 0 && c < 6) fill = CONFIG.RED.bg;
      if (c === 7 && r > 0 && r < 6) fill = CONFIG.GREEN.bg;
      if (r === 7 && c > 8 && c < 14) fill = CONFIG.YELLOW.bg;
      if (c === 7 && r > 8 && r < 14) fill = CONFIG.BLUE.bg;
      if ((r === 6 && c === 1) || (r === 1 && c === 8) || (r === 8 && c === 13) || (r === 13 && c === 6)) {
        fill = r === 6 ? CONFIG.RED.bg : r === 1 ? CONFIG.GREEN.bg : r === 8 ? CONFIG.YELLOW.bg : CONFIG.BLUE.bg;
      }
      return <rect key={`${r}-${c}`} x={c*40} y={r*40} width="40" height="40" fill={fill} stroke="black" strokeWidth="1" />;
    }))}
    {SAFE_SQUARES.map(([x, y], i) => <Star key={i} x={x} y={y} />)}
    <path d="M240 240 L360 240 L300 300 Z" fill={CONFIG.GREEN.bg} stroke="black" />
    <path d="M360 240 L360 360 L300 300 Z" fill={CONFIG.YELLOW.bg} stroke="black" />
    <path d="M360 360 L240 360 L300 300 Z" fill={CONFIG.BLUE.bg} stroke="black" />
    <path d="M240 360 L240 240 L300 300 Z" fill={CONFIG.RED.bg} stroke="black" />
  </svg>
);

const Pawn = ({ color, isTurn, scale = 1 }) => (
  <motion.div animate={isTurn ? { y: [-2, 0, -2], scale: [scale, scale * 1.05, scale] } : { scale }} transition={{ repeat: Infinity, duration: 1 }} className="w-full h-full flex items-center justify-center p-[8%]">
    <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-lg">
      <path d="M50 0 C22 0 0 22 0 50 C0 85 50 120 50 120 C50 120 100 85 100 50 C100 22 78 0 50 0 Z" fill="white" stroke="black" strokeWidth="6" />
      <circle cx="50" cy="45" r="30" fill={CONFIG[color].bg} stroke="black" strokeWidth="3" />
    </svg>
  </motion.div>
);

export default function Ludo() {
  const { user, recordMatch } = useAuth();
  const playerNames = COLORS.map(c => c === 'RED' ? (user?.name || 'Player 1') : `Player ${COLORS.indexOf(c)+1}`);
  const [gameState, setGameState] = useState('SETUP'), [players, setPlayers] = useState({ RED: true, GREEN: true, YELLOW: false, BLUE: false });
  const [turn, setTurn] = useState('RED'), [dice, setDice] = useState(null), [rolling, setRolling] = useState(false), [busy, setBusy] = useState(false);
  const [winner, setWinner] = useState(null), [scores, setScores] = useState({ RED: 0, GREEN: 0, YELLOW: 0, BLUE: 0 });
  const [boardCue, setBoardCue] = useState(null), [showResetDialog, setShowResetDialog] = useState(false), [showExitDialog, setShowExitDialog] = useState(false);
  const navigate = useNavigate();
  const [pawns, setPawns] = useState({ RED: [-1,-1,-1,-1], GREEN: [-1,-1,-1,-1], YELLOW: [-1,-1,-1,-1], BLUE: [-1,-1,-1,-1] });
  const pawnPaths = useRef({ RED: getPathCoords('RED'), GREEN: getPathCoords('GREEN'), YELLOW: getPathCoords('YELLOW'), BLUE: getPathCoords('BLUE') });
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);
  const rollIntervalRef = useRef(null);
  const movementLock = useRef(false);

  const [searchParams] = useSearchParams();
  const shouldResume = searchParams.get('resume') === 'true';

  // Load saved game
  useEffect(() => {
    if (shouldResume) {
      const saved = localStorage.getItem('active_game_ludo');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setPawns(data.pawns || { RED: [-1,-1,-1,-1], GREEN: [-1,-1,-1,-1], YELLOW: [-1,-1,-1,-1], BLUE: [-1,-1,-1,-1] });
          setTurn(data.turn || 'RED');
          setScores(data.scores || {RED:0,GREEN:0,YELLOW:0,BLUE:0});
          setPlayers(data.players || { RED: true, GREEN: true, YELLOW: false, BLUE: false });
          setGameState('PLAYING');
        } catch (e) { console.error("Failed to load Ludo game", e); }
      }
    }
  }, [shouldResume]);

  const saveGame = () => {
    const data = { pawns, turn, scores, players, playerA: turn, playerB: 'Next', timestamp: Date.now() };
    localStorage.setItem('active_game_ludo', JSON.stringify(data));
    navigate('/');
  };

  const deleteGame = () => {
    localStorage.removeItem('active_game_ludo');
    navigate('/');
  };

  const nextTurn = useCallback(() => {
    const active = COLORS.filter(c => players[c]);
    setTurn(active[(active.indexOf(turn) + 1) % active.length]);
    setDice(null); setBusy(false); setConsecutiveSixes(0); setRolling(false);
    movementLock.current = false;
  }, [players, turn]);

  const rollDice = useCallback(() => {
    if (busy || rolling || gameState !== 'PLAYING' || movementLock.current) return;
    setBusy(true); setRolling(true); playClick();
    if (rollIntervalRef.current) { clearInterval(rollIntervalRef.current); rollIntervalRef.current = null; }
    const intervalId = setInterval(() => setDice(Math.floor(Math.random() * 6) + 1), 80);
    rollIntervalRef.current = intervalId;
    setTimeout(() => {
      if (rollIntervalRef.current === intervalId) { clearInterval(intervalId); rollIntervalRef.current = null; }
      const finalVal = Math.floor(Math.random() * 6) + 1; setDice(finalVal); setRolling(false); playScore();
      setTimeout(() => {
        if (finalVal === 6) { if (consecutiveSixes >= 2) { setConsecutiveSixes(0); setTimeout(nextTurn, 1000); return; } setConsecutiveSixes(s => s + 1); } else { setConsecutiveSixes(0); }
        const mov = getMovablePawnIndices(turn, finalVal, pawns[turn]);
        if (mov.length === 1 || (finalVal === 6 && mov.length > 1 && mov.every(idx => pawns[turn][idx] === -1))) movePawnAction(mov[0], finalVal);
        else if (mov.length === 0) setTimeout(nextTurn, 1000);
      }, 1000);
    }, 800);
  }, [busy, rolling, gameState, turn, pawns, consecutiveSixes, nextTurn]);

  useEffect(() => { return () => clearInterval(rollIntervalRef.current); }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const getMovablePawnIndices = (color, val, pState) => {
    const indices = [];
    pState.forEach((p, idx) => { if (p !== 999 && (p === -1 ? val === 6 : p + val <= 57)) indices.push(idx); });
    return indices;
  };

  const findCaptured = (color, pos, currentPawns) => {
    if (pos === -1 || pos >= 51) return null;
    const [tx, ty] = pawnPaths.current[color][pos];
    if (SAFE_SQUARES.some(([sx, sy]) => sx === tx && sy === ty)) return null;
    let target = null;
    COLORS.forEach(c => { if (c !== color && players[c]) currentPawns[c].forEach((pPos, pIdx) => {
      if (pPos !== -1 && pPos < 51) { const [px, py] = pawnPaths.current[c][pPos]; if (px === tx && py === ty) target = { color: c, index: pIdx }; }
    }); });
    return target;
  };

  const movePawnAction = async (idx, forcedDice = null) => {
    if (movementLock.current) return;
    const val = forcedDice !== null ? forcedDice : dice;
    if (val === null || val > 6) return;
    movementLock.current = true;
    setBusy(true);

    let currentPos = pawns[turn][idx];
    if (currentPos === 999 || (currentPos === -1 && val !== 6) || (currentPos !== -1 && currentPos + val > 57)) {
      movementLock.current = false;
      return;
    }

    let bonus = val === 6;
    let finalPos = currentPos;

    if (currentPos === -1) { 
      setPawns(prev => { const n = {...prev, [turn]:[...prev[turn]]}; n[turn][idx]=0; return n; }); 
      playMove(); finalPos = 0; 
      await new Promise(r => setTimeout(r, 400));
    } else { 
      for (let i = 1; i <= val; i++) { 
        setPawns(prev => { const n = {...prev, [turn]:[...prev[turn]]}; n[turn][idx]=currentPos+i === 57 ? 999 : currentPos+i; return n; }); 
        playMove(); 
        await new Promise(r => setTimeout(r, 250)); 
      } 
      finalPos = currentPos + val; 
    }

    setPawns(prev => {
      const updated = { ...prev };
      if (finalPos === 57 || finalPos === 999) { 
        bonus = true; setScores(s => ({...s, [turn]:s[turn]+1})); setBoardCue({id:Date.now(), text:'HOME!', type: 'CELEBRATE', color: CONFIG[turn].bg}); playScore(); 
      } else { 
        const cap = findCaptured(turn, finalPos, prev); 
        if (cap) { bonus = true; updated[cap.color] = [...updated[cap.color]]; updated[cap.color][cap.index] = -1; setScores(s => ({...s, [turn]:s[turn]+1})); setBoardCue({id:Date.now(), text:'CAPTURE!', type: 'CAPTURE', color: CONFIG[turn].bg}); playWin(); } 
      }
      
      if (updated[turn].every(p => p === 999)) { 
        setGameState('WINNER'); setWinner(turn); playWin(); 
        recordResult('ludo', turn, 'win');
        if (user) {
          recordMatch('Ludo Arena', turn === 'RED' ? 'Win' : 'Loss', turn === 'RED' ? 250 : 50);
        }
        localStorage.removeItem('active_game_ludo');
      } else if (!bonus) {
        setTimeout(nextTurn, 300); 
      } else { 
        setDice(null); setBusy(false); movementLock.current = false;
      }
      return updated;
    });
  };

  const handleReset = () => { 
    setPawns({ RED: [-1,-1,-1,-1], GREEN: [-1,-1,-1,-1], YELLOW: [-1,-1,-1,-1], BLUE: [-1,-1,-1,-1] }); setDice(null); setTurn('RED'); setGameState('SETUP'); setShowResetDialog(false); setScores({RED:0,GREEN:0,YELLOW:0,BLUE:0}); setRolling(false); setBusy(false); movementLock.current = false; 
    localStorage.removeItem('active_game_ludo');
  };

  if (gameState === 'SETUP') return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f0f9ff] p-4 sm:p-8 overflow-y-auto">
      <button onClick={() => navigate('/')} className="absolute left-4 sm:left-8 top-4 sm:top-8 flex items-center gap-1 sm:gap-2 rounded-full border-2 sm:border-4 border-black bg-white px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base font-black shadow-[4px_4px_0_#000] sm:shadow-[6px_6px_0_#000] hover:-translate-y-1 z-10"><ChevronLeft size={20} /> Hub</button>
      <div className="w-full max-w-xl rounded-[2rem] sm:rounded-[3rem] border-4 sm:border-8 border-black bg-white p-6 sm:p-10 text-center shadow-[10px_10px_0_#000] sm:shadow-[20px_20px_0_#000] my-auto mt-20 sm:mt-auto">
        <h2 className="mb-8 sm:mb-12 text-4xl sm:text-5xl font-black uppercase italic tracking-tighter">Ludo Arena</h2>
        <div className="mb-8 sm:mb-12 grid grid-cols-2 gap-4 sm:gap-6">
          {COLORS.map(c => <button key={c} onClick={() => setPlayers(p => ({...p, [c]: !p[c]}))} className={`flex items-center justify-between rounded-2xl sm:rounded-[2rem] border-2 sm:border-4 border-black p-4 sm:p-6 font-black uppercase transition-all ${players[c] ? 'bg-white shadow-[4px_4px_0_#000] sm:shadow-[8px_8px_0_#000]' : 'bg-gray-100 opacity-40 scale-95'}`}><div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 sm:border-4 border-black shrink-0" style={{ backgroundColor: CONFIG[c].bg }} /> <span className="text-sm sm:text-base">{c}</span></button>)}
        </div>
        <button onClick={() => setGameState('PLAYING')} className="w-full border-2 sm:border-4 border-black bg-yellow-300 py-4 sm:py-6 text-2xl sm:text-3xl font-black uppercase shadow-[6px_6px_0_#000] sm:shadow-[12px_12px_0_#000] hover:bg-yellow-400">Join Battle</button>
      </div>
    </div>
  );

  const pawnStack = {};
  COLORS.forEach(c => {
    if (players[c]) {
      pawns[c].forEach((p, i) => {
        if (p !== 999) {
          const [x, y] = p === -1 ? [c === 'RED' || c === 'BLUE' ? 1.5 : 10.5, c === 'RED' || c === 'GREEN' ? 1.5 : 10.5].map((v, j) => v + [[0,0],[2,0],[0,2],[2,2]][i][j]) : pawnPaths.current[c][p];
          const key = `${x.toFixed(2)}-${y.toFixed(2)}`;
          if (!pawnStack[key]) pawnStack[key] = [];
          pawnStack[key].push({ color: c, index: i, x, y });
        }
      });
    }
  });

  return (
    <div className="fixed inset-0 z-[9999] flex h-full w-full flex-col bg-[#eefaff] overflow-hidden overscroll-none select-none">
      
      {/* --- ZERO-WASTE MOBILE HEADER --- */}
      <div className="z-50 flex w-full shrink-0 items-center justify-between gap-1 px-2 py-1.5 md:px-8 md:py-6 border-b-2 border-dashed border-black/5 bg-white/50 backdrop-blur-sm">
        <button onClick={() => setShowExitDialog(true)} className="flex items-center gap-1 rounded-full border-2 md:border-4 border-black bg-white px-2 py-1 md:px-5 md:py-2.5 font-black uppercase text-[9px] md:text-sm shadow-[2px_2px_0_#000] md:shadow-[6px_6px_0_#000] hover:-translate-y-0.5 transition-all">
          <ChevronLeft size={12} md:size={20} /> Hub
        </button>
        <h2 className="min-w-0 flex-1 truncate px-1 text-center text-sm md:text-5xl font-black uppercase tracking-tighter md:tracking-widest text-black italic drop-shadow-[1px_1px_0_#fff]">Ludo Arena</h2>
        <button onClick={() => setShowResetDialog(true)} className="flex items-center gap-1 rounded-full border-2 md:border-4 border-black bg-white px-2 py-1 md:px-5 md:py-2.5 font-black uppercase text-[9px] md:text-sm shadow-[2px_2px_0_#000] md:shadow-[6px_6px_0_#000] hover:bg-red-50 transition-colors">
          <RotateCcw size={12} md:size={18} /> Reset
        </button>
      </div>

      <div className="flex-1 w-full flex flex-col lg:flex-row items-center justify-center gap-1 md:gap-10 px-1 md:px-8 py-1 md:py-8 min-h-0 overflow-hidden">
        
        {/* Desktop Sidebar (Scores) */}
        <div className="hidden lg:flex flex-col gap-6 w-64 shrink-0">
           <div className={`rounded-[2.5rem] border-4 border-black bg-white p-6 shadow-[8px_8px_0_#000] flex flex-col items-center`}>
             <div className="h-16 w-16 rounded-full border-4 border-black mb-3 shadow-inner" style={{ backgroundColor: CONFIG[turn]?.bg || '#ffffff' }} />
             <div className="text-2xl font-black uppercase italic tracking-tighter text-center">{turn}'s Turn</div>
           </div>
           <div className="rounded-2xl border-4 border-black bg-white p-4 shadow-[6px_6px_0_#000]">
             <div className="text-[10px] font-black uppercase tracking-widest text-black/50 mb-3 text-center">Scoreboard</div>
             {COLORS.filter(c => players[c]).map(c => <div key={c} className={`flex items-center gap-3 py-1.5 px-3 rounded-xl border-2 mb-2 transition-colors ${turn === c ? 'bg-yellow-100 border-black' : 'bg-slate-50 border-transparent'}`}><div className="h-4 w-4 rounded-full border-2 border-black" style={{ backgroundColor: CONFIG[c].bg }} /><span className="flex-1 text-sm font-black uppercase">{c}: {scores[c]}</span></div>)}
           </div>
        </div>

        {/* THE BOARD - EDGE-TO-EDGE ON MOBILE */}
        <div className="relative shrink-0 w-full max-w-[min(98vw,calc(100vh-210px),700px)] lg:max-w-[700px] aspect-square rounded-xl border-4 md:border-[8px] border-black bg-white shadow-[6px_6px_0_#000] md:shadow-[20px_20px_0_#000] overflow-hidden touch-none">
          <BoardSVG />
          <AnimatePresence>
            {boardCue && (
              <motion.div key={boardCue.id} initial={{ scale: 0, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 1.5, opacity: 0, rotate: 20 }} className="absolute inset-0 z-[300] flex items-center justify-center pointer-events-none">
                {boardCue.type === 'CELEBRATE' && <Confetti color={boardCue.color} />}
                <div className="rounded-2xl border-[3px] md:border-[6px] border-black bg-white px-4 md:px-10 py-3 md:py-6 shadow-[5px_5px_0_#000] md:shadow-[12px_12px_0_#000] flex flex-col items-center">
                   <div className="text-2xl md:text-5xl font-black uppercase italic tracking-tighter text-black mb-1 md:mb-2">{boardCue.text}</div>
                   {boardCue.type === 'CELEBRATE' && <StarIcon size={20} md:size={40} className="text-yellow-400 fill-yellow-400 animate-spin" />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {COLORS.filter(c => players[c]).map(c => pawns[c].map((p, i) => {
            if (p === 999) return null;
            const isAtHome = p === -1;
            const [baseX, baseY] = isAtHome ? [c === 'RED' || c === 'BLUE' ? 1.5 : 10.5, c === 'RED' || c === 'GREEN' ? 1.5 : 10.5].map((v, j) => v + [[0,0],[2,0],[0,2],[2,2]][i][j]) : pawnPaths.current[c][p];
            const stack = pawnStack[`${baseX.toFixed(2)}-${baseY.toFixed(2)}`] || [];
            const stackIndex = stack.findIndex(s => s.color === c && s.index === i);
            const stackCount = stack.length;
            let offsetX = 0, offsetY = 0, scale = 1;
            if (stackCount > 1 && !isAtHome) {
              scale = 0.85; const angle = (stackIndex / stackCount) * Math.PI * 2;
              const radius = 0.8; offsetX = Math.cos(angle) * radius; offsetY = Math.sin(angle) * radius;
            }
            return (
              <motion.div key={`${c}-${i}`} className="absolute z-50 h-[6.666%] w-[6.666%] cursor-pointer" animate={{ left: `${(baseX + offsetX) * 6.666}%`, top: `${(baseY + offsetY) * 6.666}%`, zIndex: stackIndex + 50 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} onClick={() => !busy && !rolling && turn === c && movePawnAction(i)} whileHover={{ scale: 1.2, zIndex: 100 }}>
                <Pawn color={c} isTurn={turn === c} scale={scale} />
              </motion.div>
            );
          }))}
        </div>

        {/* --- DESKTOP DICE CONTROLS --- */}
        <div className="hidden lg:flex flex-col items-center gap-8 w-64 shrink-0">
          <div className="w-full">
            <DiceCapsule value={dice || 1} rolling={rolling} color={CONFIG[turn]?.bg || '#ffffff'} onRoll={rollDice} label={dice ? `ROLLED ${dice}` : "ROLL DICE"} />
          </div>
          <AnimatePresence>
            {dice && !rolling && (
              <motion.div initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} className="text-7xl font-black italic bg-white border-4 border-black px-12 py-6 rounded-3xl shadow-[10px_10px_0_#000] text-black">
                {dice}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- MOBILE CONTROL CENTER (Zero-Waste Slim) --- */}
        <div className="lg:hidden w-full max-w-[460px] shrink-0 rounded-t-[1.5rem] border-x-4 border-t-4 border-black bg-[#fff] px-3 pt-2 pb-3 shadow-[0_-4px_0_rgba(0,0,0,0.1)] mt-auto relative">
          {/* Player Score Strips (Ultra Slim Row) */}
          <div className="mb-2 flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar">
            {COLORS.filter(c => players[c]).map(c => (
              <div key={c} className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border-2 transition-all ${turn === c ? 'bg-yellow-100 border-black shadow-[2px_2px_0_#000]' : 'bg-slate-50 border-transparent opacity-60'}`}>
                <div className="h-2.5 w-2.5 rounded-full border border-black shrink-0" style={{ backgroundColor: CONFIG[c].bg }} />
                <span className="text-[9px] font-black uppercase">{scores[c]}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-black">
            <div className="min-w-0">
              <div className="text-[8px] font-black uppercase tracking-[0.1em] opacity-40 leading-none">Turn</div>
              <div className="truncate text-sm font-black uppercase italic text-black leading-tight">{turn}</div>
            </div>

            <button
              onClick={rollDice}
              disabled={busy || rolling || !!winner}
              style={{ backgroundColor: CONFIG[turn]?.bg }}
              className={`flex h-[48px] shrink-0 items-center gap-2 overflow-hidden rounded-xl border-[3px] border-black px-3 py-1 font-black uppercase text-black shadow-[2px_2px_0_#000] transition-all active:translate-y-0.5 disabled:opacity-100 relative`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-white rounded-lg border-2 border-black/10 scale-[0.6]">
                 <Dice value={dice || 1} rolling={rolling} size="sm" />
              </div>

              <AnimatePresence>
                {dice && !rolling && (
                  <motion.div 
                    initial={{ scale: 0, x: -10, opacity: 0 }} 
                    animate={{ scale: 1, x: 0, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center justify-center bg-black text-white w-6 h-6 rounded-md text-sm font-black italic shadow-[1px_1px_0_rgba(255,255,255,0.3)]"
                  >
                    {dice}
                  </motion.div>
                )}
              </AnimatePresence>

              <span className="text-[10px] ml-auto">{rolling ? 'Rolling' : 'Roll'}</span>
            </button>
          </div>
        </div>

      </div>

      <AnimatePresence>
        {winner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/95 z-[10000] flex flex-col items-center justify-center text-white p-6 text-center backdrop-blur-md">
            <div className="relative mb-8 md:mb-12">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -inset-20 opacity-30">
                <StarIcon size={120} className="text-white fill-white absolute top-0 left-1/2 -translate-x-1/2" />
                <StarIcon size={120} className="text-white fill-white absolute bottom-0 left-1/2 -translate-x-1/2" />
              </motion.div>
              <Trophy size={120} md:size={180} className="text-yellow-400 relative z-10 animate-bounce" />
            </div>
            <h3 className="text-6xl md:text-[8rem] font-black uppercase italic mb-6 tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600">{winner} WINS!</h3>
            <button onClick={() => window.location.reload()} className="bg-yellow-400 px-12 md:px-20 py-4 md:py-8 border-4 md:border-8 border-black text-2xl md:text-5xl font-black uppercase text-black shadow-[8px_8px_0_#ff3399] md:shadow-[12px_12px_0_#ff3399] hover:translate-y-1 active:translate-y-2 transition-all">Rematch</button>
          </motion.div>
        )}
      </AnimatePresence>

      <ResetDialog isOpen={showResetDialog} onConfirm={handleReset} onCancel={() => setShowResetDialog(false)} />
      <ExitGameDialog isOpen={showExitDialog} onSave={saveGame} onDelete={deleteGame} onCancel={() => setShowExitDialog(false)} />
    </div>
  );
}
