import { type Square, type Piece } from './';

export function validateMove(piece: Piece, toSquare: Square): boolean {
  console.log('validate move', piece, toSquare);
  if (piece.square === toSquare) return false;
  return true;
}
