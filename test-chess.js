import { Chess } from 'chess.js';

try {
  const game = new Chess();
  console.log("Initial FEN:", game.fen());
  
  const moveRequest = { from: 'e2', to: 'e4' };
  const moveResult = game.move(moveRequest);
  
  console.log("Move result:", moveResult);
  console.log("New FEN:", game.fen());
} catch (e) {
  console.error("Error:", e);
}
