import { Color, PieceSymbol, Square } from 'chess.js';
import {
  type CurrentBoardData,
  type CurrentGameSettings,
  type SetCurrentBoardData,
  board,
  DebugOn,
  handleDiceRoll,
  setNewMoveOnBoard,
} from './boardEngineApi';
import { User } from './auth';

export type OnlineGameGlobals = {
  aborted: boolean;
};

type InternalGlobals = {
  busyWaitMaxReattempts: number;
  busyWaitReattempts: number;
  waitOnBoardBusyDelay: number;
};

type SocketResponseMessage = {
  type: string;
  msg: string;
  data?: Record<string, any>;
};

type RemoteDiceRollData = {
  roll: number;
  roll1: number;
  roll2: number;
};

type RemoteMoveData = {
  from: string;
  to: string;
  promotion?: string;
};

// Some globals accessed by various components/pages:
export const onlineGameApi_globals: OnlineGameGlobals = {
  aborted: false,
};

// Some globals accessed by various components/pages:
const internalGlobals: InternalGlobals = {
  busyWaitMaxReattempts: 30,
  busyWaitReattempts: 0,
  // If receiving online game remote event, this is how much we wait until we
  // check again if we're ready processing incoming game event from the opponent:
  waitOnBoardBusyDelay: 1000,
};

let onlineGameApi_socket: WebSocket; // <-- chess AI player engine (socket ver.)
let theUserId: number;
let thePin: string;

// Handles receiving game events from the opponent friend
// If board is currently busy processing a previous event, waits first:
function handleGameMessage(
  currentGameSettings: CurrentGameSettings,
  getCurrentBoardData: () => CurrentBoardData,
  setNewCurrentBoardData: (
    data: SetCurrentBoardData,
    setState: boolean
  ) => void,
  onGameAbortCallback: () => void,
  msg: string,
  data?: Record<string, any>
): void {
  // If board was busy making moves while we received this message, delay
  // processing it:
  const busyWaiting = board.busyBoardWaiting;
  if (DebugOn)
    console.log(
      'handleGameMessage',
      msg,
      data,
      'busyBoardWaiting',
      busyWaiting
    );
  if (busyWaiting && msg !== 'abort') {
    if (
      internalGlobals.busyWaitReattempts < internalGlobals.busyWaitMaxReattempts
    ) {
      internalGlobals.busyWaitReattempts += 1;
      setTimeout(
        () =>
          handleGameMessage(
            currentGameSettings,
            getCurrentBoardData,
            setNewCurrentBoardData,
            onGameAbortCallback,
            msg,
            data
          ),
        internalGlobals.waitOnBoardBusyDelay
      );
    } else {
      console.log('timed out busy waiting. Aborting game...');
      handleGameAbortMessage(onGameAbortCallback);
    }
    return;
  } else internalGlobals.busyWaitReattempts = 0;
  // Receiving a game event: a dice roll from the opponent friend:
  if (msg === 'roll')
    handleGameDiceRollMessage(
      currentGameSettings,
      getCurrentBoardData,
      setNewCurrentBoardData,
      data
    );
  // Receiving a game event: a move from the opponent friend:
  else if (msg === 'move') handleGameMoveMessage(setNewCurrentBoardData, data);
  // Receiving a game abort event from the opponent friend:
  else if (msg === 'abort') handleGameAbortMessage(onGameAbortCallback);
}

// Handles receiving a game event: a dice roll from the opponent friend:
function handleGameDiceRollMessage(
  currentGameSettings: CurrentGameSettings,
  getCurrentBoardData: () => CurrentBoardData,
  setNewCurrentBoardData: (
    data: SetCurrentBoardData,
    setState: boolean
  ) => void,
  data?: Record<string, any>
): void {
  if (DebugOn) console.log('got friend roll', data);
  const diceData = data as RemoteDiceRollData;
  handleDiceRoll(
    currentGameSettings,
    getCurrentBoardData(),
    setNewCurrentBoardData,
    diceData.roll,
    diceData.roll1,
    diceData.roll2,
    true
  );
}

// Handles receiving a game event: a move from the opponent friend:
function handleGameMoveMessage(
  setNewCurrentBoardData: (
    data: SetCurrentBoardData,
    setState: boolean
  ) => void,
  data?: Record<string, any>
): void {
  if (DebugOn) console.log('got friend move', data);
  const moveData = data as RemoteMoveData;
  setNewMoveOnBoard(
    setNewCurrentBoardData,
    moveData.from as Square,
    moveData.to as Square,
    moveData.promotion as PieceSymbol | undefined
  );
}

// Handles receiving a game abort event from the opponent friend:
// This will also happen if reached gameover:
function handleGameAbortMessage(onGameAbortCallback: () => void): void {
  if (!board.gameOver) {
    onlineGameApi_socket.close();
    onGameAbortCallback();
  }
}

// Starts a new web socket connection to server to establish connection between
// 2 players:
export function onlineGameApi_initialize(
  currentGameSettings: CurrentGameSettings,
  getCurrentBoardData: () => CurrentBoardData,
  setNewCurrentBoardData: (
    data: SetCurrentBoardData,
    setState: boolean
  ) => void,
  user: User,
  pin: string,
  onOnlineGameReadyCallback: (userPlaysColor: Color) => void,
  onSocketFailureCallback: (error: Event) => void,
  onGameAbortCallback: () => void
): void {
  theUserId = user.userId;
  thePin = pin;
  // Set up socket communication:
  onlineGameApi_socket = new WebSocket('/ws');

  onlineGameApi_socket.onopen = () => {
    if (DebugOn) console.log('Connected to server');
    onlineGameApi_socket.send(
      JSON.stringify({
        userId: theUserId,
        pin: thePin,
        type: 'connection',
        msg: 'open',
      })
    );
  };

  onlineGameApi_socket.onmessage = (message) => {
    //console.log(message);
    const response = JSON.parse(message.data) as SocketResponseMessage;
    const { type, msg, data } = response;
    if (DebugOn) console.log('Received: ', JSON.stringify(response));
    if (type === 'connection') {
      if (msg === 'hand')
        // Send "shake" to complete handshake with socket server:
        onlineGameApi_socket.send(
          JSON.stringify({
            userId: theUserId,
            pin: thePin,
            type: 'connection',
            msg: 'shake',
          })
        );
      else if (msg === 'ready') {
        internalGlobals.busyWaitReattempts = 0;
        onOnlineGameReadyCallback(data!.color);
      }
    } else if (type === 'game')
      handleGameMessage(
        currentGameSettings,
        getCurrentBoardData,
        setNewCurrentBoardData,
        onGameAbortCallback,
        msg,
        data
      );
  };

  onlineGameApi_socket.onclose = () => {
    console.log('Disconnected from server');
  };

  onlineGameApi_socket.onerror = (error: Event) => {
    console.error('WebSocket error:', error);
    onSocketFailureCallback(error);
  };
}

// Close the online game socket:
export function onlineGameApi_close(): void {
  if (
    onlineGameApi_socket &&
    !(
      onlineGameApi_socket.readyState === onlineGameApi_socket.CLOSED ||
      onlineGameApi_socket.readyState === onlineGameApi_socket.CLOSING
    )
  )
    onlineGameApi_socket.close();
}

// Sends data about the player's recent roll to server to forward to online friend
// during an online game:
export function onlineGameApi_sendDiceRoll(
  roll: number,
  roll1: number,
  roll2: number
): void {
  onlineGameApi_socket.send(
    JSON.stringify({
      userId: theUserId,
      pin: thePin,
      type: 'game',
      msg: 'roll',
      data: { roll, roll1, roll2 },
    })
  );
}

// Sends data about the player's recent move to server to forward to online friend
// during an online game:
export function onlineGameApi_sendMove(
  from: string,
  to: string,
  promotion?: string
): void {
  const data: RemoteMoveData = { from, to };
  if (promotion) data.promotion = promotion;
  onlineGameApi_socket.send(
    JSON.stringify({
      userId: theUserId,
      pin: thePin,
      type: 'game',
      msg: 'move',
      data: data,
    })
  );
}
