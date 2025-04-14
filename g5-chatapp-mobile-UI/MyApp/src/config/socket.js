import { io } from 'socket.io-client';
import { API_URL } from './constants';

// Tạo instance của socket với các config cần thiết
const socket = io(API_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  autoConnect: true,
  forceNew: false
});

// Debug socket connection
socket.on('connect', () => {
  console.log('Socket connected with ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

// Đảm bảo socket luôn được kết nối
if (!socket.connected) {
  socket.connect();
}

export { socket }; 