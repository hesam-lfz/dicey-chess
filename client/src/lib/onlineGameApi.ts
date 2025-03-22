import WebSocket from 'ws';

let onlineGameApi_socket: WebSocket; // <-- chess AI player engine (socket ver.)
//let socketBusy: boolean = false;

// Starts a new web socket connection to server to establish connection between
// 2 players:
export function onlineGameApi_initialize(userId: number, pin: string): void {
  // Set up socket communication:

  onlineGameApi_socket = new WebSocket(
    '/ws'
    //'ws://${window.location.host}/ws'
  );

  onlineGameApi_socket.on('open', () => {
    console.log('Connected to server');
    onlineGameApi_socket.send(
      JSON.stringify({
        userId: userId,
        pin: pin,
        type: 'connection',
        data: 'open',
      })
    );
  });

  onlineGameApi_socket.on('message', (message) => {
    console.log(`Received: ${message}`);
  });

  onlineGameApi_socket.on('close', () => {
    console.log('Disconnected from server');
  });

  onlineGameApi_socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  /*
  const ws = new WebSocket('ws://localhost:8080');
  // new WebSocket('ws://localhost:3000/ws');

  ws.on('open', () => {
    console.log('Connected to server');
    ws.send('Hello from client!');
  });

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
  });

  ws.on('close', () => {
    console.log('Disconnected from server');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Send a message every 3 seconds
  setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('Another message from client');
    }
  }, 3000);

  chessAiEngine_socket.onmessage = (event) => {
    const chessApiMessage = JSON.parse(event.data);
    if (chessApiMessage.type === 'move') {
      //console.log('chess ai response arrived', chessApiMessage);
      chessAiEngineResponseMove = {
        from: chessApiMessage.from,
        to: chessApiMessage.to,
        promotion: chessApiMessage.promotion || undefined,
      };
    }
  };
  */
}
