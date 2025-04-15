import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000;

const checkInternetConnection = async () => {
  try {
    const netInfo = await NetInfo.fetch();
    console.log('Network state:', {
      isConnected: netInfo.isConnected,
      isInternetReachable: netInfo.isInternetReachable,
      type: netInfo.type,
      details: netInfo.details
    });
    
    // Consider connection valid if either isConnected is true or we're on wifi/cellular
    return netInfo.isConnected || ['wifi', 'cellular'].includes(netInfo.type);
  } catch (error) {
    console.error('Error checking internet connection:', error);
    // If we can't check connection, assume it's available
    return true;
  }
};

export const initSocket = async (userId) => {
  try {
    console.log('Initializing socket for user:', userId);
    console.log('Socket URL:', SOCKET_URL);

    // Check internet connection first
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      console.log('Network check failed - attempting connection anyway');
    }

    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token found');
    }
    console.log('Token available for socket connection');

    // Close existing socket if any
    if (socket) {
      console.log('Closing existing socket connection');
      socket.close();
      socket = null;
    }

    // Configure socket for ngrok
    socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      query: {
        userId: userId
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: RECONNECT_INTERVAL,
      timeout: 20000,
      forceNew: true,
      path: '/socket.io',
      withCredentials: true,
      extraHeaders: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    console.log('Socket instance created with config:', {
      url: SOCKET_URL,
      transports: socket.io.opts.transports,
      path: socket.io.opts.path
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully');
      console.log('Transport used:', socket.io.engine.transport.name);
      console.log('Socket ID:', socket.id);
      reconnectAttempts = 0;
      
      // Emit setup event after successful connection
      socket.emit('setup', userId);
    });

    socket.on('connect_error', async (error) => {
      console.error('Socket connection error:', error.message);
      console.error('Error details:', error);
      
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`Attempting reconnection ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
        
        // Try switching transport method
        if (socket.io.engine.transport.name === 'websocket') {
          console.log('Switching to polling transport');
          socket.io.opts.transports = ['polling'];
        }
        
        // Check token validity
        const newToken = await AsyncStorage.getItem('userToken');
        if (newToken && newToken !== token) {
          console.log('Token updated, using new token for reconnection');
          socket.auth.token = newToken;
          socket.io.opts.extraHeaders['Authorization'] = `Bearer ${newToken}`;
        }
        
        setTimeout(async () => {
          try {
            console.log('Attempting to reconnect...');
            socket.connect();
          } catch (err) {
            console.error('Reconnection attempt failed:', err);
          }
        }, RECONNECT_INTERVAL);
      } else {
        console.error('Max reconnection attempts reached');
        disconnectSocket();
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Attempt initial connection
    console.log('Attempting initial socket connection...');
    socket.connect();

    return socket;
  } catch (error) {
    console.error('Error initializing socket:', error);
    // Try to connect anyway if it's just the internet check that failed
    if (error.message === 'No internet connection') {
      console.log('Attempting socket connection despite internet check failure');
      return initSocket(userId);
    }
    return null;
  }
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const reconnectSocket = async () => {
  if (socket) {
    socket.connect();
  } else {
    const userId = await AsyncStorage.getItem('userId');
    if (userId) {
      await initSocket(userId);
    }
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