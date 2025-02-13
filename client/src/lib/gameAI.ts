import { type Move } from 'chess.js';
import { boardEngine } from './gameRules';

export async function getAIMove(): Promise<Move> {
  const seconds = 1 + Math.floor(Math.random() * 3);
  return new Promise((resolve) => {
    setTimeout(() => {
      const possibleMoves = boardEngine.moves({
        verbose: true,
      });
      const move =
        possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      resolve(move);
    }, seconds * 1000);
  });
}
