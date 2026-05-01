import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Hash, Dices, Crown, LayoutGrid, Play, Lock } from 'lucide-react';

const GAMES = [
  { id: 'chess',       title: 'Chess',          desc: 'The ultimate game of strategy. Pass and play.',  icon: Crown,      path: '/chess',        color: 'cyan',   locked: false },
  { id: 'snakeladder', title: 'Snake & Ladder',  desc: 'Roll the dice and race to 100.',                icon: Dices,      path: '/snake-ladder', color: 'green',  locked: false },
  { id: 'ludo',        title: 'Ludo',            desc: 'Classic 4-player board game.',                  icon: LayoutGrid, path: '/ludo',         color: 'purple', locked: false },
  { id: 'tictactoe',   title: 'Tic Tac Toe',     desc: 'The classic 3x3 grid game.',                    icon: Hash,       path: '/tictactoe',    color: 'pink',   locked: false },
  { id: 'connect4',    title: 'Connect 4',        desc: 'Premium drop-token strategy game.',             icon: LayoutGrid, path: '#',             color: 'blue',   locked: true  },
  { id: 'checkers',    title: 'Checkers',          desc: 'Premium classic diagonal battle.',              icon: LayoutGrid, path: '#',             color: 'yellow', locked: true  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } }
};

export default function Home() {
  return (
    <main className="page inner-lg">
      <div className="text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-5xl md:text-8xl font-black mb-4 uppercase text-black"
          style={{ letterSpacing: '2px', textShadow: '2px 2px 0 #00f3ff, 4px 4px 0 #ff3399' }}
        >
          CrossQuest
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="inline-block border-4 border-black bg-yellow-300 px-4 md:px-6 py-2 rounded-xl shadow-[4px_4px_0_#000]"
        >
          <p className="text-sm md:text-xl font-bold uppercase tracking-widest">
            Play Classic Games
          </p>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          padding: '20px 0'
        }}
      >
        {GAMES.map((g) => {
          const Icon = g.icon;
          return (
            <motion.div key={g.id} variants={itemVariants}>
              <Link to={g.path} className="block group" style={{ pointerEvents: g.locked ? 'none' : 'auto' }}>
                <div
                  className={`ng-card-${g.color}`}
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '30px 24px',
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: g.locked ? 0.6 : 1
                  }}
                >
                  <Icon
                    size={120}
                    style={{
                      position: 'absolute',
                      top: '-20px',
                      right: '-20px',
                      opacity: 0.05,
                      transform: 'rotate(-15deg)',
                      pointerEvents: 'none'
                    }}
                  />

                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 20,
                      background: `var(--color-${g.color}-soft, rgba(255,255,255,0.05))`,
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <Icon size={24} className={`t-${g.color}`} />
                  </div>

                  <h3 className={`text-2xl font-bold mb-3 t-${g.color}`}>
                    {g.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-8 flex-1 leading-relaxed">
                    {g.desc}
                  </p>

                  {g.locked ? (
                    <div className="mt-8 bg-black text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 border-2 border-black">
                      <Lock size={16} /> Coming Soon
                    </div>
                  ) : (
                    <div className="mt-8 bg-white border-2 border-black py-3 px-4 rounded-lg flex items-center justify-between font-bold text-sm uppercase tracking-widest shadow-[4px_4px_0_#000] group-hover:bg-[#ffea00] transition-colors">
                      Play Now
                      <Play size={16} />
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </main>
  );
}
