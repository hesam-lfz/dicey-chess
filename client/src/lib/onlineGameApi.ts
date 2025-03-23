import { Color } from 'chess.js';
import {
  CurrentBoardData,
  CurrentGameSettings,
  DebugOn,
  handleDiceRoll,
} from './boardEngineApi';

type SocketResponseMessage = {
  type: string;
  msg: string;
  data?: Record<string, any>;
};

type DiceRollData = {
  roll: number;
  roll1: number;
  roll2: number;
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
  userId: number,
  pin: string,
  onOnlineGameReadyCallback: (userPlaysColor: Color) => void
): void {
  theUserId = userId;
  thePin = pin;
  // Set up socket communication:
  onlineGameApi_socket = new WebSocket(
    '/ws'
    //'ws://${window.location.host}/ws'
  );

  onlineGameApi_socket.onopen = () => {
    if (DebugOn) console.log('Connected to server');
    onlineGameApi_socket.send(
      JSON.stringify({
        userId: userId,
        pin: pin,
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
            userId: userId,
            pin: pin,
            type: 'connection',
            msg: 'shake',
          })
        );
      } else if (msg === 'ready') {
        onOnlineGameReadyCallback(data!.color);
      }
    } else if (type === 'game') {
      // Receiving a game event (roll or move) from the opponent friend:
      if (msg === 'roll') {
        if (DebugOn) console.log('got friend roll', data);
        const diceData = data as DiceRollData;
        handleDiceRoll(
          currentGameSettings,
          currentBoardData,
          setNewCurrentBoardData,
          diceData.roll,
          diceData.roll1,
          diceData.roll2
        );
      }
    }
  };

  onlineGameApi_socket.onclose = () => {
    console.log('Disconnected from server');
  };

  onlineGameApi_socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

// Close the online game socket:
export function onlineGameApi_close(): void {
  if (
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
