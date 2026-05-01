import { motion } from 'framer-motion';
import { ChevronLeft, Grid3x3, Swords, Share2, Crown, Star, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const GAMES = [
  {
    icon: Swords, color: '#ff3333', title: 'Ludo Arena', card: 'ng-card-red',
    steps: [
      'Roll the 3D dice to move your pawns out of the base (needs a 6)',
      'Race all 4 pawns around the board to the center finish line',
      'Capture opponents by landing on their squares to send them back home',
      'Use safe zones (star squares) to protect your pawns from capture'
    ],
    tip: 'Blocking paths with two pawns on the same square is a great defensive move!',
  },
  {
    icon: Share2, color: '#00ff88', title: 'Snake & Ladder', card: 'ng-card-green',
    steps: [
      'Be the first player to reach square 100 exactly',
      'Climb ladders to skip ahead and gain a massive advantage',
      'Avoid snakes that will slide you back down to lower levels',
      'Roll a 6 to get an extra turn and speed up your journey'
    ],
    tip: 'Positioning is key — sometimes a short ladder is better than a long one near a snake!',
  },
  {
    icon: Crown, color: '#3388ff', title: 'Chess Strategy', card: 'ng-card-blue',
    steps: [
      'Protect your King at all costs while attacking the opponent',
      'Master the unique movements of Pawns, Knights, Bishops, and Rooks',
      'Deliver a Checkmate to end the game and claim victory',
      'Use special moves like Castling and En Passant to gain tactical edge'
    ],
    tip: 'Control the center of the board early to restrict your opponent\'s options!',
  },
  {
    icon: Grid3x3, color: '#ff3399', title: 'Tic-Tac-Toe', card: 'ng-card-pink',
    steps: [
      'Connect three of your symbols (X or O) in a row, column, or diagonal',
      'Block your opponent\'s moves to force a draw or a win',
      'Player X always takes the first shot in this classic duel',
      'Every match is saved to the global Leaderboard automatically'
    ],
    tip: 'Starting in the center is statistically the strongest opening move!',
  },
];

export default function HowToPlay() {
  return (
    <main className="min-h-screen bg-[#fdfdfd] p-4 md:p-10 pb-32">
      <Link to="/" className="inline-flex items-center gap-2 font-black uppercase text-xs mb-8 hover:translate-x-1 transition-transform">
        <ChevronLeft size={16} /> Back to Arena
      </Link>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4 drop-shadow-[4px_4px_0_rgba(0,0,0,0.1)]">Master the Arena</h1>
        <p className="font-black uppercase tracking-widest text-black/30 text-sm">Official Battle Manual & Strategy Guide</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {GAMES.map((game, i) => {
          const Icon = game.icon;
          return (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: i * 0.1 }}
              className="bg-white border-4 border-black rounded-[2rem] p-6 md:p-8 shadow-[8px_8px_0_#000] relative overflow-hidden group hover:-translate-y-1 transition-all"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={120} />
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div 
                  style={{ backgroundColor: game.color }}
                  className="w-14 h-14 rounded-2xl border-4 border-black flex items-center justify-center shadow-[4px_4px_0_#000]"
                >
                  <Icon size={28} color="#fff" strokeWidth={3} />
                </div>
                <div>
                   <h2 className="text-2xl md:text-3xl font-black uppercase italic leading-none">{game.title}</h2>
                   <div className="h-1.5 w-16 mt-1 rounded-full bg-black/5" />
                </div>
              </div>

              <div className="space-y-4 mb-10">
                {game.steps.map((step, si) => (
                  <div key={si} className="flex items-start gap-4">
                    <div className="shrink-0 w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black italic">
                      {si + 1}
                    </div>
                    <p className="text-sm font-bold text-black/70 leading-relaxed uppercase tracking-tight">{step}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 border-2 border-black/10 rounded-2xl p-4 flex items-start gap-3">
                <div className="bg-yellow-400 p-1.5 rounded-lg border-2 border-black shrink-0">
                   <Star size={14} fill="#000" />
                </div>
                <p className="text-[11px] font-black uppercase leading-normal tracking-wide">
                  <span className="text-black/30 block mb-0.5">Pro Tip:</span>
                  {game.tip}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-20 text-center">
         <div className="inline-flex flex-col items-center gap-4 p-8 bg-black text-white rounded-[3rem] shadow-[10px_10px_0_#fff200] border-4 border-black">
            <Shield size={40} className="text-yellow-400 animate-pulse" />
            <div className="space-y-1">
               <h3 className="text-2xl font-black uppercase italic tracking-tighter">Ready for Battle?</h3>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 text-yellow-400">Join the Cross Quest Arena Now</p>
            </div>
            <Link to="/" className="mt-2 px-10 py-3 bg-white text-black rounded-xl font-black uppercase text-sm border-2 border-white hover:bg-yellow-400 hover:border-black transition-all">
               Start Game
            </Link>
         </div>
      </div>
    </main>
  );
}
