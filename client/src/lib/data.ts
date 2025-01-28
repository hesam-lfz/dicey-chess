export enum PieceType {
  King,
  Queen,
  Bishop,
  Knight,
  Rook,
  Pawn,
}

export enum Color {
  White,
  Black,
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
  pieces: Piece[];
};

const allColors: Color[] = [Color.White, Color.Black];
const allPieceTypes: PieceType[] = [
  PieceType.King,
  PieceType.Queen,
  PieceType.Bishop,
  PieceType.Knight,
  PieceType.Rook,
  PieceType.Pawn,
];
const allSquares: { [key: string]: Square } = {};
const allPieces: Piece[] = [];
const allFiles: ('a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h')[] = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
];
const allRanks: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8)[] = [1, 2, 3, 4, 5, 6, 7, 8];

for (const f of allFiles)
  for (const r of allRanks) allSquares[f + r] = { file: f, rank: r };

console.log(allSquares);

for (const c of allColors) {
  const r = 1;
  console.log(c, r);
  allPieces.push({
    color: Color.White,
    type: PieceType.Rook,
    square: allSquares['a1'],
  });
  allPieces.push({
    color: Color.White,
    type: PieceType.Knight,
    square: allSquares['b1'],
  });
  allPieces.push({
    color: Color.White,
    type: PieceType.Bishop,
    square: allSquares['c1'],
  });
  allPieces.push({
    color: Color.White,
    type: PieceType.Queen,
    square: allSquares['d1'],
  });
  allPieces.push({
    color: Color.White,
    type: PieceType.King,
    square: allSquares['e1'],
  });
  allPieces.push({
    color: Color.White,
    type: PieceType.Bishop,
    square: allSquares['f1'],
  });
  allPieces.push({
    color: Color.White,
    type: PieceType.Knight,
    square: allSquares['g1'],
  });
  allPieces.push({
    color: Color.White,
    type: PieceType.Rook,
    square: allSquares['h1'],
  });
  for (const f of allFiles)
    allPieces.push({
      color: Color.White,
      type: PieceType.Pawn,
      square: allSquares[f + 2],
    });
}

export const board: Board = { squares: allSquares, pieces: allPieces };

console.log(allPieceTypes);
console.log(allPieces);
console.log(board);
