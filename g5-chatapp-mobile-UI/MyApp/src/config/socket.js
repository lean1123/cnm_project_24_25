import { io } from 'socket.io-client';
import { SOCKET_URL } from './constants';

// Create a socket instance with configuration
let socket = null;

export const initializeSocket = (token) => {
  // Close existing socket if it exists
  if (socket) {
    socket.close();
  }

  // Create new socket with authorization
  socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
    auth: token ? { token } : undefined
  });

  console.log(`[Socket Config] Socket initialized with URL: ${SOCKET_URL}`);
  return socket;
};

export const getSocketInstance = () => {
  return socket;
};

// Ensure socket is connected
export const ensureSocketConnected = () => {
  if (!socket) {
    console.log('[Socket Config] Socket not initialized, initializing now');
    return initializeSocket();
  }
  
  if (!socket.connected) {
    console.log('[Socket Config] Socket disconnected, connecting now');
    socket.connect();
  }
  
  return socket;
};

export { socket }; 