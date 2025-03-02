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
import Icon_Dice1 from '../assets/dice-1.svg';
import Icon_Dice2 from '../assets/dice-2.svg';
import Icon_Dice3 from '../assets/dice-3.svg';
import Icon_Dice4 from '../assets/dice-4.svg';
import Icon_Dice5 from '../assets/dice-5.svg';
import Icon_Dice6 from '../assets/dice-6.svg';

import {
  Chess,
  WHITE,
  BLACK,
  PAWN,
  QUEEN,
  KING,
  type Square,
  type PieceSymbol,
  type Color,
  type Move,
} from 'chess.js';

import {
  localStorage_loadSettings,
  localStorage_saveSettings,
} from './storageApi';
import {
  chessAIEngine,
  closeChessAIEngine,
  initChessAIEngine,
} from './gameAiApi';

// General settings:
export type Settings = {
  onePlayerMode: boolean;
  AIPlayerIsSmart: boolean;
  humanPlaysColor: Color | null;
  humanPlaysColorRandomly: boolean;
  makeMoveDelay: number;
  AIMoveDelay: number;
  AIEngineUsesSocket: boolean;
};

// Settings specific for a given game:
export type CurrentGameSettings = {
  humanPlaysColor: Color;
};

export type SavedGame = {
  uniqid: number;
  duration: number;
  outcome: number;
  moveHistory: string;
  diceRollHistory: string;
};

export type Board = {
  initPositionFen?: string;
  history: string[][];
  flatSanMoveHistory: string[];
  flatSquareMoveHistory: Move[];
  flatBoardFenHistory: string[];
  diceRollHistory: number[];
  historyNumMoves: number;
  replayCurrentFlatIndex: number;
  //replayCurrentTurnIndex: number;
  //replayCurrentMoveInTurnIndex: number;
  turn: Color;
  diceRoll: number;
  diceRoll1: number;
  diceRoll2: number;
  numMovesInTurn: number;
  firstMoveInTurn: boolean;
  gameOver: boolean;
  isLoadedGame: boolean;
  outcome?: string;
  gameStartTime: number;
};

export type BasicMove = {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
};

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

export const diceSVGs: { [key: string]: any } = {
  Icon_Dice1,
  Icon_Dice2,
  Icon_Dice3,
  Icon_Dice4,
  Icon_Dice5,
  Icon_Dice6,
};

export const playerIconSVGs = {
  w: pieceSVGs['Icon_wp'],
  b: pieceSVGs['Icon_bp'],
};

export const allColors: Color[] = [WHITE, BLACK];

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

export const allFilesReversed: (
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
)[] = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

export const allRanks: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8)[] = [
  1, 2, 3, 4, 5, 6, 7, 8,
];

export const allRanksReversed: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8)[] = [
  8, 7, 6, 5, 4, 3, 2, 1,
];

export const outcomes: string[] = [
  'Draw', // 0
  'White (Human) wins', // 1
  'Black (Human) wins', // 2
  'White (AI) wins', // 3
  'Black (AI) wins', // 4
];

export const outcomeIds: { [o: string]: number } = {};
outcomes.forEach((o, id) => (outcomeIds[o] = id));

export const getSquareRank: (square: Square) => number = (square: Square) =>
  +square[1];

const initBoard: Board = {
  initPositionFen: undefined,
  history: [[]],
  flatSanMoveHistory: [],
  flatSquareMoveHistory: [],
  flatBoardFenHistory: [],
  diceRollHistory: [],
  historyNumMoves: 0,
  replayCurrentFlatIndex: -1,
  //replayCurrentTurnIndex: 0,
  //replayCurrentMoveInTurnIndex: 0,
  turn: WHITE,
  diceRoll: -1,
  diceRoll1: -1,
  diceRoll2: -1,
  numMovesInTurn: -1,
  firstMoveInTurn: true,
  gameOver: false,
  isLoadedGame: false,
  gameStartTime: 0,
};

const defaultInitSettings: Settings = {
  onePlayerMode: true,
  AIPlayerIsSmart: false,
  humanPlaysColor: WHITE,
  humanPlaysColorRandomly: false,
  AIMoveDelay: 500,
  AIEngineUsesSocket: false,
  makeMoveDelay: 50,
};

let initSettings: Settings;
export let settings: Settings;

export let board: Board;
export let boardEngine: Chess; // <-- board rules engine

// Initialize settings and load any saved settings:
export function loadSettings(currentGameSettings: CurrentGameSettings): void {
  const retrievedSettings = localStorage_loadSettings();
  initSettings = retrievedSettings || defaultInitSettings;
  resetSettings(currentGameSettings, false);
}

// Save the current settings:
export function saveSettings(setNewCurrentGameSettings: () => void): void {
  localStorage_saveSettings(settings);
  // trigger resetting the current game settings and board reset:
  setNewCurrentGameSettings();
}

// Reset the current settings:
export const resetSettings = (
  currentGameSettings: CurrentGameSettings,
  resetToDefaultSettings: boolean = false
) => {
  if (resetToDefaultSettings) initSettings = defaultInitSettings;
  settings = { ...initSettings };
  // set which players gets which color:
  currentGameSettings.humanPlaysColor = settings.humanPlaysColorRandomly
    ? allColors[Math.floor(Math.random() * 2)]
    : settings.humanPlaysColor!;
};

// Reset the board to start a new game:
export const resetBoard = () => {
  board = { ...initBoard };
  board.history = [[]];
  board.flatSanMoveHistory = [];
  board.flatBoardFenHistory = [];
  board.flatSquareMoveHistory = [];
  board.diceRollHistory = [];
  board.gameStartTime = Math.floor(Date.now() / 1000);
  boardEngine = new Chess(board.initPositionFen);
  board.flatBoardFenHistory.push(boardEngine.fen());
  // close the chess AI engine socket if we have one running currently:
  if (chessAIEngine) closeChessAIEngine();
  // If we need the chess aI engine (1-player game) set it up:
  if (settings.onePlayerMode && settings.AIPlayerIsSmart) {
    initChessAIEngine();
  }
};

// Pre-populate all properties of board object properly based on a previously
// saved game, in order to prepare for replaying the game:
export function initBoardForGameReplay(game: SavedGame): void {
  resetBoard();
  /*
  console.log(
    'before prepping board',
    'game',
    JSON.stringify(game),
    'board',
    board
  );
  */
  board.gameOver = true;
  board.isLoadedGame = true;
  board.outcome = outcomes[game.outcome];
  const diceRollHistory = game.diceRollHistory.split(',').map((i) => +i);
  board.diceRollHistory = diceRollHistory;
  const flatSanMoveHistory = game.moveHistory.split(',');
  board.flatSanMoveHistory = flatSanMoveHistory;
  board.historyNumMoves = flatSanMoveHistory.length;
  const flatBoardFenHistory = board.flatBoardFenHistory;
  const flatSquareMoveHistory: Move[] = [];
  board.flatSquareMoveHistory = flatSquareMoveHistory;
  const historyNumDiceRolls = diceRollHistory.length;
  let currDiceRollIdx = 0;
  let currFlatMoveIdx = 0;
  board.history = [];
  while (currDiceRollIdx < historyNumDiceRolls) {
    let currTurnMoveIdx = 0;
    const diceRoll = diceRollHistory[currDiceRollIdx];
    const currMoveSet: string[] = [];
    board.history.push(currMoveSet);
    if (diceRoll === 0) {
      // roll was 0 and turn need to be given back to the other player:
      flatBoardFenHistory.pop();
      swapTurn();
      flatBoardFenHistory.push(boardEngine.fen());
    } else {
      while (currTurnMoveIdx < diceRoll) {
        // make the next move in the current turn move set:
        const move = boardEngine.move(flatSanMoveHistory[currFlatMoveIdx++]);
        // If this is not the last move in the current turn move set,
        // we need to manually change the turn back to the same player:
        if (currTurnMoveIdx < diceRoll - 1) swapTurn();
        currMoveSet.push(move.san);
        flatSquareMoveHistory.push(move);
        flatBoardFenHistory.push(boardEngine.fen());
        currTurnMoveIdx += 1;
      }
    }
    currDiceRollIdx += 1;
  }
  // Move the game back to beginning:
  boardEngine = new Chess(board.flatBoardFenHistory[1]);
  board.turn = boardEngine.turn();
  if (board.diceRollHistory[0] > 1) swapTurn();
  board.replayCurrentFlatIndex = 0;
  //console.log('done prepping board', board, boardEngine.turn());
}

export const getSquarePiece = (square: Square) => boardEngine.get(square);

// Returns whether or not making move from to square is a valid move based on current board:
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

// Execute the given move from to square:
export function makeMove(
  currentGameSettings: CurrentGameSettings,
  fromSquare: Square,
  toSquare: Square,
  promotion?: string
): void {
  const move: Move = boardEngine.move({
    from: fromSquare,
    to: toSquare,
    promotion: promotion,
  });
  board.turn = boardEngine.turn();
  board.history[board.history.length - 1].push(move.san);
  board.flatSanMoveHistory.push(move.san);
  board.historyNumMoves += 1;
  board.numMovesInTurn -= 1;
  //board.replayCurrentMoveInTurnIndex += 1;
  if (board.numMovesInTurn === 0) {
    // The player has played current turn's all the number of moves according to the dice roll:
    board.diceRoll = -1;
    board.numMovesInTurn = -1;
    board.firstMoveInTurn = true;
    board.history.push([]);
    //board.replayCurrentTurnIndex += 1;
    //board.replayCurrentMoveInTurnIndex = 0;
  } else {
    // The player still has moves left in the current turn, according to the dice roll:
    board.firstMoveInTurn = false;
    // swap turn back to the player who just moved since there's still more to make:
    swapTurn();
  }
  board.replayCurrentFlatIndex += 1;
  board.flatBoardFenHistory.push(boardEngine.fen());
  board.flatSquareMoveHistory.push(move);

  // After each move we need to check for game over because if player has moves left
  // in the turn but has no valid moves then it's a draw:
  checkForGameOver(currentGameSettings);
}

/*
// Undo to previous board before last move:
export function undoMove(): Move | null {
  console.log('undoMove', JSON.stringify(board));
  let prevMoveAfterUndo: Move | null = null;
  const undoneMove = boardEngine.undo();
  console.log('undoneMove', undoneMove);
  if (undoneMove) {
    if (board.replayCurrentMoveInTurnIndex === 0) {
      board.replayCurrentTurnIndex -= 1;
      board.replayCurrentMoveInTurnIndex =
        board.history[board.replayCurrentTurnIndex].length - 2;
    } else {
      board.replayCurrentMoveInTurnIndex -= 1;
      swapTurn();
    }
    console.log('after undoneMove', JSON.stringify(board));
    prevMoveAfterUndo = boardEngine.undo();
    console.log(prevMoveAfterUndo);
    if (prevMoveAfterUndo) boardEngine.move(prevMoveAfterUndo);
  }
  return prevMoveAfterUndo;
}
*/

// Returns true if we're in 1-player mode and it's not human player's turn:
export const isAITurn: (currentGameSettings: CurrentGameSettings) => boolean = (
  currentGameSettings: CurrentGameSettings
) =>
  settings.onePlayerMode && board.turn !== currentGameSettings.humanPlaysColor;

// Is the game over based on the current board. If so, set the outcome:
export const checkForGameOver: (
  currentGameSettings: CurrentGameSettings
) => void = (currentGameSettings: CurrentGameSettings) => {
  if (boardEngine.isCheckmate()) {
    board.gameOver = true;
    const isWhiteWinner = board.turn === BLACK;
    const isAIWinner =
      settings.onePlayerMode &&
      board.turn === currentGameSettings.humanPlaysColor;
    const outcomeId = isAIWinner
      ? isWhiteWinner
        ? 3
        : 4
      : isWhiteWinner
      ? 1
      : 2;
    board.outcome = outcomes[outcomeId];
  } else if (boardEngine.isDraw() || isDiceyChessDraw()) {
    board.gameOver = true;
    board.outcome = outcomes[0];
  }
};

// Is this a draw situation for Dicey chess, since player still hasn't played all
// moves in the current turn (based on the dice roll), but has no valid move to make:
const isDiceyChessDraw: () => boolean = () => boardEngine.moves().length === 0;

// Prompt user when promoting a pawn which type of piece they want to promote to:
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

// Move board fwd or bkwd in replay mode:
export function boardReplayStepMove(step: number): Move | null {
  const newReplayCurrentFlatIndex = board.replayCurrentFlatIndex + step;
  board.replayCurrentFlatIndex = newReplayCurrentFlatIndex;
  setBoard(board.flatBoardFenHistory[newReplayCurrentFlatIndex]);
  const move: Move | null =
    board.flatSquareMoveHistory[newReplayCurrentFlatIndex] || null;
  if (move) boardEngine.move(move);
  return move;
}

// Manually manipulate the current board to make it the other player's turn.
// This is needed since we want to make a player make multiple moves in a single
// turn:
export function swapTurn(): void {
  let fen = boardEngine.fen();
  const fenA = fen.split(' ');
  fenA[1] = fenA[1] === 'w' ? 'b' : 'w';
  fen = fenA.join(' ');
  setBoard(fen);
}

// Manually modify the state of the board:
export function setBoard(fen: string): void {
  boardEngine = new Chess(fen);
  board.turn = boardEngine.turn();
}

export function displayGameDuration(secs: number): string {
  const min = Math.floor(secs / 60);
  const minDisplay = min > 0 ? min + ' min. ' : '';
  return minDisplay + (secs - min * 60) + ' sec.';
}
