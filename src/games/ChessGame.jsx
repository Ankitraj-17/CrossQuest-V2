import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, RotateCcw, Flag, Trophy,
  Swords, Zap, Clock, Play, History, MessageSquare
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { playClick } from '../utils/sounds';
import { recordResult } from '../utils/leaderboard';

/* ─── Constants ─────────────────────────────────────────── */
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS_WHITE = ['8', '7', '6', '5', '4', '3', '2', '1']; // top→bottom for white

const PIECE_SVG = {
  wK: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
  wQ: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  wR: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  wB: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  wN: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  wP: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  bK: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
  bQ: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  bR: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  bB: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  bN: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  bP: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
};

const MODES = [
  { id: 'rapid',   label: 'Rapid',   secs: 600,  Icon: Clock,  color: '#769656', sub: '10 min / player' },
  { id: 'blitz',   label: 'Blitz',   secs: 180,  Icon: Zap,    color: '#f59e0b', sub: '3 min / player'  },
  { id: 'bullet',  label: 'Bullet',  secs: 60,   Icon: Zap,    color: '#ef4444', sub: '1 min / player'  },
  { id: 'classic', label: 'Classic', secs: null, Icon: Swords, color: '#3b82f6', sub: 'No time limit'   },
];

const fmt = (s) => {
  if (s === null) return '∞';
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/* ═══════════════════════════════════════════════════════════
   Custom Chess Board Component
   ═══════════════════════════════════════════════════════════ */
function ChessBoard({ fen, onMove, gameOver }) {
  const [selected, setSelected]   = useState(null);
  const [targets, setTargets]     = useState([]);
  const [lastMove, setLastMove]   = useState(null);
  const [drag, setDrag]           = useState(null); // { fromSquare, piece, x, y }
  const [hovered, setHovered]     = useState(null);
  const boardRef                  = useRef(null);

  const ranks = ['8','7','6','5','4','3','2','1'];
  const files = ['a','b','c','d','e','f','g','h'];

  // Reset selection on FEN change (after a move)
  useEffect(() => { setSelected(null); setTargets([]); }, [fen]);

  const chess = fen === 'start' ? new Chess() : new Chess(fen);

  // ── Square from cursor position ───────────────────────
  function squareAt(clientX, clientY) {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const rx = (clientX - rect.left) / rect.width;
    const ry = (clientY - rect.top)  / rect.height;
    if (rx < 0 || rx > 1 || ry < 0 || ry > 1) return null;
    const fi = Math.min(7, Math.floor(rx * 8));
    const ri = Math.min(7, Math.floor(ry * 8));
    return `${files[fi]}${ranks[ri]}`;
  }

  // ── Execute a move (shared by click and drag) ─────────
  function tryMove(fromSq, toSq) {
    const g = fen === 'start' ? new Chess() : new Chess(fen);
    const mp = g.get(fromSq);
    if (!mp) return false;
    const isPromo = mp.type === 'p' &&
      ((g.turn() === 'w' && toSq[1] === '8') || (g.turn() === 'b' && toSq[1] === '1'));
    try {
      const obj = { from: fromSq, to: toSq };
      if (isPromo) obj.promotion = 'q';
      const result = g.move(obj);
      if (result) {
        setLastMove({ from: fromSq, to: toSq });
        setSelected(null); setTargets([]); setDrag(null); setHovered(null);
        onMove(g.fen(), result.san, g);
        return true;
      }
    } catch { /* illegal move – ignore */ }
    return false;
  }

  // ── Pointer Events (drag) ─────────────────────────────
  function onPointerDown(e, square) {
    if (gameOver) return;
    const piece = chess.get(square);
    if (!piece || piece.color !== chess.turn()) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const legalTargets = chess.moves({ square, verbose: true }).map(m => m.to);
    setSelected(square);
    setTargets(legalTargets);
    setDrag({ fromSquare: square, piece, x: e.clientX, y: e.clientY });
  }

  function onPointerMove(e) {
    if (!drag) return;
    e.preventDefault();
    setDrag(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
    setHovered(squareAt(e.clientX, e.clientY));
  }

  function onPointerUp(e) {
    if (!drag) return;
    const toSq = squareAt(e.clientX, e.clientY);
    if (toSq && toSq !== drag.fromSquare && targets.includes(toSq)) {
      tryMove(drag.fromSquare, toSq);
    } else {
      setDrag(null);
    }
  }

  // ── Click-to-move (fallback) ──────────────────────────
  function onClick(square) {
    if (gameOver || drag) return;
    const piece = chess.get(square);
    const turn  = chess.turn();

    if (selected) {
      if (targets.includes(square)) {
        tryMove(selected, square);
      } else if (piece && piece.color === turn) {
        setSelected(square);
        setTargets(chess.moves({ square, verbose: true }).map(m => m.to));
      } else {
        setSelected(null); setTargets([]);
      }
    } else if (piece && piece.color === turn) {
      setSelected(square);
      setTargets(chess.moves({ square, verbose: true }).map(m => m.to));
    }
  }

  // ── Ghost piece that follows cursor ───────────────────
  const ghost = drag && (
    <div style={{
      position: 'fixed',
      left: drag.x - 36,
      top:  drag.y - 36,
      width: 72,
      height: 72,
      pointerEvents: 'none',
      zIndex: 9999,
      transform: 'scale(1.15)',
      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
    }}>
      <img
        src={PIECE_SVG[`${drag.piece.color}${drag.piece.type.toUpperCase()}`]}
        style={{ width: '100%', height: '100%' }}
        draggable={false}
        alt=""
      />
    </div>
  );

  return (
    <>
      {ghost}
      <div
        ref={boardRef}
        style={{ width: '100%', userSelect: 'none', touchAction: 'none' }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {ranks.map((rank, ri) => (
          <div key={rank} style={{ display: 'flex', width: '100%' }}>
            {files.map((file, fi) => {
              const square  = `${file}${rank}`;
              const piece   = chess.get(square);
              const isLight = (fi + ri) % 2 === 0;
              const isSel   = selected === square;
              const isTgt   = targets.includes(square);
              const isLast  = lastMove && (lastMove.from === square || lastMove.to === square);
              const isDragging = drag?.fromSquare === square;
              const isHovered  = hovered === square && drag;

              let bg = isLight ? '#f0d9b5' : '#b58863';
              if (isLast)    bg = isLight ? '#cdd16f' : '#aaa23a';
              if (isSel)     bg = '#f6f624';
              if (isHovered && isTgt) bg = isLight ? '#96b8f0' : '#5f88d4';

              return (
                <div
                  key={square}
                  onClick={() => onClick(square)}
                  onPointerDown={(e) => onPointerDown(e, square)}
                  style={{
                    width: '12.5%',
                    paddingBottom: '12.5%',
                    position: 'relative',
                    backgroundColor: bg,
                    cursor: drag ? 'grabbing' : (piece && piece.color === chess.turn() && !gameOver ? 'grab' : 'pointer'),
                    boxSizing: 'border-box',
                    transition: 'background-color 0.1s',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Legal move indicators */}
                    {isTgt && !isHovered && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 2 }}>
                        {piece
                          ? <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 5px rgba(0,0,0,0.25)' }} />
                          : <div style={{ width: '32%', height: '32%', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.18)' }} />
                        }
                      </div>
                    )}
                    {/* Piece image — faded while being dragged */}
                    {piece && (
                      <img
                        src={PIECE_SVG[`${piece.color}${piece.type.toUpperCase()}`]}
                        alt={`${piece.color}${piece.type}`}
                        style={{
                          width: '88%', height: '88%',
                          pointerEvents: 'none', userSelect: 'none',
                          position: 'relative', zIndex: 3,
                          opacity: isDragging ? 0.25 : 1,
                          transition: 'opacity 0.1s',
                        }}
                        draggable={false}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════

   Main ChessGame Component
   ═══════════════════════════════════════════════════════════ */
export default function ChessGame() {
  const navigate = useNavigate();
  const { user, recordMatch } = useAuth();

  /* ── Lobby ─────────────────────────────────────────────── */
  const [screen, setScreen] = useState('lobby');
  const [mode,   setMode]   = useState(MODES[0]);
  const [nameW,  setNameW]  = useState(user?.name || 'Player 1');
  const [nameB,  setNameB]  = useState('Player 2');

  /* ── Game ──────────────────────────────────────────────── */
  const [fen,     setFen]     = useState('start');
  const [over,    setOver]    = useState(false);
  const [result,  setResult]  = useState('');
  const [history, setHistory] = useState([]);
  const [tW,      setTW]      = useState(null);
  const [tB,      setTB]      = useState(null);
  const tick = useRef(null);

  const [searchParams] = useSearchParams();
  const shouldResume = searchParams.get('resume') === 'true';

  /* ── Persistence ───────────────────────────────────────── */
  useEffect(() => {
    if (shouldResume) {
      const saved = localStorage.getItem('active_game_chess');
      if (saved) {
        try {
          const d = JSON.parse(saved);
          setScreen(d.screen || 'game');
          setMode(d.mode || MODES[0]);
          setNameW(d.nameW || 'Player 1');
          setNameB(d.nameB || 'Player 2');
          setFen(d.fen || 'start');
          setOver(d.over || false);
          setResult(d.result || '');
          setHistory(d.history || []);
          setTW(d.tW !== undefined ? d.tW : null);
          setTB(d.tB !== undefined ? d.tB : null);
        } catch (e) {
          console.error('Failed to load saved chess game', e);
        }
      } else {
        setScreen('lobby');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldResume]);

  const saveStateAndExit = () => {
    playClick();
    if (fen !== 'start' && !over) {
      const state = {
        screen: 'game', mode, nameW, nameB,
        fen, over, result, history, tW, tB,
        timestamp: Date.now()
      };
      localStorage.setItem('active_game_chess', JSON.stringify(state));
    } else if (over) {
      localStorage.removeItem('active_game_chess');
    }
    navigate('/');
  };

  const deleteStateAndExit = () => {
    playClick();
    if (user && fen !== 'start' && !over) {
      recordMatch('Chess Arena', 'Left the game', 0);
    }
    localStorage.removeItem('active_game_chess');
    navigate('/');
  };

  // Derive turn from FEN
  const turn = fen === 'start' ? 'w' : (fen.split(' ')[1] ?? 'w');

  /* ── Timer ─────────────────────────────────────────────── */
  useEffect(() => {
    clearInterval(tick.current);
    if (screen !== 'game' || over || mode.secs === null) return;

    tick.current = setInterval(() => {
      if (turn === 'w') {
        setTW(prev => {
          if (prev <= 1) { endGame(`Time out — ${nameB} wins!`, 'loss', nameB); return 0; }
          return prev - 1;
        });
      } else {
        setTB(prev => {
          if (prev <= 1) { endGame(`Time out — ${nameW} wins!`, 'win', nameW); return 0; }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(tick.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, over, turn, mode.id]);

  /* ── Helpers ───────────────────────────────────────────── */
  function endGame(msg, outcome, winnerName = null) {
    clearInterval(tick.current);
    setOver(true);
    setResult(msg);
    if (winnerName) {
      recordResult('chess', winnerName, 'win');
    }
    recordMatch('Chess', outcome, outcome === 'win' ? 500 : outcome === 'draw' ? 100 : 300);
  }

  function startGame() {
    playClick();
    clearInterval(tick.current);
    setFen('start');
    setOver(false);
    setResult('');
    setHistory([]);
    setTW(mode.secs);
    setTB(mode.secs);
    setScreen('game');
  }

  function leaveLobby() {
    playClick();
    navigate('/');
  }

  function handleMove(newFen, san, chessInstance) {
    setFen(newFen);
    setHistory(prev => [...prev, san]);

    // Check end conditions
    if (chessInstance.isCheckmate()) {
      const winner = chessInstance.turn() === 'w' ? nameB : nameW;
      setTimeout(() => endGame(`Checkmate — ${winner} wins!`, chessInstance.turn() === 'w' ? 'loss' : 'win', winner), 50);
    } else if (chessInstance.isDraw() || chessInstance.isStalemate() || chessInstance.isThreefoldRepetition()) {
      setTimeout(() => endGame("It's a draw!", 'draw'), 50);
    }
  }

  /* ══════════════════════════════════════════════════════════
     LOBBY SCREEN
  ══════════════════════════════════════════════════════════ */
  if (screen === 'lobby') {
    return (
      <div className="fixed inset-0 bg-[#09090b] flex items-center justify-center p-6 text-white font-sans overflow-y-auto">
        <button
          onClick={leaveLobby}
          className="absolute top-6 left-6 flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 border border-white/10 transition-all"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">Chess Arena</h1>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Configure your match</p>
          </div>

          <div className="space-y-5">
            {/* Player names */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { lbl: 'Player 1 (White)', val: nameW, set: setNameW },
                { lbl: 'Player 2 (Black)', val: nameB, set: setNameB },
              ].map(({ lbl, val, set }) => (
                <div key={lbl} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase opacity-40">{lbl}</label>
                  <input
                    className="bg-[#18181b] border-2 border-white/5 focus:border-[#769656] px-4 py-3 rounded-xl font-bold outline-none transition-all text-white"
                    value={val}
                    onChange={e => set(e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* Mode selector */}
            <div>
              <label className="text-[10px] font-black uppercase opacity-40 block mb-2">Game Mode</label>
              <div className="grid grid-cols-2 gap-3">
                {MODES.map(m => {
                  const active = mode.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m)}
                      className={`flex flex-col p-4 rounded-2xl border-2 text-left transition-all
                        ${active ? 'border-[#769656] bg-[#769656]/10' : 'border-white/5 bg-[#18181b] hover:border-white/20'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <m.Icon size={20} style={{ color: active ? '#769656' : m.color }} />
                        {active && <span className="w-2 h-2 bg-[#769656] rounded-full block" />}
                      </div>
                      <span className="font-black text-base uppercase">{m.label}</span>
                      <span className="text-[10px] font-bold opacity-40 uppercase mt-0.5">{m.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-5 bg-[#769656] hover:bg-[#86a666] font-black uppercase rounded-2xl text-xl italic flex items-center justify-center gap-3 shadow-[0_6px_0_#4a5f36] active:translate-y-1 active:shadow-none transition-all"
            >
              <Play size={22} fill="currentColor" /> Play Game
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
     GAME SCREEN
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="fixed inset-0 bg-[#09090b] flex flex-col md:flex-row overflow-hidden font-sans text-white">

      {/* ══ BOARD COLUMN ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-3 py-2 md:p-6 relative min-h-0">

        {/* Top bar */}
        <div className="w-full max-w-[560px] flex items-center justify-between mb-2">
          <div className="flex gap-2">
            <button
              onClick={saveStateAndExit}
              className="flex items-center gap-1.5 rounded-lg bg-[#8B5E3C]/20 hover:bg-[#8B5E3C]/40 border border-[#8B5E3C]/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#f0d9b5] transition-all"
            >
              <ChevronLeft size={13} /> Save & Exit
            </button>
            <button
              onClick={deleteStateAndExit}
              className="flex items-center gap-1.5 rounded-lg bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-400 transition-all"
            >
              Quit
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-amber-900/30 border border-amber-700/30 text-amber-400 text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
            {/* Mobile resign */}
            <button
              onClick={() => endGame(`${turn === 'w' ? nameB : nameW} wins by resignation`, turn === 'w' ? 'loss' : 'win', turn === 'w' ? nameB : nameW)}
              disabled={over}
              className="md:hidden flex items-center gap-1.5 rounded-lg bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-400 transition-all disabled:opacity-30"
            >
              <Flag size={12} /> Resign
            </button>
          </div>
        </div>

        <div className="w-full max-w-[560px] flex flex-col gap-2">

          {/* ── BLACK player bar ── */}
          <div className="flex items-center justify-between bg-[#18181b] border border-white/5 rounded-xl px-3 py-2 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nameB}`} className="w-9 h-9 rounded-lg bg-zinc-900 border-2 border-zinc-700" alt="B" />
                {turn === 'b' && !over && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 border-2 border-[#242018] rounded-full animate-pulse" />}
              </div>
              <div>
                <p className="font-bold text-sm leading-none text-white">{nameB}</p>
                <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest mt-0.5">Black</p>
              </div>
            </div>
            <div className={`font-mono text-xl font-black tabular-nums px-3 py-1 rounded-lg border transition-all ${
              turn === 'b' && !over
                ? 'bg-amber-950/60 border-amber-600/60 text-amber-300'
                : 'bg-black/20 border-white/5 text-white/20'
            }`}>
              {fmt(tB)}
            </div>
          </div>

          {/* ── Board wrapper with wooden border ── */}
          <div className="relative rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.7)] border-4 border-[#8B5E3C]" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.7), inset 0 0 0 2px rgba(255,255,255,0.05)' }}>
            <ChessBoard fen={fen} onMove={handleMove} gameOver={over} />

            {/* ── WIN POPUP ── */}
            <AnimatePresence>
              {over && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.75) 100%)', backdropFilter: 'blur(8px)' }}
                >
                  <motion.div
                    initial={{ scale: 0.7, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
                    className="text-center px-6 py-8 max-w-[280px] w-full"
                    style={{ background: 'linear-gradient(135deg, #2a1f0e 0%, #1a1208 100%)', border: '1px solid rgba(180,120,60,0.4)', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,200,100,0.1)' }}
                  >
                    {/* Trophy glow */}
                    <div className="relative inline-block mb-4">
                      <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl scale-150" />
                      <Trophy size={52} className="relative text-yellow-400" strokeWidth={1.5} />
                    </div>

                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-1"
                      style={{ background: 'linear-gradient(135deg, #f0d080, #c8820a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                      {result.includes('draw') || result.includes('Draw') ? "It's a Draw!" : 'Victory!'}
                    </h3>
                    <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-6 leading-relaxed">{result}</p>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={startGame}
                        className="py-3 rounded-xl font-black text-sm uppercase tracking-wide transition-all active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #c8820a, #8B5E3C)', boxShadow: '0 4px 0 rgba(0,0,0,0.4)' }}
                      >
                        Rematch
                      </button>
                      <button
                        onClick={deleteStateAndExit}
                        className="py-3 rounded-xl font-black text-sm uppercase tracking-wide bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95"
                      >
                        Exit
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── WHITE player bar ── */}
          <div className="flex items-center justify-between bg-[#18181b] border border-white/5 rounded-xl px-3 py-2 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nameW}`} className="w-9 h-9 rounded-lg bg-white border-2 border-zinc-300" alt="W" />
                {turn === 'w' && !over && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 border-2 border-[#242018] rounded-full animate-pulse" />}
              </div>
              <div>
                <p className="font-bold text-sm leading-none text-white">{nameW}</p>
                <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest mt-0.5">White</p>
              </div>
            </div>
            <div className={`font-mono text-xl font-black tabular-nums px-3 py-1 rounded-lg border transition-all ${
              turn === 'w' && !over
                ? 'bg-amber-950/60 border-amber-600/60 text-amber-300'
                : 'bg-black/20 border-white/5 text-white/20'
            }`}>
              {fmt(tW)}
            </div>
          </div>

          {/* Mobile move history (scrollable, hidden on md+) */}
          {history.length > 0 && (
            <div className="md:hidden flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {Array.from({ length: Math.ceil(history.length / 2) }).map((_, i) => (
                <div key={i} className="flex items-center gap-1 shrink-0 text-xs font-mono">
                  <span className="text-white/20 font-bold">{i + 1}.</span>
                  <span className="bg-white/5 px-2 py-0.5 rounded text-white/70">{history[i * 2]}</span>
                  {history[i * 2 + 1] && <span className="bg-black/30 px-2 py-0.5 rounded text-white/40">{history[i * 2 + 1]}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ SIDEBAR (desktop only) ════════════════════════════ */}
      <div className="hidden md:flex flex-col w-72 lg:w-80 bg-[#18181b] border-l border-white/10">

        {/* Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-black uppercase italic tracking-tighter text-white">Chess Arena</h2>
          </div>
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{mode.label} · {mode.sub}</p>
        </div>

        {/* Move history */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-3 flex items-center gap-1.5"><History size={10} /> Move History</p>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 opacity-10">
              <Swords size={30} className="mb-2" />
              <p className="text-[10px] uppercase font-black tracking-widest text-center">Make the first move</p>
            </div>
          ) : (
            <div className="grid grid-cols-[22px_1fr_1fr] gap-x-1.5 gap-y-1 text-xs font-mono">
              {Array.from({ length: Math.ceil(history.length / 2) }).map((_, i) => (
                <div key={i} className="contents">
                  <span className="flex items-center justify-center text-[9px] font-black text-white/20">{i + 1}</span>
                  <span className="px-2 py-1 rounded-md bg-white/5 text-white/80 truncate">{history[i * 2]}</span>
                  <span className="px-2 py-1 rounded-md bg-black/30 text-white/40 truncate">{history[i * 2 + 1] ?? ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={startGame}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-black uppercase tracking-wide transition-all"
          >
            <RotateCcw size={12} /> New Game
          </button>
          <button
            onClick={() => endGame(`${turn === 'w' ? nameB : nameW} wins by resignation`, turn === 'w' ? 'loss' : 'win', turn === 'w' ? nameB : nameW)}
            disabled={over}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-800/20 text-red-400 text-[11px] font-black uppercase tracking-wide transition-all disabled:opacity-20 disabled:pointer-events-none"
          >
            <Flag size={12} /> Resign
          </button>
        </div>
      </div>
    </div>
  );
}
