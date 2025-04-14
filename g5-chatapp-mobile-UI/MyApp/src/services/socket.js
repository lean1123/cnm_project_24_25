import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

let socket = null;

export const initSocket = async () => {
  if (socket) return socket;

  const token = await AsyncStorage.getItem('accessToken');
  
  socket = io(API_URL, {
    autoConnect: true,
    reconnection: true,
    auth: {
      token: `Bearer ${token}`,
    },
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToMessages = (callback) => {
  const socket = getSocket();
  socket.on('newMessage', callback);
};

export const unsubscribeFromMessages = () => {
  const socket = getSocket();
  socket.off('newMessage');
};

export const subscribeToActiveUsers = (callback) => {
  const socket = getSocket();
  socket.on('activeUsers', callback);
};

export const unsubscribeFromActiveUsers = () => {
  const socket = getSocket();
  socket.off('activeUsers');
};

export const emitLogin = (userId) => {
  const socket = getSocket();
  socket.emit('login', { userId });
};

export const emitJoinConversation = (conversationId) => {
  const socket = getSocket();
  socket.emit('join', { conversationId });
};

export const emitLeaveConversation = (conversationId) => {
  const socket = getSocket();
  socket.emit('leave', { conversationId });
};