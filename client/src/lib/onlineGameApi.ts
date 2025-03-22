import { Color } from 'chess.js';

type SocketResponseMessage = {
  type: string;
  msg: string;
  data?: Record<string, any>;
};

//let onlineGameApi_socket: WebSocket; // <-- chess AI player engine (socket ver.)
//let socketBusy: boolean = false;

// Starts a new web socket connection to server to establish connection between
// 2 players:
export function onlineGameApi_initialize(
  userId: number,
  pin: string,
  onOnlineGameReadyCallback: (userPlaysColor: Color) => void
): void {
  // Set up socket communication:

  const onlineGameApi_socket = new WebSocket(
    '/ws'
    //'ws://${window.location.host}/ws'
  );

  onlineGameApi_socket.onopen = () => {
    console.log('Connected to server');
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
    console.log('Received: ', response);
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
    }
  };

  onlineGameApi_socket.onclose = () => {
    console.log('Disconnected from server');
  };

  onlineGameApi_socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}
