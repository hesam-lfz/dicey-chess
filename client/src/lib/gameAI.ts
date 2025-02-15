import { type Move } from 'chess.js';
import { boardEngine, settings } from './gameRules';

export async function getAIMove(): Promise<Move> {
  return settings.AIPlayerIsSmart ? getAIRandomMove() : getAISmartMove();
}

async function getAIRandomMove(): Promise<Move> {
  const seconds = (settings.AIMoveDelay * 5 * Math.random()) / 1000;
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

// FIXME
async function getAISmartMove(): Promise<Move> {
  return getAIRandomMove();
}
