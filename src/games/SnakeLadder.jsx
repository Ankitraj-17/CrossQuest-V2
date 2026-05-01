import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Trophy, RotateCcw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { playClick, playScore, playWin, playMove, playSnake, playLadder } from '../utils/sounds';
import { recordResult } from '../utils/leaderboard';
import { Dice } from '../components/Dice';
import ExitGameDialog from '../components/ExitGameDialog';
import ResetDialog from '../components/ResetDialog';
import { useAuth } from '../context/AuthContext';

// --- PIXEL-PERFECT DATA (FINAL COMPREHENSIVE AUDIT OF IMAGE 53) ---
const SNAKES = { 
  16: { tail: 5,  curve: 2,  flip: 1 },
  32: { tail: 12, curve: 3,  flip: -1 },
  43: { tail: 18, curve: 10, flip: 1 },
  48: { tail: 9,  curve: 4,  flip: 1 },
  62: { tail: 19, curve: 8,  flip: 1 },
  64: { tail: 60, curve: 2,  flip: 1 },
  65: { tail: 56, curve: 2,  flip: -1 },
  84: { tail: 77, curve: 3,  flip: 1 },
  87: { tail: 24, curve: 15, flip: -1 },
  93: { tail: 73, curve: 4,  flip: 1 },
  95: { tail: 75, curve: 4,  flip: -1 },
  98: { tail: 78, curve: 5,  flip: 1 }
};

const LADDERS = { 
  4:  { end: 17 }, 
  8:  { end: 33 }, 
  13: { end: 28 },
  15: { end: 26 }, 
  22: { end: 39 }, 
  36: { end: 45 },
  38: { end: 83 }, 
  46: { end: 66 }, 
  53: { end: 68 }, 
  72: { end: 92 }, 
  82: { end: 99 } 
};

const CELL_COLORS = ['#fff7c2', '#d8f8d8', '#ffe0ba', '#c9f2df'];

function getBoardJump(cell) {
  if (SNAKES[cell]) return { type: 'snake', to: SNAKES[cell].tail };
  if (LADDERS[cell]) return { type: 'ladder', to: LADDERS[cell].end };
  return null;
}

function getCellType(cell) {
  if (SNAKES[cell]) return 'snake-head';
  if (LADDERS[cell]) return 'ladder-base';
  if (Object.values(SNAKES).some(snake => snake.tail === cell)) return 'snake-tail';
  if (Object.values(LADDERS).some(ladder => ladder.end === cell)) return 'ladder-top';
  return null;
}

function getBoardCells() {
  const cells = [];
  for (let row = 9; row >= 0; row--) {
    const isEvenRow = row % 2 === 0;
    const start = row * 10;
    if (isEvenRow) {
      for (let col = 1; col <= 10; col++) cells.push(start + col);
    } else {
      for (let col = 10; col >= 1; col--) cells.push(start + col);
    }
  }
  return cells;
}
const CELLS = getBoardCells();

function getCellCenter(cell) {
  const zeroIndexed = cell - 1;
  const rowFromBottom = Math.floor(zeroIndexed / 10);
  const row = 9 - rowFromBottom;
  const isEvenRow = rowFromBottom % 2 === 0;
  const col = isEvenRow ? (zeroIndexed % 10) : 9 - (zeroIndexed % 10);
  return { x: col * 10 + 5, y: row * 10 + 5 };
}

function ScoreControls({ score, onIncrement, onDecrement, compact = false }) {
  if (compact) {
    return (
      <div className="mt-2 flex items-center gap-1.5">
        <button onClick={onDecrement} className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-black bg-white text-xs font-black shadow-[2px_2px_0_#000] active:translate-y-0.5">-1</button>
        <div className="min-w-8 rounded-lg border-2 border-black bg-yellow-200 px-2 py-0.5 text-center text-sm font-black shadow-[2px_2px_0_#000]">{score}</div>
        <button onClick={onIncrement} className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-black bg-white text-xs font-black shadow-[2px_2px_0_#000] active:translate-y-0.5">+1</button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border-4 border-black bg-[#fffaf0] p-3 shadow-[4px_4px_0_#000]">
      <div className="mb-2 text-center text-[11px] font-black uppercase tracking-[0.2em] text-black/55">Points</div>
      <div className="flex items-center justify-center gap-2">
        <button onClick={onDecrement} className="h-10 w-12 rounded-xl border-4 border-black bg-white text-sm font-black shadow-[3px_3px_0_#000] transition-transform active:translate-y-0.5">-1</button>
        <div className="min-w-16 rounded-xl border-4 border-black bg-yellow-200 px-4 py-1 text-center text-3xl font-black shadow-[3px_3px_0_#000]">{score}</div>
        <button onClick={onIncrement} className="h-10 w-12 rounded-xl border-4 border-black bg-white text-sm font-black shadow-[3px_3px_0_#000] transition-transform active:translate-y-0.5">+1</button>
      </div>
    </div>
  );
}

function ScoreResetBar({ scoreA, scoreB, onResetScores }) {
  return (
    <div className="hidden lg:flex items-center justify-center gap-3 rounded-2xl border-4 border-black bg-[#fffaf0] px-4 py-2 shadow-[5px_5px_0_#000]">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-black/55">A</div>
      <div className="min-w-10 rounded-lg border-2 border-black bg-green-200 px-2 py-1 text-center text-lg font-black">{scoreA}</div>
      <button onClick={onResetScores} className="rounded-xl border-4 border-black bg-white px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#000] transition-transform active:translate-y-0.5">Reset Points</button>
      <div className="min-w-10 rounded-lg border-2 border-black bg-yellow-200 px-2 py-1 text-center text-lg font-black">{scoreB}</div>
      <div className="text-xs font-black uppercase tracking-[0.18em] text-black/55">B</div>
    </div>
  );
}

function PlayerPanel({ label, colorClass, isActive, diceValue, rolling, busy, winner, onRoll, fallbackDice, score, onIncrement, onDecrement, compact = false }) {
  const canRoll = isActive && !winner;

  if (compact) {
    return (
      <div className={`min-w-0 flex-1 rounded-2xl border-4 border-black px-3 py-2 transition-all ${isActive && !winner ? 'bg-[#e8f8d8] shadow-[4px_4px_0_#6abf69]' : 'bg-[#fffaf0] shadow-[3px_3px_0_#000]'}`}>
        <div className="flex items-center gap-3">
        <div className={`h-10 w-10 shrink-0 rounded-full border-4 border-black ${colorClass}`} />
        <div className="min-w-0">
          <div className="truncate text-sm font-black uppercase italic leading-tight text-black">{label}</div>
          <div className={`text-[10px] font-black uppercase tracking-widest ${isActive && !winner ? 'text-green-800' : 'text-black/50'}`}>{isActive && !winner ? 'Turn' : 'Waiting'}</div>
        </div>
        </div>
        <ScoreControls score={score} onIncrement={onIncrement} onDecrement={onDecrement} compact />
      </div>
    );
  }

  return (
    <div className="hidden lg:flex w-52 xl:w-60 flex-col items-center justify-center shrink-0 z-30">
      <div className={`w-full flex min-h-[440px] flex-col items-center justify-between rounded-[2rem] border-4 border-black p-5 xl:p-6 transition-all ${isActive && !winner ? 'bg-[#e8f8d8] text-black shadow-[10px_10px_0_#6abf69]' : 'bg-[#fffaf0] text-black shadow-[6px_6px_0_#000]'}`}>
        <div className={`mb-4 h-20 w-20 xl:h-24 xl:w-24 rounded-full border-4 border-black shadow-inner ${colorClass}`} />
        <div className="w-full text-center">
          <div className="max-w-full truncate text-xl xl:text-2xl font-black uppercase italic text-black">{label}</div>
          <div className={`mt-2 text-xs font-black uppercase tracking-[0.2em] ${isActive && !winner ? 'text-green-800' : 'text-black/50'}`}>
            {isActive && !winner ? 'Your turn' : 'Waiting'}
          </div>
        </div>
        <ScoreControls score={score} onIncrement={onIncrement} onDecrement={onDecrement} />
        <div className={`mt-5 flex h-28 w-28 items-center justify-center overflow-visible rounded-2xl border-4 border-black shadow-inner ${canRoll ? 'bg-white' : 'bg-black/10'}`}>
          {canRoll ? (
            <button onClick={onRoll} disabled={rolling || busy} className="transition-transform hover:rotate-6 active:scale-95 disabled:cursor-not-allowed">
              <Dice value={diceValue || fallbackDice} rolling={rolling} />
            </button>
          ) : (
            <span className="text-xs font-black uppercase tracking-[0.2em] text-black/40">Waiting</span>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileControls({ playerA, playerB, scoreA, scoreB, onScoreA, onScoreB, onResetScores, turn, dice, rolling, busy, winner, onRoll }) {
  const currentPlayer = turn === 'A' ? playerA : playerB;
  const diceTrayColor = turn === 'A' ? 'bg-green-300' : 'bg-yellow-300';

  return (
    <div className="lg:hidden w-full max-w-[560px] shrink-0 rounded-[1.4rem] border-4 border-black bg-[#fffaf0] p-2.5 shadow-[5px_5px_0_#6abf69]">
      <div className="mb-2.5 flex gap-2">
        <PlayerPanel label={playerA} colorClass="bg-green-400" isActive={turn === 'A'} winner={winner} score={scoreA} onIncrement={() => onScoreA(1)} onDecrement={() => onScoreA(-1)} compact />
        <PlayerPanel label={playerB} colorClass="bg-yellow-400" isActive={turn === 'B'} winner={winner} score={scoreB} onIncrement={() => onScoreB(1)} onDecrement={() => onScoreB(-1)} compact />
      </div>
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#e8f8d8] px-3 py-2.5 text-black">
        <div className="min-w-0">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-green-800">Current turn</div>
          <div className="truncate text-lg font-black uppercase italic text-black">{currentPlayer}</div>
          <button onClick={onResetScores} className="mt-1 rounded-lg border-2 border-black bg-white px-2 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0_#000] transition-transform active:translate-y-0.5">Reset Points</button>
        </div>
        <button
          onClick={onRoll}
          disabled={busy || rolling || winner}
          className={`flex min-h-[64px] shrink-0 items-center gap-3 overflow-hidden rounded-xl border-4 border-black ${diceTrayColor} px-4 py-2 font-black uppercase text-black shadow-[4px_4px_0_#000] transition-all hover:-translate-y-0.5 active:translate-y-0.5 disabled:cursor-not-allowed`}
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center">
            <Dice value={dice || (turn === 'A' ? 4 : 2)} rolling={rolling} size="sm" />
          </span>
          <span>{rolling ? 'Rolling' : 'Roll'}</span>
        </button>
      </div>
    </div>
  );
}



export default function SnakeLadder() {
  const { user, recordMatch } = useAuth();
  const playerA = user?.name || "Player A";
  const [playerB] = useState("Player B");
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [posA, setPosA] = useState(1);
  const [posB, setPosB] = useState(1);
  const [turn, setTurn] = useState('A');
  const [dice, setDice] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [winner, setWinner] = useState(null);
  const [scoreCue, setScoreCue] = useState(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldResume = searchParams.get('resume') === 'true';

  useEffect(() => {
    if (shouldResume) {
      const saved = localStorage.getItem('active_game_snakeladder');
      if (saved) {
        const data = JSON.parse(saved);
        setPosA(data.posA || 1);
        setPosB(data.posB || 1);
        setTurn(data.turn || 'A');
        setScoreA(data.scoreA || 0);
        setScoreB(data.scoreB || 0);
      }
    }
  }, [shouldResume]);

  const saveGame = () => {
    const data = { posA, posB, turn, scoreA, scoreB, playerA, playerB };
    localStorage.setItem('active_game_snakeladder', JSON.stringify(data));
    navigate('/');
  };

  const deleteGame = () => {
    if (user) {
      recordMatch('Snake & Ladder', 'Forfeit', 10);
    }
    localStorage.removeItem('active_game_snakeladder');
    navigate('/');
  };

  const posARef = useRef(posA);
  const posBRef = useRef(posB);
  const turnRef = useRef(turn);

  useEffect(() => { posARef.current = posA; }, [posA]);
  useEffect(() => { posBRef.current = posB; }, [posB]);
  useEffect(() => { turnRef.current = turn; }, [turn]);

  const rollDice = () => {
    if (busy || rolling || winner) return;
    playClick(); setBusy(true); setRolling(true);
    let rollInterval = setInterval(() => setDice(Math.floor(Math.random() * 6) + 1), 80);

    setTimeout(async () => {
      clearInterval(rollInterval);
      const val = Math.floor(Math.random() * 6) + 1;
      setDice(val); playScore(); setRolling(false);
      
      await new Promise(r => setTimeout(r, 800));
      const currentTurn = turnRef.current;
      let currentPos = currentTurn === 'A' ? posARef.current : posBRef.current;

      if (currentPos + val > 100) {
        setTurn(currentTurn === 'A' ? 'B' : 'A');
        setBusy(false);
        return;
      }

      for (let i = 1; i <= val; i++) {
        currentPos++;
        playMove();
        if (currentTurn === 'A') setPosA(currentPos);
        else setPosB(currentPos);
        await new Promise(r => setTimeout(r, 250));
      }

      await new Promise(r => setTimeout(r, 400));

      let finalPos = currentPos;
      const boardJump = getBoardJump(finalPos);
      if (boardJump) {
        const delta = boardJump.type === 'ladder' ? 1 : -1;
        if (boardJump.type === 'snake') playSnake();
        else playLadder();

        if (currentTurn === 'A') setScoreA(s => Math.max(0, s + delta));
        else setScoreB(s => Math.max(0, s + delta));
        setScoreCue({ id: Date.now(), turn: currentTurn, delta, type: boardJump.type });
        setTimeout(() => setScoreCue(null), 1300);

        await new Promise(r => setTimeout(r, 600));
        finalPos = boardJump.to;
        if (currentTurn === 'A') setPosA(finalPos);
        else setPosB(finalPos);
        await new Promise(r => setTimeout(r, 600));
      }

      if (finalPos >= 100) {
        setWinner(currentTurn); playWin();
        recordResult('snakeladder', currentTurn === 'A' ? playerA : playerB, 'win');
        if (user) {
          recordMatch('Snake & Ladder', currentTurn === 'A' ? 'Win' : 'Loss', currentTurn === 'A' ? 150 : 20);
        }
      } else {
        setTurn(currentTurn === 'A' ? 'B' : 'A');
      }
      setBusy(false);
    }, 1000);
  };

  const handleReset = () => {
    setPosA(1); setPosB(1); setTurn('A'); setDice(null); setWinner(null); setShowResetDialog(false);
  };

  const resetScores = () => {
    setScoreA(0);
    setScoreB(0);
    setScoreCue(null);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex h-full w-full flex-col overflow-hidden bg-[#f7f3d2] bg-[radial-gradient(circle_at_12%_18%,rgba(167,243,208,0.50),transparent_32%),radial-gradient(circle_at_88%_78%,rgba(253,186,116,0.34),transparent_30%)]">
      <div className="z-50 flex w-full shrink-0 items-center justify-between gap-2 px-3 py-3 md:px-8 md:py-6">
        <button onClick={() => setShowExitDialog(true)} className="flex items-center gap-1 rounded-full border-4 border-black bg-white px-3 py-1.5 md:px-5 md:py-2.5 text-[10px] md:text-sm font-black uppercase shadow-[4px_4px_0_#6abf69] transition-transform hover:-translate-y-1 sm:shadow-[6px_6px_0_#6abf69]">
          <ChevronLeft size={16} md:size={18} /> Hub
        </button>
        <h2 className="min-w-0 flex-1 truncate px-1 text-center text-lg md:text-5xl font-black uppercase tracking-tight md:tracking-widest text-[#23613f] drop-shadow-[2px_2px_0_#fffaf0] md:drop-shadow-[3px_3px_0_#fffaf0]">Snake & Ladder</h2>
        <button onClick={() => setShowResetDialog(true)} className="flex items-center gap-1 rounded-full border-4 border-black bg-white px-3 py-1.5 md:px-5 md:py-2.5 text-[10px] md:text-sm font-black uppercase shadow-[4px_4px_0_#6abf69] transition-colors hover:bg-red-50 sm:shadow-[6px_6px_0_#6abf69]">
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-3 pb-4 lg:grid lg:grid-cols-[minmax(180px,240px)_minmax(420px,1fr)_minmax(180px,240px)] lg:gap-6 lg:px-6 lg:pb-8 xl:gap-10 xl:px-10">
        <PlayerPanel
          label={playerA}
          colorClass="bg-green-400"
          isActive={turn === 'A'}
          diceValue={dice}
          rolling={rolling}
          busy={busy}
          winner={winner}
          onRoll={rollDice}
          fallbackDice={4}
          score={scoreA}
          onIncrement={() => setScoreA(s => s+1)}
          onDecrement={() => setScoreA(s => Math.max(0, s-1))}
        />

        {/* BOARD */}
        <div className="z-10 flex min-w-0 shrink flex-col items-center gap-4 lg:mx-auto">
          <ScoreResetBar scoreA={scoreA} scoreB={scoreB} onResetScores={resetScores} />
          <div className="flex aspect-square w-[min(94vw,calc(100vh-300px),540px)] items-center justify-center sm:w-[min(86vw,calc(100vh-260px),680px)] lg:w-[min(54vw,calc(100vh-220px),720px)] xl:w-[min(52vw,calc(100vh-220px),780px)]">
          <div className="relative h-full w-full overflow-hidden rounded-xl border-[6px] border-black bg-[#9edb9c] p-1 shadow-[8px_8px_0_#000] sm:border-8 sm:shadow-[14px_14px_0_#000] lg:rounded-2xl lg:border-[10px] lg:p-2 lg:shadow-[18px_18px_0_#000]">
            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,250,240,0.65),transparent_24%),radial-gradient(circle_at_82%_84%,rgba(253,186,116,0.24),transparent_28%)]" />
            <AnimatePresence>
              {winner && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-xl bg-black/90 p-4 text-center backdrop-blur-md">
                  <Trophy size={96} className="mb-4 animate-bounce text-yellow-400 sm:h-[120px] sm:w-[120px]" />
                  <h3 className="mb-2 text-4xl font-black uppercase italic tracking-tighter text-white sm:text-7xl">Victory!</h3>
                  <div className="mb-6 text-xl font-black uppercase text-yellow-400 sm:mb-8 sm:text-3xl">{winner === 'A' ? playerA : playerB} Wins!</div>
                  <button onClick={handleReset} className="border-4 border-black bg-yellow-400 px-8 py-4 text-xl font-black shadow-[8px_8px_0_#000] transition-all hover:translate-y-1 sm:px-12 sm:py-5 sm:text-3xl">REMATCH</button>
                </motion.div>
              )}
              {scoreCue && (
                <motion.div
                  key={scoreCue.id}
                  initial={{ opacity: 0, y: 16, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -18, scale: 0.9 }}
                  className={`absolute left-1/2 top-4 z-[60] -translate-x-1/2 rounded-2xl border-4 border-black px-5 py-3 text-2xl font-black uppercase shadow-[5px_5px_0_#000] ${scoreCue.delta > 0 ? 'bg-green-300 text-green-950' : 'bg-red-300 text-red-950'}`}
                >
                  {scoreCue.delta > 0 ? '+1 Ladder!' : '-1 Snake!'}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative z-10 h-full w-full overflow-hidden rounded-lg border-2 border-black bg-[#fffaf0]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.45),transparent_45%,rgba(34,84,61,0.10))]" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '1px', width: '100%', height: '100%', background: 'rgba(34,84,61,0.35)', position: 'relative' }}>
                {CELLS.map(c => {
                  const rowFromBottom = Math.floor((c-1)/10);
                  const colIndex = (c - 1) % 10;
                  const paletteIndex = (c + rowFromBottom + colIndex) % CELL_COLORS.length;
                  const cellType = getCellType(c);
                  let bg = CELL_COLORS[paletteIndex];
                  if (c === 1) bg = '#bbf7d0';
                  if (c === 100) bg = '#fde68a';
                  if (cellType === 'snake-head') bg = '#fecdd3';
                  if (cellType === 'ladder-base') bg = '#bfdbfe';
                  return (
                    <div
                      key={c}
                      style={{
                        background: bg,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyItems: 'center',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.05)'
                      }}
                    >
                      {(c === 1 || c === 100) && (
                        <div className="absolute inset-1 rounded-sm border-2 border-black/20 bg-white/25" />
                      )}
                      <span className={`absolute left-1 top-1 font-black leading-none ${c === 1 || c === 100 ? 'text-black/60' : 'text-black/30'} text-[9px] sm:text-[11px] md:text-base`}>{c}</span>
                      {c === 1 && <span className="absolute bottom-1 right-1 hidden text-[9px] font-black uppercase tracking-widest text-green-900/60 sm:block">Start</span>}
                      {c === 100 && <span className="absolute bottom-1 right-1 hidden text-[9px] font-black uppercase tracking-widest text-amber-900/60 sm:block">Finish</span>}
                      <div className="absolute inset-0 flex items-center justify-center z-40 p-1 pointer-events-none">
                        {posA === c && <motion.div layoutId="tokenA" transition={{ type: 'spring', stiffness: 320, damping: 24 }} className="w-[68%] h-[68%] drop-shadow-[2px_3px_0_rgba(0,0,0,0.45)]"><svg viewBox="0 0 10 12"><path d="M 1,11 L 9,11 L 8,5 Q 5,2 2,5 Z" fill="#22c55e" stroke="#000" strokeWidth="0.8" /><circle cx="5" cy="3.5" r="3" fill="#22c55e" stroke="#000" strokeWidth="0.8" /></svg></motion.div>}
                        {posB === c && <motion.div layoutId="tokenB" transition={{ type: 'spring', stiffness: 320, damping: 24 }} className="w-[68%] h-[68%] drop-shadow-[2px_3px_0_rgba(0,0,0,0.45)]"><svg viewBox="0 0 10 12"><path d="M 1,11 L 9,11 L 8,5 Q 5,2 2,5 Z" fill="#facc15" stroke="#000" strokeWidth="0.8" /><circle cx="5" cy="3.5" r="3" fill="#facc15" stroke="#000" strokeWidth="0.8" /></svg></motion.div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* OVERLAY SVG */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-20 pointer-events-none">
                <g filter="drop-shadow(2px 3px 2px rgba(0,0,0,0.3))">
                  {Object.entries(LADDERS).map(([startStr, data]) => {
                    const p1 = getCellCenter(parseInt(startStr));
                    const p2 = getCellCenter(data.end);
                    const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                    const ox = -Math.sin(ang) * 1.5; const oy = Math.cos(ang) * 1.5;
                    const steps = Math.floor(Math.hypot(p2.x-p1.x, p2.y-p1.y) / 4);
                    return (
                      <g key={startStr}>
                        <line x1={p1.x-ox} y1={p1.y-oy} x2={p2.x-ox} y2={p2.y-oy} stroke="#0891b2" strokeWidth="2.4" strokeLinecap="round" />
                        <line x1={p1.x+ox} y1={p1.y+oy} x2={p2.x+ox} y2={p2.y+oy} stroke="#0891b2" strokeWidth="2.4" strokeLinecap="round" />
                        <line x1={p1.x-ox} y1={p1.y-oy} x2={p2.x-ox} y2={p2.y-oy} stroke="#67e8f9" strokeWidth="1.2" strokeLinecap="round" />
                        <line x1={p1.x+ox} y1={p1.y+oy} x2={p2.x+ox} y2={p2.y+oy} stroke="#67e8f9" strokeWidth="1.2" strokeLinecap="round" />
                        {Array.from({length: steps-1}).map((_, i) => {
                          const tx = p1.x + ((p2.x - p1.x) * (i+1)) / steps;
                          const ty = p1.y + ((p2.y - p1.y) * (i+1)) / steps;
                          return <line key={i} x1={tx-ox} y1={ty-oy} x2={tx+ox} y2={ty+oy} stroke="#0891b2" strokeWidth="2.4" strokeLinecap="round" />;
                        })}
                        {Array.from({length: steps-1}).map((_, i) => {
                          const tx = p1.x + ((p2.x - p1.x) * (i+1)) / steps;
                          const ty = p1.y + ((p2.y - p1.y) * (i+1)) / steps;
                          return <line key={i} x1={tx-ox} y1={ty-oy} x2={tx+ox} y2={ty+oy} stroke="#67e8f9" strokeWidth="1.2" strokeLinecap="round" />;
                        })}
                      </g>
                    );
                  })}
                </g>
                <g filter="drop-shadow(2px 3px 2px rgba(0,0,0,0.3))">
                  {Object.entries(SNAKES).map(([headStr, snakeData]) => {
                    const head = parseInt(headStr);
                    const p1 = getCellCenter(head); 
                    const p2 = getCellCenter(snakeData.tail); 
                    const dx = p2.x - p1.x; const dy = p2.y - p1.y;
                    const length = Math.hypot(dx, dy); const ang = Math.atan2(dy, dx);
                    const steps = 30; const freq = length > 40 ? 3 : 2; const amp = 3.5;
                    let pathD = `M ${p1.x} ${p1.y}`;
                    for (let i = 1; i <= steps; i++) {
                      const t = i / steps;
                      const x = p1.x + dx * t; const y = p1.y + dy * t;
                      const offset = Math.sin(t * Math.PI * freq) * amp * (1 - t * 0.5);
                      pathD += ` L ${x + -Math.sin(ang)*offset} ${y + Math.cos(ang)*offset}`;
                    }
                    return (
                      <g key={headStr}>
                        <path d={pathD} fill="none" stroke="#166534" strokeWidth="2.2" strokeLinecap="round" />
                        <path d={pathD} fill="none" stroke="#4ade80" strokeWidth="1.4" strokeLinecap="round" />
                        <path d={pathD} fill="none" stroke="#166534" strokeWidth="0.6" strokeDasharray="0 2.2" strokeLinecap="round" />
                        <g transform={`translate(${p1.x}, ${p1.y}) rotate(${(ang * 180) / Math.PI - 90}) scale(0.6)`}>
                          <path d="M 0,-5 L 0,-6 M 0,-6 L -0.5,-6.5 M 0,-6 L 0.5,-6.5" stroke="#ef4444" strokeWidth="0.4" fill="none" strokeLinecap="round" />
                          <path d="M 0,-5 C 2,-5 3.5,-2 2.5,0.5 C 1.5,2 -1.5,2 -2.5,0.5 C -3.5,-2 -2,-5 0,-5 Z" fill="#4ade80" stroke="#166534" strokeWidth="0.8" />
                          <circle cx="-1.2" cy="-2.5" r="0.6" fill="#000" /> <circle cx="1.2" cy="-2.5" r="0.6" fill="#000" />
                        </g>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>
          </div>
        </div>

        <PlayerPanel
          label={playerB}
          colorClass="bg-yellow-400"
          isActive={turn === 'B'}
          diceValue={dice}
          rolling={rolling}
          busy={busy}
          winner={winner}
          onRoll={rollDice}
          fallbackDice={2}
          score={scoreB}
          onIncrement={() => setScoreB(s => s+1)}
          onDecrement={() => setScoreB(s => Math.max(0, s-1))}
        />

        <MobileControls
          playerA={playerA}
          playerB={playerB}
          scoreA={scoreA}
          scoreB={scoreB}
          onScoreA={s => setScoreA(o => o+s)}
          onScoreB={s => setScoreB(o => o+s)}
          onResetScores={resetScores}
          turn={turn}
          dice={dice}
          rolling={rolling}
          busy={busy}
          winner={winner}
          onRoll={rollDice}
        />
      </div>

      <ResetDialog isOpen={showResetDialog} onConfirm={handleReset} onCancel={() => setShowResetDialog(false)} />
      <ExitGameDialog isOpen={showExitDialog} onSave={saveGame} onDelete={deleteGame} onCancel={() => setShowExitDialog(false)} />
    </div>
  );
}
