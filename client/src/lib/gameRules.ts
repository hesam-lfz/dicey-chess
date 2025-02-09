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
  history: string[][];
  turn: Color;
  diceRoll: number;
  numMovesInTurn: number;
  firstMoveInTurn: boolean;
  gameOver: boolean;
};

import Icon_wk from '../assets/king_w.svg';
import Icon_bk from '../assets/king_b.svg';
import Icon_wq from '../assets/queen_w.svg';
import Icon_bq from '../assets/queen_b.svg';
import Icon_wb from '../assets/bishop_w.svg';
import Icon_bb from '../assets/bishop_b.svg';
import Icon_wn from '../assets/knight_w.svg';
import Icon_bn from '../assets/knight_b.svg';
import Icon_wr from '../assets/rook_w.svg';
import Icon_br from '../assets/rook_b.svg';
import Icon_wp from '../assets/pawn_w.svg';
import Icon_bp from '../assets/pawn_b.svg';

export const pieceSVGs: { [key: string]: any } = {
  Icon_wk,
  Icon_bk,
  Icon_wq,
  Icon_bq,
  Icon_wb,
  Icon_bb,
  Icon_wn,
  Icon_bn,
  Icon_wr,
  Icon_br,
  Icon_wp,
  Icon_bp,
};

export const playerIconSVGs = {
  w: pieceSVGs['Icon_wp'],
  b: pieceSVGs['Icon_bp'],
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
  history: [[]],
  turn: WHITE,
  diceRoll: -1,
  numMovesInTurn: -1,
  firstMoveInTurn: true,
  gameOver: false,
};

export let boardEngine: Chess = new Chess(board.initPositionFEN);

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
): string[][] {
  const move: Move = boardEngine.move({
    from: fromSquare,
    to: toSquare,
    promotion: promotion,
  });
  board.turn = boardEngine.turn();
  board.history[board.history.length - 1].push(move.san);
  board.numMovesInTurn -= 1;
  if (board.numMovesInTurn === 0) {
    board.diceRoll = -1;
    board.numMovesInTurn = -1;
    board.firstMoveInTurn = true;
    board.history.push([]);
  } else {
    board.firstMoveInTurn = false;
    swapTurn();
  }
  return board.history;
}

export const checkForMate: () => boolean = () => boardEngine.isCheckmate();

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

export function swapTurn(): void {
  let fen = boardEngine.fen();
  const fenA = fen.split(' ');
  fenA[1] = fenA[1] === 'w' ? 'b' : 'w';
  fen = fenA.join(' ');
  boardEngine = new Chess(fen);
  board.turn = boardEngine.turn();
}
