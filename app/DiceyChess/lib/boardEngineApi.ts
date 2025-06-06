import Icon_wk from '@/assets/images/king_w.svg';
import Icon_bk from '@/assets/images/king_b.svg';
import Icon_wq from '@/assets/images/queen_w.svg';
import Icon_bq from '@/assets/images/queen_b.svg';
import Icon_wb from '@/assets/images/bishop_w.svg';
import Icon_bb from '@/assets/images/bishop_b.svg';
import Icon_wn from '@/assets/images/knight_w.svg';
import Icon_bn from '@/assets/images/knight_b.svg';
import Icon_wr from '@/assets/images/rook_w.svg';
import Icon_br from '@/assets/images/rook_b.svg';
import Icon_wp from '@/assets/images/pawn_w.svg';
import Icon_bp from '@/assets/images/pawn_b.svg';
import Icon_Dice1 from '@/assets/images/dice-1.svg';
import Icon_Dice2 from '@/assets/images/dice-2.svg';
import Icon_Dice3 from '@/assets/images/dice-3.svg';
import Icon_Dice4 from '@/assets/images/dice-4.svg';
import Icon_Dice5 from '@/assets/images/dice-5.svg';
import Icon_Dice6 from '@/assets/images/dice-6.svg';

import {
  Chess,
  WHITE,
  BLACK,
  PAWN,
  KING,
  type Square,
  type PieceSymbol,
  type Color,
  type Move,
  type Piece,
} from 'chess.js';

import {
  storageApi_loadSettings,
  storageApi_saveSettings,
  storageApi_updatePlayerRank,
} from './storageApi';
import {
  chessAiEngine_fallbackActivated,
  chessAiEngine_socket,
  chessAiEngineApi_closeChessAiEngine_socket,
  chessAiEngineApi_initChessAiEngine,
} from './gameAiApi';
import { readToken, saveAuth, User } from './auth';
import {
  onlineGameApi_close,
  onlineGameApi_globals,
  onlineGameApi_sendDiceRoll,
  onlineGameApi_sendMove,
} from './onlineGameApi';

export type GameGlobals = {
  dialogMessagesToShow: string[];
};

// General internal game settings:
export type InternalSettings = {
  initPlayerRank: number;
  smartAIPlayerRank: number;
  stupidAIPlayerRank: number;
  makeMoveDelay: number;
  AIMoveDelay: number;
  pauseOnZeroRollDelay: number;
  dialogOpenDelay: number;
  localStorageOpDelay: number;
  AIEngineUsesSocket: boolean;
  // When requesting to play online friend with an invite, frequently recheck
  // until the friend has send mutual invite back to us. This is the timeout
  // between each recheck:
  friendInviteRequestRecheckTimeout: number;
  friendInviteRequestRecheckMaxAttempts: number;
};

// General user controlled settings:
export type Settings = {
  onePlayerMode: boolean;
  opponentIsAI: boolean;
  AIPlayerIsSmart: boolean;
  userPlaysColor: Color | null;
  userPlaysColorRandomly: boolean;
  AIGameAffectsPlayerRank: boolean;
};

// Settings specific for a given game:
export type CurrentGameSettings = {
  settingsRetrieved: boolean;
  // Will set to true when AI engine API cannot be used due to network failures/restrictions:
  chessAiEngine_fallbackActivated: boolean;
  gameId: number;
  userPlaysColor: Color;
  opponentIsAI: boolean;
  opponent: string;
};

// Settings specific for a given game:
export type CurrentBoardData = {
  version: number;
  turn: Color;
  diceRoll: number;
  diceRoll1: number;
  diceRoll2: number;
  numMovesInTurn: number;
  currMoveFromSq: Square | null;
  currMoveToSq: Square | null;
  currMovePromotion: PieceSymbol | null;
};

export type SetCurrentBoardData = {
  turn?: Color;
  diceRoll?: number;
  diceRoll1?: number;
  diceRoll2?: number;
  numMovesInTurn?: number;
  currMoveFromSq?: Square | null;
  currMoveToSq?: Square | null;
  currMovePromotion?: PieceSymbol | null;
};

// outcome number for a game (1 = win, 0.5 = draw, 0 = loss):
export type GameOutcomeScore = 0 | 0.5 | 1;

export type SavedGame = {
  userId: number;
  at: number;
  duration: number;
  opponent: string;
  outcome: number;
  moveHistory: string;
  diceRollHistory: string;
  userPlaysWhite: boolean;
};

export type Board = {
  busyBoardWaiting: boolean;
  busyOpponentWaiting: boolean;
  initPositionFen?: string;
  history: string[][];
  flatSanMoveHistory: string[];
  flatSquareMoveHistory: Move[];
  diceRollHistory: number[];
  historyNumMoves: number;
  replayCurrentFlatIndex: number;
  firstMoveInTurn: boolean;
  gameOver: boolean;
  isLoadedGame: boolean;
  outcomeId?: number;
  outcome?: string;
  gameStartTime: number;
};

export type BasicMove = {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
};

// Some globals accessed by various components/pages:
export const gameGlobals: GameGlobals = {
  dialogMessagesToShow: [],
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
  w: pieceSVGs.Icon_wp,
  b: pieceSVGs.Icon_bp,
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
  'White (You) won vs. $OPPONENT', // 1
  'Black (You) won vs. $OPPONENT', // 2
  'White ($OPPONENT) won vs. You', // 3
  'Black ($OPPONENT) won vs. You', // 4
];

export const getSquareRank: (square: Square) => number = (square: Square) =>
  +square[1];

const initBoard: Board = {
  busyBoardWaiting: false,
  busyOpponentWaiting: false,
  initPositionFen: undefined,
  history: [[]],
  flatSanMoveHistory: [],
  flatSquareMoveHistory: [],
  diceRollHistory: [],
  historyNumMoves: 0,
  replayCurrentFlatIndex: -1,
  firstMoveInTurn: true,
  gameOver: false,
  isLoadedGame: false,
  gameStartTime: 0,
};

export const internalSettings: InternalSettings = {
  initPlayerRank: 400,
  smartAIPlayerRank: 1000,
  stupidAIPlayerRank: 400,
  AIMoveDelay: 500,
  makeMoveDelay: 50,
  pauseOnZeroRollDelay: 2000,
  dialogOpenDelay: 200,
  localStorageOpDelay: 500,
  AIEngineUsesSocket: false,
  friendInviteRequestRecheckTimeout: 10000,
  friendInviteRequestRecheckMaxAttempts: 12,
};

const defaultInitSettings: Settings = {
  onePlayerMode: true,
  opponentIsAI: true,
  AIPlayerIsSmart: true,
  userPlaysColor: WHITE,
  userPlaysColorRandomly: false,
  AIGameAffectsPlayerRank: true,
};

let initSettings: Settings;

export const DebugOn = true; // window.location.search.includes('debugOn=true');

export let settings: Settings = { ...defaultInitSettings };

export let board: Board;
export let boardEngine: Chess; // <-- board rules engine

// Initialize settings and load any saved settings:
export async function loadSettings(
  currentGameSettings: CurrentGameSettings,
  setNewCurrentGameSettings: () => void
): Promise<void> {
  const retrievedSettings = await storageApi_loadSettings();
  if (DebugOn) console.log('retrievedSettings', retrievedSettings);
  initSettings = retrievedSettings || defaultInitSettings;
  resetSettings(currentGameSettings, setNewCurrentGameSettings, true, false);
}

// Save the current settings:
export async function saveSettings(
  currentGameSettings: CurrentGameSettings,
  setNewCurrentGameSettings: () => void
): Promise<void> {
  await storageApi_saveSettings(settings);
  // trigger resetting the current game settings and board reset:
  setCurrentGameSettingsBasedOnSettings(
    currentGameSettings,
    setNewCurrentGameSettings
  );
}

// Reset the current settings:
export const resetSettings = (
  currentGameSettings: CurrentGameSettings,
  setNewCurrentGameSettings: () => void,
  resetToInitSettings: boolean = false,
  resetToDefaultSettings: boolean = false
): void => {
  if (DebugOn)
    console.log('start resetSettings', settings, currentGameSettings);
  // If we're currently in a game with an online friend, close the web socket
  // connection:
  if (isGameAgainstOnlineFriend(currentGameSettings)) onlineGameApi_close();
  if (resetToDefaultSettings) initSettings = defaultInitSettings;
  if (resetToInitSettings) settings = { ...initSettings };
  setCurrentGameSettingsBasedOnSettings(
    currentGameSettings,
    setNewCurrentGameSettings
  );
  currentGameSettings.settingsRetrieved ||= true;
  if (DebugOn) console.log('done resetSettings', settings, currentGameSettings);
};

// Sets the current game settings based on current settings:
export const setCurrentGameSettingsBasedOnSettings = (
  currentGameSettings: CurrentGameSettings,
  setNewCurrentGameSettings: () => void
): void => {
  currentGameSettings.chessAiEngine_fallbackActivated =
    chessAiEngine_fallbackActivated;
  // set one player mode against AI:
  currentGameSettings.opponentIsAI = settings.opponentIsAI;
  // set opponent
  currentGameSettings.opponent = settings.onePlayerMode
    ? currentGameSettings.opponentIsAI
      ? 'AI'
      : 'Friend'
    : 'You #2';
  // set which players gets which color:
  currentGameSettings.userPlaysColor = settings.userPlaysColorRandomly
    ? allColors[Math.floor(Math.random() * 2)]
    : settings.userPlaysColor!;
  setNewCurrentGameSettings();
  if (DebugOn) console.log('currentGameSettings', currentGameSettings);
};

// Reset the board to start a new game:
export const resetBoard = (
  currentGameSettings: CurrentGameSettings,
  setNewCurrentGameSettings: () => void,
  setNewCurrentBoardData: (data: SetCurrentBoardData, setState: boolean) => void
): void => {
  console.log('start resetBoard. settings:', settings);
  // If we're currently in a game with an online friend, close the web socket
  // connection:
  if (isGameAgainstOnlineFriend(currentGameSettings)) onlineGameApi_close();

  board = { ...initBoard };
  board.history = [[]];
  board.flatSanMoveHistory = [];
  board.flatSquareMoveHistory = [];
  board.diceRollHistory = [];
  board.gameStartTime = Math.floor(Date.now() / 1000);
  boardEngine = new Chess(board.initPositionFen);
  // increment gameId to trigger all components to reset:
  currentGameSettings.gameId += 1;
  setNewCurrentBoardData(
    {
      diceRoll: -1,
      diceRoll1: -1,
      diceRoll2: -1,
      currMoveFromSq: null,
      currMoveToSq: null,
      currMovePromotion: null,
      turn: boardEngine.turn(),
    },
    false
  );
  setNewCurrentGameSettings();
  // close the chess AI engine socket if we have one running currently:
  if (chessAiEngine_socket) chessAiEngineApi_closeChessAiEngine_socket();
  // If we need the chess aI engine (1-player game) set it up:
  console.log('start resetBoard. settings:', settings);
  if (isGameAgainstAI(currentGameSettings) && settings.AIPlayerIsSmart)
    chessAiEngineApi_initChessAiEngine();
};

// Pre-populate all properties of board object properly based on a previously
// saved game, in order to prepare for replaying the game:
// Returns false if fails
export function initBoardForGameReplay(
  currentGameSettings: CurrentGameSettings,
  setNewCurrentGameSettings: () => void,
  setNewCurrentBoardData: (
    data: SetCurrentBoardData,
    setState: boolean
  ) => void,
  game: SavedGame
): boolean {
  resetBoard(
    currentGameSettings,
    setNewCurrentGameSettings,
    setNewCurrentBoardData
  );
  if (DebugOn)
    console.log(
      'loading saved game, before prepping board',
      'game',
      JSON.stringify(game),
      'board',
      board
    );

  currentGameSettings.userPlaysColor = game.userPlaysWhite ? WHITE : BLACK;
  currentGameSettings.opponentIsAI = game.opponent === 'AI';
  currentGameSettings.opponent = game.opponent;
  board.gameOver = true;
  board.isLoadedGame = true;
  board.outcomeId = game.outcome;
  board.outcome = outcomes[game.outcome].replace('$OPPONENT', game.opponent);
  const diceRollHistory = game.diceRollHistory.split(',').map((i) => +i);
  board.diceRollHistory = diceRollHistory;
  const flatSanMoveHistory = game.moveHistory.split(',');
  board.flatSanMoveHistory = flatSanMoveHistory;
  board.historyNumMoves = flatSanMoveHistory.length;
  const flatSquareMoveHistory: Move[] = [];
  board.flatSquareMoveHistory = flatSquareMoveHistory;
  const historyNumDiceRolls = diceRollHistory.length;
  let currDiceRollIdx = 0;
  let currFlatMoveIdx = 0;
  board.history = [];
  try {
    while (currDiceRollIdx < historyNumDiceRolls) {
      let currTurnMoveIdx = 0;
      const diceRoll = diceRollHistory[currDiceRollIdx];
      const currMoveSet: string[] = [];
      board.history.push(currMoveSet);
      if (diceRoll === 0) {
        // roll was 0 and turn need to be given back to the other player:
        swapTurn(setNewCurrentBoardData);
      } else {
        while (currTurnMoveIdx < diceRoll) {
          // make the next move in the current turn move set:
          const move = boardEngine.move(flatSanMoveHistory[currFlatMoveIdx++]);
          // If this is not the last move in the current turn move set,
          // we need to manually change the turn back to the same player:
          if (currTurnMoveIdx < diceRoll - 1) swapTurn(setNewCurrentBoardData);
          currMoveSet.push(move.san);
          flatSquareMoveHistory.push(move);
          currTurnMoveIdx += 1;
        }
      }
      currDiceRollIdx += 1;
    }
    // Move the game back to beginning:
    boardEngine = new Chess(board.flatSquareMoveHistory[0].after);
    setNewCurrentBoardData({ turn: boardEngine.turn() }, false);
    if (board.diceRollHistory[0] > 1) swapTurn(setNewCurrentBoardData);
    board.replayCurrentFlatIndex = 0;
    setNewCurrentGameSettings();
    if (DebugOn)
      console.log(
        'loading saved game, done prepping board',
        'currentGameSettings',
        currentGameSettings,
        'board',
        board
      );
    return true;
  } catch (error) {
    console.error(
      'Loading the saved game failed. The game was not saved properly and will be removed: ',
      error
    );
    resetBoard(
      currentGameSettings,
      setNewCurrentGameSettings,
      setNewCurrentBoardData
    );
    return false;
  }
}

export const getSquarePiece = (square: Square): Piece | undefined =>
  boardEngine.get(square);

// Returns whether or not making move from to square is a valid move based on current board:
// Note: A check move is not valid unless it's the last move in the current dice roll's move-set.
export function isValidMove(
  fromSquare: Square,
  toSquare: Square,
  isLastMoveInTurn: boolean,
  anyPromotionOnly: boolean,
  promotion?: PieceSymbol
): boolean {
  // boardEngine accepts a move in which a king is taken! Take care of it manually here:
  const toPiece = getSquarePiece(toSquare);
  if (toPiece && toPiece.type === KING) return false;
  const possibleMoves = getPossibleMoves(isLastMoveInTurn, fromSquare);
  return (
    (anyPromotionOnly
      ? possibleMoves.filter((m) => m.to === toSquare && m.promotion)
      : possibleMoves.filter(
          (m) => m.to === toSquare && m.promotion === promotion
        )
    ).length > 0
  );
}

// Returns whether this a promotion move and a valid one?
export function isPromotionMove(
  fromSquare: Square,
  toSquare: Square,
  turn: Color,
  isLastMoveInTurn: boolean
): boolean {
  const piece = getSquarePiece(fromSquare)!;
  if (piece.type === PAWN) {
    const toSquareRank = getSquareRank(toSquare);
    if (turn === WHITE ? toSquareRank === 8 : toSquareRank === 1)
      return isValidMove(fromSquare, toSquare, isLastMoveInTurn, true);
  }
  return false;
}

// Returns list of all valid moves (optionally only from the specified fromSquare):
export function getPossibleMoves(
  isLastMoveInTurn: boolean,
  fromSquare?: Square
): Move[] {
  const params = {
    square: fromSquare,
    verbose: true,
  };
  let possibleMoves = boardEngine.moves(params) as Move[];
  // A check move is not valid unless it's the last move in the current roll's move-set:
  if (!isLastMoveInTurn)
    possibleMoves = possibleMoves.filter((m) => !inCheck(m.after));
  return possibleMoves;
}

// Returns list of all valid promotion piece types (only from the specified fromSquare):
export function getPossiblePromotions(
  isLastMoveInTurn: boolean,
  toSquare: Square,
  fromSquare?: Square
): PieceSymbol[] {
  const params = {
    square: fromSquare,
    verbose: true,
  };
  let possibleMoves = (boardEngine.moves(params) as Move[]).filter(
    (m) => m.to === toSquare && m.promotion
  );
  // A check move is not valid unless it's the last move in the current roll's move-set:
  if (!isLastMoveInTurn)
    possibleMoves = possibleMoves.filter((m) => !inCheck(m.after));
  return possibleMoves.map((m) => m.promotion!);
}

// Returns list of all valid moves (optionally only from the specified fromSquare),
// Iin the SAN format separated by space:
export function getPossibleSanMoves(
  isLastMoveInTurn: boolean,
  fromSquare?: Square
): string {
  return getPossibleMoves(isLastMoveInTurn, fromSquare)
    .map((m) => m.san)
    .join(' ');
}

// Marks the squares for the move that's happening:
export function setNewMoveOnBoard(
  setNewCurrentBoardData: (
    data: SetCurrentBoardData,
    setState: boolean
  ) => void,
  fromSquare: Square,
  toSquare: Square,
  promotion?: PieceSymbol
): void {
  setNewCurrentBoardData(
    {
      currMoveFromSq: fromSquare,
      currMoveToSq: toSquare,
      currMovePromotion: promotion || null,
    },
    true
  );
}

// Execute the given move from to square:
export function makeMove(
  currentGameSettings: CurrentGameSettings,
  getCurrentBoardData: () => CurrentBoardData,
  setNewCurrentBoardData: (
    data: SetCurrentBoardData,
    setState: boolean
  ) => void,
  user: User | undefined,
  fromSquare: Square,
  toSquare: Square,
  promotion?: PieceSymbol,
  isOnlineGameRemoteMove: boolean = false
): void {
  const currentBoardData = getCurrentBoardData();
  if (DebugOn)
    console.log(
      'before makeMove',
      'currentGameSettings',
      currentGameSettings,
      'currentBoardData',
      JSON.stringify(currentBoardData)
    );
  try {
    const move: Move = boardEngine.move({
      from: fromSquare,
      to: toSquare,
      promotion,
    });
    // if this is an online game with a friend, send the roll data:
    if (
      isGameAgainstOnlineFriend(currentGameSettings) &&
      !isOnlineGameRemoteMove &&
      !isOpponentsTurn(currentGameSettings, currentBoardData)
    )
      onlineGameApi_sendMove(fromSquare, toSquare, promotion);

    // if it's a promotion, update the the type of promoted piece:
    if (promotion) getSquarePiece(toSquare)!.type = promotion;
    const currentBoardDataUpdates: SetCurrentBoardData = {};
    currentBoardDataUpdates.turn = boardEngine.turn();
    board.history[board.history.length - 1].push(move.san);
    board.flatSanMoveHistory.push(move.san);
    board.historyNumMoves += 1;
    currentBoardDataUpdates.numMovesInTurn =
      currentBoardData.numMovesInTurn - 1;
    setNewCurrentBoardData(currentBoardDataUpdates, false);
    // board.replayCurrentMoveInTurnIndex += 1;
    if (currentBoardData.numMovesInTurn === 0) {
      // The player has played current turn's all the number of moves according to the dice roll:
      currentBoardDataUpdates.diceRoll = -1;
      currentBoardDataUpdates.numMovesInTurn = -1;
      setNewCurrentBoardData(currentBoardDataUpdates, false);
      board.firstMoveInTurn = true;
      board.history.push([]);
    } else {
      // The player still has moves left in the current turn, according to the dice roll:
      board.firstMoveInTurn = false;
      // swap turn back to the player who just moved since there's still more to make:
      swapTurn(setNewCurrentBoardData);
    }
    board.replayCurrentFlatIndex += 1;
    board.flatSquareMoveHistory.push(move);

    // After each move we need to check for game over because if player has moves left
    // in the turn but has no valid moves then it's a draw:
    checkForGameOver(currentGameSettings, currentBoardData, user);
  } catch (error) {
    console.error(
      'Error making move',
      'from',
      fromSquare,
      'to',
      toSquare,
      'promotion',
      promotion,
      'error:',
      error
    );
    console.log(
      'turn',
      boardEngine.turn(),
      'fen',
      boardEngine.fen(),
      'currentBoardData',
      JSON.stringify(currentBoardData),
      'board',
      JSON.stringify(board)
    );
  }
}

// Helper for function handleDiceRoll below (called when rolled a 0):
function handleDiceRoll_runSwapTurn(
  setNewCurrentBoardData: (
    data: SetCurrentBoardData,
    setState: boolean
  ) => void,
  roll: number
): void {
  // player got 0 roll, so no moves in this turn...
  // Swap turn, unless player is in check (in which case
  // the player rolls again):
  const playerInCheck = boardEngine.inCheck();
  if (playerInCheck) {
    // pop the last roll so player in check can re-roll dice:
    board.diceRollHistory.pop();
  } else {
    swapTurn(setNewCurrentBoardData);
    board.history.push([]);
  }
  roll = -1;
  setNewCurrentBoardData({ diceRoll: roll, numMovesInTurn: roll }, true); // Need here????
}

// Handle a player's latest roll of dice:
export function handleDiceRoll(
  currentGameSettings: CurrentGameSettings,
  currentBoardData: CurrentBoardData,
  setNewCurrentBoardData: (
    data: SetCurrentBoardData,
    setState: boolean
  ) => void,
  roll: number,
  roll1: number,
  roll2: number,
  isOnlineGameRemoteRoll: boolean = false
): void {
  board.diceRollHistory.push(roll);
  // Mark game board busy as it processes the dice being rolled (this is being
  // checked for incoming online game messages to make sure they wait until
  // we can receive new game events):
  board.busyBoardWaiting = true;
  setNewCurrentBoardData(
    {
      diceRoll: roll,
      diceRoll1: roll1,
      diceRoll2: roll2,
      numMovesInTurn: roll,
    },
    false
  );
  // if this is an online game with a friend, send the roll data:
  if (
    isGameAgainstOnlineFriend(currentGameSettings) &&
    !isOnlineGameRemoteRoll &&
    !isOpponentsTurn(currentGameSettings, currentBoardData)
  )
    onlineGameApi_sendDiceRoll(roll, roll1, roll2);
  if (roll === 0) {
    // In case of this fn being called as a result of a remote roll in an online game,
    // add a bit of delay if the roll was 0 and we're changing turn (so player can see
    // the 0 roll before getting the turn back):
    if (isOnlineGameRemoteRoll) {
      setNewCurrentBoardData({}, true);
      setTimeout(
        () => handleDiceRoll_runSwapTurn(setNewCurrentBoardData, roll),
        internalSettings.pauseOnZeroRollDelay
      );
    } else handleDiceRoll_runSwapTurn(setNewCurrentBoardData, roll);
  } else {
    setNewCurrentBoardData({}, true); // Need here????
  }
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

// Returns true if we're in 1-player mode
export const isOnePlayerMode: () => boolean = () => settings.onePlayerMode;

// Returns true if we're in 1-player mode and it's not human player's turn:
export const isOpponentsTurn: (
  currentGameSettings: CurrentGameSettings,
  currentBoardData: CurrentBoardData
) => boolean = (
  currentGameSettings: CurrentGameSettings,
  currentBoardData: CurrentBoardData
) =>
  settings.onePlayerMode &&
  currentBoardData.turn !== currentGameSettings.userPlaysColor;

// Returns true if we're in 1-player mode against AI and it's not human player's turn:
export const isAITurn: (
  currentGameSettings: CurrentGameSettings,
  currentBoardData: CurrentBoardData
) => boolean = (
  currentGameSettings: CurrentGameSettings,
  currentBoardData: CurrentBoardData
) =>
  isGameAgainstAI(currentGameSettings) &&
  currentBoardData.turn !== currentGameSettings.userPlaysColor;

// Is the game over based on the current board. If so, set the outcome:
export const checkForGameOver: (
  currentGameSettings: CurrentGameSettings,
  currentBoardData: CurrentBoardData,
  user: User | undefined
) => void = (
  currentGameSettings: CurrentGameSettings,
  currentBoardData: CurrentBoardData,
  user: User | undefined
) => {
  if (boardEngine.isCheckmate()) {
    board.gameOver = true;
    const isWhiteWinner = currentBoardData.turn === BLACK;
    const isOpponentWinner =
      settings.onePlayerMode &&
      currentBoardData.turn === currentGameSettings.userPlaysColor;
    const outcomeId = isOpponentWinner
      ? isWhiteWinner
        ? 3
        : 4
      : isWhiteWinner
      ? 1
      : 2;
    board.outcomeId = outcomeId;
    board.outcome = outcomes[outcomeId].replace(
      '$OPPONENT',
      currentGameSettings.opponent
    );
  } else if (boardEngine.isDraw() || isDiceyChessDraw()) {
    board.gameOver = true;
    board.outcomeId = 0;
    board.outcome = outcomes[0];
  }
  // if game is over and user in session, update player rank:
  if (board.gameOver && gameAffectsPlayerRank(currentGameSettings, user, true))
    calculateAndStorePlayerNewRank(currentGameSettings, user!);
};

/*
A simple and widely used system for updating player rankings is the Elo rating system. It's easy to implement and works well for 1v1 games like chess.

Here's a basic breakdown of the Elo formula:
Expected Score for Player A:

Where:

R_A is Player A's current rating.
R_B is Player B's current rating.
S_A is the actual outcome for Player A (1 = win, 0.5 = draw, 0 = loss).
K is the adjustment factor (typically 32 for casual players, 16 for pros).
*/
function calculatePlayerNewRank(
  playerRank: number,
  opponentRank: number,
  outcomeScore: GameOutcomeScore,
  kFactor: number = 32
): number {
  // Calculate expected score
  const expectedScore =
    1 /
    (1 +
      Math.pow(
        10,
        (opponentRank - playerRank) / internalSettings.initPlayerRank
      ));
  // Update rank
  const newRank = Math.round(
    playerRank + kFactor * (outcomeScore - expectedScore)
  );
  return newRank;
}

// When the game is over and user in session, if this was a game which
// affects player rank (currently: if played against another player/AI) update
// the rank in memory and in db storage:
// actual outcome for Player A (1 = win, 0.5 = draw, 0 = loss).
export async function calculateAndStorePlayerNewRank(
  currentGameSettings: CurrentGameSettings,
  user: User
): Promise<boolean> {
  const outcomeScore = getOutcomeScoreFromOutcomeId(board.outcomeId!);
  const opponentRank = getOpponentRank(currentGameSettings, user);
  const newRank = calculatePlayerNewRank(user.rank, opponentRank, outcomeScore);
  if (DebugOn) console.log('current player rank:', user.rank);
  if (newRank === user.rank) return true;
  user.rank = newRank;
  if (DebugOn) console.log('updating player rank to:', user.rank);
  try {
    if (await storageApi_updatePlayerRank(user)) {
      saveAuth(user, readToken()!);
      return true;
    }
  } catch (error) {
    console.error('Could not store player rank to the database', error);
  }
  return false;
}

// outcome number for Player: (1 = win, 0.5 = draw, 0 = loss)
const getOutcomeScoreFromOutcomeId = (outcomeId: number): GameOutcomeScore =>
  outcomeId === 0 ? 0.5 : outcomeId <= 2 ? 1 : 0;

// Gets current opponents rank:
const getOpponentRank = (
  currentGameSettings: CurrentGameSettings,
  user: User
): number =>
  settings.onePlayerMode
    ? currentGameSettings.opponentIsAI
      ? settings.AIPlayerIsSmart
        ? internalSettings.smartAIPlayerRank
        : internalSettings.stupidAIPlayerRank
      : onlineGameApi_globals.opponentRank
    : user.rank;

// Returns whether based on the recent game settings the player rank
// should be updated (currently: if played against another player or AI):
// Game past first couple of moves is considered affecting rank...
export const gameAffectsPlayerRank: (
  currentGameSettings: CurrentGameSettings,
  user: User | undefined,
  onGameOver: boolean
) => boolean = (
  currentGameSettings: CurrentGameSettings,
  user: User | undefined,
  onGameOver: boolean
) =>
  user !== undefined &&
  !board.isLoadedGame &&
  (onGameOver || !board.gameOver) &&
  board.replayCurrentFlatIndex > 1 && // Game past first couple of moves is considered affecting rank...
  settings.onePlayerMode &&
  (settings.AIGameAffectsPlayerRank || !currentGameSettings.opponentIsAI);

// Is this a draw situation for Dicey chess, since player still hasn't played all
// moves in the current turn (based on the dice roll), but has no valid move to make:
const isDiceyChessDraw: () => boolean = () => boardEngine.moves().length === 0;

// Move board fwd or bkwd in replay mode:
export function boardReplayStepMove(
  setNewCurrentBoardData: (
    data: SetCurrentBoardData,
    setState: boolean
  ) => void,
  step: number
): Move | null {
  const newReplayCurrentFlatIndex = board.replayCurrentFlatIndex + step;
  board.replayCurrentFlatIndex = newReplayCurrentFlatIndex;
  const move: Move | null =
    board.flatSquareMoveHistory[newReplayCurrentFlatIndex] || null;
  setBoard(setNewCurrentBoardData, move.before);
  if (move) boardEngine.move(move);
  return move;
}

// Manually manipulate the current board to make it the other player's turn.
// This is needed since we want to make a player make multiple moves in a single
// turn:
export function swapTurn(
  setNewCurrentBoardData: (data: SetCurrentBoardData, setState: boolean) => void
): void {
  let fen = boardEngine.fen();
  const fenA = fen.split(' ');
  fenA[1] = fenA[1] === 'w' ? 'b' : 'w';
  fen = fenA.join(' ');
  setBoard(setNewCurrentBoardData, fen);
}

// Manually modify the state of the board:
export function setBoard(
  setNewCurrentBoardData: (
    data: SetCurrentBoardData,
    setState: boolean
  ) => void,
  fen: string
): void {
  boardEngine = new Chess(fen);
  setNewCurrentBoardData({ turn: boardEngine.turn() }, false);
}

// Given board fen position, is the player with turn in check:
export const inCheck = (fen: string): boolean => new Chess(fen).inCheck();

// Is game against AI:
export const isGameAgainstAI = (
  currentGameSettings: CurrentGameSettings
): boolean => currentGameSettings.opponentIsAI && settings.onePlayerMode;

// Is game against online friend:
export const isGameAgainstOnlineFriend = (
  currentGameSettings: CurrentGameSettings
): boolean => !currentGameSettings.opponentIsAI && settings.onePlayerMode;

export function displayGameDuration(secs: number): string {
  const min = Math.floor(secs / 60);
  const minDisplay = min > 0 ? min + ' min. ' : '';
  return minDisplay + (secs - min * 60) + ' sec.';
}
