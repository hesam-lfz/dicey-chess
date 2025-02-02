import {
  Chess,
  WHITE,
  PAWN,
  QUEEN,
  type Square,
  type PieceSymbol,
  type Color,
  type Move,
} from 'chess.js';

export type Board = {
  initPositionFEN?: string;
  history: string[];
  turn: Color;
};

export const allFiles: ('a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h')[] = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
];
export const allRanks: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8)[] = [
  1, 2, 3, 4, 5, 6, 7, 8,
];

export const getSquareRank: (square: Square) => number = (square: Square) =>
  +square[1];

export const board: Board = {
  initPositionFEN: undefined,
  history: [],
  turn: WHITE,
};

export const boardEngine: Chess = new Chess(board.initPositionFEN);

console.log(board);

export const getSquarePiece = (square: Square) => boardEngine.get(square);

export function validateMove(fromSquare: Square, toSquare: Square): boolean {
  const possibleMoves = boardEngine.moves({
    square: fromSquare,
    verbose: true,
  });
  return possibleMoves.filter((m) => m.to === toSquare).length > 0;
}

export function makeMove(
  fromSquare: Square,
  toSquare: Square,
  promotion?: string
): Move {
  const move: Move = boardEngine.move({
    from: fromSquare,
    to: toSquare,
    promotion: promotion,
  });
  return move;
}

export function promptUserIfPromotionMove(
  fromSquare: Square,
  toSquare: Square,
  turn: Color
): PieceSymbol | undefined {
  const piece = getSquarePiece(fromSquare)!;
  if (piece.type === PAWN) {
    const toSquareRank = getSquareRank(toSquare);
    if (turn === WHITE ? toSquareRank === 8 : toSquareRank === 1) {
      piece.type = QUEEN;
      return QUEEN;
    }
  }
  return undefined;
}
