import {
  Chess,
  WHITE,
  PAWN,
  type Square,
  type PieceSymbol,
  type Piece,
  type Color,
  QUEEN,
} from 'chess.js';
import { getSquareRank } from './';

const chessRulesEngine = new Chess();

export function validateMove(fromSquare: Square, toSquare: Square): boolean {
  console.log('validate move', fromSquare, toSquare);
  const possibleMoves = chessRulesEngine.moves({
    square: fromSquare,
    verbose: true,
  });
  return possibleMoves.filter((m) => m.to === toSquare).length > 0;
}

export function makeMove(
  fromSquare: Square,
  toSquare: Square,
  promotion?: string
): void {
  chessRulesEngine.move({
    from: fromSquare,
    to: toSquare,
    promotion: promotion,
  });
}

export function promptUserIfPromotionMove(
  piece: Piece,
  toSquare: Square,
  turn: Color
): PieceSymbol | undefined {
  if (piece.type === PAWN) {
    const toSquareRank = getSquareRank(toSquare);
    if (turn === WHITE ? toSquareRank === 8 : toSquareRank === 1) {
      piece.type = QUEEN;
      return QUEEN;
    }
  }
  return undefined;
}
