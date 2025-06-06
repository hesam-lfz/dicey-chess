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
  opponentRank: number;
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

type RemoteGameEventMessage = {
  msg: string;
  data?: Record<string, any>;
};

type InternalGlobals = {
  busyWaitMaxReattempts: number;
  busyWaitReattempts: number;
  waitOnBoardBusyDelay: number;
  gameMessagePipeline: RemoteGameEventMessage[];
  gameAbortHandled: boolean;
};

// Some globals accessed by various components/pages:
export const onlineGameApi_globals: OnlineGameGlobals = {
  aborted: false,
  opponentRank: 400,
};

// Some globals accessed by various components/pages:
const internalGlobals: InternalGlobals = {
  busyWaitMaxReattempts: 10,
  busyWaitReattempts: 0,
  // If receiving online game remote event, this is how much we wait until we
  // check again if we're ready processing incoming game event from the opponent:
  waitOnBoardBusyDelay: 2000,
  // Pipeline of incoming game event messages received from the remote opponent, to be
  // processed in order one at a time:
  gameMessagePipeline: [],
  gameAbortHandled: false,
};

let onlineGameApi_socket: WebSocket; // <-- chess AI player engine (socket ver.)
let theUserId: number;
let thePin: string;

// Handles receiving game events from the opponent friend
// If board is currently busy processing a previous event, waits first:
function handleNextGameMessage(
  currentGameSettings: CurrentGameSettings,
  getCurrentBoardData: () => CurrentBoardData,
  setNewCurrentBoardData: (
    data: SetCurrentBoardData,
    setState: boolean
  ) => void,
  onGameAbortCallback: () => void
): void {
  // Message pipeline should not be empty at this point. If it is, we have a bug!:
  if (internalGlobals.gameMessagePipeline.length === 0) return;
  // If board was busy making moves while we received this message, delay
  // processing it:
  const busyWaiting = board.busyBoardWaiting;
  if (DebugOn)
    console.log(
      'handleNextGameMessage',
      'next message in the pipeline:',
      JSON.stringify(internalGlobals.gameMessagePipeline[0]),
      'busyBoardWaiting',
      busyWaiting
    );
  if (busyWaiting) {
    if (
      internalGlobals.busyWaitReattempts < internalGlobals.busyWaitMaxReattempts
    ) {
      internalGlobals.busyWaitReattempts += 1;
      setTimeout(
        () =>
          handleNextGameMessage(
            currentGameSettings,
            getCurrentBoardData,
            setNewCurrentBoardData,
            onGameAbortCallback
          ),
        internalGlobals.waitOnBoardBusyDelay
      );
    } else {
      console.log('timed out busy waiting. Aborting game...');
      handleGameAbortMessage(onGameAbortCallback);
    }
    return;
  }
  internalGlobals.busyWaitReattempts = 0;
  // Mark game board busy as it processes the dice being rolled (this is being
  // checked for incoming online game messages to make sure they wait until
  // we can receive new game events):
  board.busyBoardWaiting = true;
  // Get the next incoming message in the pipeline to process:
  const { msg, data } =
    internalGlobals.gameMessagePipeline.shift() as RemoteGameEventMessage;
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
    internalGlobals.gameAbortHandled = true;
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

  onlineGameApi_socket.onopen = (): void => {
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

  onlineGameApi_socket.onmessage = (message): void => {
    // console.log(message);
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
        // Reset the game event pipeline:
        internalGlobals.busyWaitReattempts = 0;
        internalGlobals.gameMessagePipeline = [];
        internalGlobals.gameAbortHandled = false;
        onlineGameApi_globals.opponentRank = data!.opponentRank;
        onOnlineGameReadyCallback(data!.color);
      }
    } else if (type === 'game') {
      // Receiving a game abort event from the opponent friend:
      if (msg === 'abort') handleGameAbortMessage(onGameAbortCallback);
      else {
        internalGlobals.gameMessagePipeline.push({ msg, data });
        handleNextGameMessage(
          currentGameSettings,
          getCurrentBoardData,
          setNewCurrentBoardData,
          onGameAbortCallback
        );
      }
    }
  };

  onlineGameApi_socket.onclose = (): void => {
    console.log('Disconnected from server');
    if (!(internalGlobals.gameAbortHandled || board.gameOver))
      onGameAbortCallback();
  };

  onlineGameApi_socket.onerror = (error: Event): void => {
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
      data,
    })
  );
}
