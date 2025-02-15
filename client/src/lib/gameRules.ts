import {
  Chess,
  WHITE,
  PAWN,
  QUEEN,
  KING,
  type Square,
  type PieceSymbol,
  type Color,
  type Move,
} from 'chess.js';

export type Settings = {
  onePlayerMode: boolean;
  AIPlayerIsSmart: boolean;
  humanPlaysColor: Color;
  AIMoveDelay: number;
};

export type Board = {
  initPositionFEN?: string;
  history: string[][];
  turn: Color;
  diceRoll: number;
  numMovesInTurn: number;
  firstMoveInTurn: boolean;
  gameOver: boolean;
  outcome?: string;
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

const initBoard: Board = {
  initPositionFEN: undefined,
  history: [[]],
  turn: WHITE,
  diceRoll: -1,
  numMovesInTurn: -1,
  firstMoveInTurn: true,
  gameOver: false,
};

const initSettings: Settings = {
  onePlayerMode: true,
  AIPlayerIsSmart: false,
  humanPlaysColor: WHITE,
  AIMoveDelay: 250,
};

export let settings: Settings;
export let board: Board;
export let boardEngine: Chess;

export const resetSettings = () => {
  settings = { ...initSettings };
};

export const resetBoard = () => {
  board = { ...initBoard };
  board.history = [[]];
  boardEngine = new Chess(board.initPositionFEN);
};

resetSettings();
resetBoard();

export const getSquarePiece = (square: Square) => boardEngine.get(square);

export function validateMove(fromSquare: Square, toSquare: Square): boolean {
  // boardEngine accepts a move in which a king is taken! Take care of it manually here:
  const toPiece = getSquarePiece(toSquare);
  if (toPiece && toPiece.type === KING) return false;
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
    // The player has played current turn's all the number of moves according to the dice roll:
    board.diceRoll = -1;
    board.numMovesInTurn = -1;
    board.firstMoveInTurn = true;
    board.history.push([]);
  } else {
    // The player still has moves left in the current turn, according to the dice roll:
    board.firstMoveInTurn = false;
    // swap turn back to the player who just moved since there's still more to make:
    swapTurn();
  }
  // After each move we need to check for game over because if player has moves left
  // in the turn but has no valid moves then it's a draw:
  checkForGameOver();
  return board.history;
}
// returns true if we're in 1-player mode and it's not human player's turn:
export const isAITurn: () => boolean = () =>
  settings.onePlayerMode && board.turn !== settings.humanPlaysColor;

export const checkForGameOver: () => void = () => {
  if (boardEngine.isCheckmate()) {
    board.gameOver = true;
    board.outcome = (board.turn === WHITE ? 'Black' : 'White') + ' wins!';
  } else if (boardEngine.isDraw() || isDiceyChessDraw()) {
    board.gameOver = true;
    board.outcome = 'Draw!';
  }
};

const isDiceyChessDraw: () => boolean = () => boardEngine.moves().length === 0;

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
