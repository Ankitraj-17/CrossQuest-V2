export default function GameHeader({ 
  playerA, setPlayerA, scoreA, 
  playerB, setPlayerB, scoreB,
  onReset 
}) {
  return (
    <div className="bg-[#ffe4b5] border-4 border-black rounded-xl p-4 shadow-[6px_6px_0_#000] mb-8" style={{ width: '100%', maxWidth: '800px', margin: '0 auto 32px' }}>
      <h3 className="text-center font-orbitron font-black uppercase text-sm mb-4 tracking-widest border-b-2 border-black pb-2">Match Score</h3>
      
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {/* Player A */}
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input 
            type="text" 
            value={playerA} 
            onChange={e => setPlayerA(e.target.value)} 
            className="w-full bg-white border-2 border-black rounded-md px-3 py-2 font-bold text-center outline-none focus:bg-[#00f3ff] transition-colors"
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '2px solid #000', borderRadius: '8px', padding: '12px' }}>
            <span className="font-orbitron font-black text-3xl">{scoreA}</span>
          </div>
        </div>

        {/* Player B */}
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input 
            type="text" 
            value={playerB} 
            onChange={e => setPlayerB(e.target.value)} 
            className="w-full bg-white border-2 border-black rounded-md px-3 py-2 font-bold text-center outline-none focus:bg-[#ff3399] transition-colors"
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '2px solid #000', borderRadius: '8px', padding: '12px' }}>
            <span className="font-orbitron font-black text-3xl">{scoreB}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
