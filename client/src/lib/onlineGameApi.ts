import { Color, PieceSymbol, Square } from 'chess.js';
import {
  CurrentBoardData,
  CurrentGameSettings,
  DebugOn,
  handleDiceRoll,
  makeMove,
} from './boardEngineApi';
import { User } from './auth';

export type OnlineGameGlobals = {
  //onlineGameAbortedCallback: () => void;
  aborted: boolean;
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

let onlineGameApi_socket: WebSocket; // <-- chess AI player engine (socket ver.)
//let socketBusy: boolean = false;
let theUserId: number;
let thePin: string;
// Starts a new web socket connection to server to establish connection between
// 2 players:
export function onlineGameApi_initialize(
  currentGameSettings: CurrentGameSettings,
  currentBoardData: CurrentBoardData,
  setNewCurrentBoardData: () => void,
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
    if (DebugOn) console.log('Received: ', response);
    if (type === 'connection') {
      if (msg === 'hand') {
        // Send "shake" to complete handshake with socket server:
        onlineGameApi_socket.send(
          JSON.stringify({
            userId: theUserId,
            pin: thePin,
            type: 'connection',
            msg: 'shake',
          })
        );
      } else if (msg === 'ready') {
        onOnlineGameReadyCallback(data!.color);
      }
    } else if (type === 'game') {
      // Receiving a game event: roll from the opponent friend:
      if (msg === 'roll') {
        if (DebugOn) console.log('got friend roll', data);
        const diceData = data as RemoteDiceRollData;
        handleDiceRoll(
          currentGameSettings,
          currentBoardData,
          setNewCurrentBoardData,
          diceData.roll,
          diceData.roll1,
          diceData.roll2,
          true
        );
      } // Receiving a game event: roll from the opponent friend:
      else if (msg === 'move') {
        if (DebugOn) console.log('got friend move', data);
        const moveData = data as RemoteMoveData;
        makeMove(
          currentGameSettings,
          currentBoardData,
          user,
          moveData.from as Square,
          moveData.to as Square,
          moveData.promotion as PieceSymbol | undefined,
          true
        );
      } else if (msg === 'abort') {
        onlineGameApi_socket.close();
        console.log('will call abort handler', onGameAbortCallback);
        onGameAbortCallback();
      }
    }
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
