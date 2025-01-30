export enum PieceType {
  King = 'K',
  Queen = 'Q',
  Bishop = 'B',
  Knight = 'N',
  Rook = 'R',
  Pawn = 'P',
}

export enum Color {
  White = 'White',
  Black = 'Black',
}

export type Square = {
  file: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
  rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

export type Piece = {
  color: Color;
  type: PieceType;
  square: Square | null;
};

export type Board = {
  squares: { [key: string]: Square };
  pieces: { [key: string]: Piece };
};

const allColors: Color[] = [Color.White, Color.Black];
export const allSquares: { [key: string]: Square } = {};
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

for (const f of allFiles)
  for (const r of allRanks) allSquares[f + r] = { file: f, rank: r };

const initPositionPieceTypes: PieceType[] = [
  PieceType.Rook,
  PieceType.Knight,
  PieceType.Bishop,
  PieceType.Queen,
  PieceType.King,
  PieceType.Bishop,
  PieceType.Knight,
  PieceType.Rook,
];

for (const c of allColors) {
  const r = c == Color.White ? 1 : 8;
  for (const idx in allFiles) {
    const sq = allFiles[idx] + r;
    allPieces[sq] = {
      color: c,
      type: initPositionPieceTypes[idx],
      square: allSquares[sq],
    };
  }
  for (const f of allFiles) {
    const sq = f + (c == Color.White ? 2 : 7);
    allPieces[sq] = {
      color: c,
      type: PieceType.Pawn,
      square: allSquares[sq],
    };
  }
}

export const board: Board = { squares: allSquares, pieces: allPieces };

console.log(board);
