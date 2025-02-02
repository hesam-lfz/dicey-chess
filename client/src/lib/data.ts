import {
  WHITE,
  BLACK,
  PAWN,
  KNIGHT,
  BISHOP,
  ROOK,
  QUEEN,
  KING,
  type Color,
  type PieceSymbol,
  type Square,
  type Piece,
} from 'chess.js';

export type Board = {
  pieces: { [key: string]: Piece };
  turn: Color;
};

const allColors: Color[] = [WHITE, BLACK];
export const allPieces: { [key: string]: Piece } = {};
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

const initPositionPieceTypes: PieceSymbol[] = [
  ROOK,
  KNIGHT,
  BISHOP,
  QUEEN,
  KING,
  BISHOP,
  KNIGHT,
  ROOK,
];

for (const c of allColors) {
  const r = c == WHITE ? 1 : 8;
  for (const idx in allFiles) {
    const sq = allFiles[idx] + r;
    allPieces[sq] = {
      color: c,
      type: initPositionPieceTypes[idx],
    };
  }
  for (const f of allFiles) {
    const sq = f + (c == WHITE ? 2 : 7);
    allPieces[sq] = {
      color: c,
      type: PAWN,
    };
  }
}

export const getSquareRank: (square: Square) => number = (square: Square) =>
  +square[1];

export const board: Board = {
  pieces: allPieces,
  turn: WHITE,
};

console.log(board);
