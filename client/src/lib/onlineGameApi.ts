//let onlineGameApi_socket: WebSocket; // <-- chess AI player engine (socket ver.)
//let socketBusy: boolean = false;

// Starts a new web socket connection to server to establish connection between
// 2 players:
export function onlineGameApi_initialize(userId: number, pin: string): void {
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
        data: 'open',
      })
    );
  };

  onlineGameApi_socket.onmessage = (message) => {
    console.log(`Received: ${JSON.stringify(message)}`);
  };

  onlineGameApi_socket.onclose = () => {
    console.log('Disconnected from server');
  };

  onlineGameApi_socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}
