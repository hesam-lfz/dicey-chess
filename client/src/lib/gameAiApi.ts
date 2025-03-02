import { type Move } from 'chess.js';
import { boardEngine, settings } from './boardEngineApi';

export let chessAIEngine: WebSocket; // <-- chess AI player engine

export async function getAIMove(): Promise<Move> {
  return settings.AIPlayerIsSmart ? getAISmartMove() : getAIRandomMove();
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
  //return getAIRandomMove();
  chessAIEngine.send(
    JSON.stringify({
      fen: boardEngine.fen(),
      maxThinkingTime: 100,
      depth: 18,
    })
  );
  return getAIRandomMove();
}

export function initChessAIEngine(): void {
  chessAIEngine = new WebSocket(import.meta.env.VITE_APP_CHESS_ENGINE_API_URL);
  chessAIEngine.onmessage = (event) => {
    const chessApiMessage = JSON.parse(event.data);
    console.log('chess ai response', chessApiMessage);
  };
}

export function closeChessAIEngine(): void {
  (chessAIEngine as WebSocket).close();
}
