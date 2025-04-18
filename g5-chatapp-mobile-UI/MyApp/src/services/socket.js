import { io } from 'socket.io-client';
import { SOCKET_URL, API_URL } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    initSocket();
  }
  return socket;
};

export const initSocket = async () => {
  try {
    console.log(`[Socket] Initializing socket at: ${SOCKET_URL} (${Platform.OS})`);
    
    // Get user token
    const userData = await AsyncStorage.getItem('userData');
    const user = userData ? JSON.parse(userData) : null;
    
    if (!user) {
      console.log('[Socket] No user found, socket initialization postponed');
      return null;
    }
    
    console.log(`[Socket] Found user: ${user._id}`);
    
    // Disconnect existing socket if any
    if (socket) {
      console.log('[Socket] Disconnecting existing socket');
      socket.disconnect();
      socket = null;
    }
    
    // Simple socket configuration similar to web version but optimized for iOS
    const config = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 15000,
      transports: ['websocket', 'polling'], // iOS prefers websocket, but allow fallback
      forceNew: true
    };
    
    console.log('[Socket] Creating socket with config:', JSON.stringify(config));
    socket = io(SOCKET_URL, config);
    
    // Setup basic events
    socket.on("connect", () => {
      console.log(`[Socket] Connected with ID: ${socket.id}`);
      console.log(`[Socket] Using transport: ${socket.io?.engine?.transport?.name || 'unknown'}`);
      
      // Login upon successful connection
      if (user._id) {
        console.log(`[Socket] Emitting login event for user ${user._id}`);
        socket.emit("login", { userId: user._id });
      }
    });
    
    socket.on("connect_error", (error) => {
      console.log(`[Socket] Connection error: ${error.message}`);
      
      // iOS specific recommendation
      if (Platform.OS === 'ios') {
        console.log('[Socket] On iOS, check that:');
        console.log('1. Your backend allows connections from all origins (CORS)');
        console.log('2. Your backend IP is correctly set and accessible from your iOS device');
        console.log('3. Your backend and iOS device are on the same network');
      }
    });
    
    socket.on("disconnect", (reason) => {
      console.log(`[Socket] Disconnected: ${reason}`);
    });
    
    socket.on("error", (error) => {
      console.log(`[Socket] Error: ${error}`);
    });
    
    console.log('[Socket] Initialization completed');
    return socket;
  } catch (error) {
    console.error('[Socket] Error initializing socket:', error);
    return null;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('[Socket] Disconnecting socket');
    socket.disconnect();
    socket = null;
  }
};

export const reconnectSocket = async () => {
  console.log('[Socket] Reconnecting socket');
  disconnectSocket();
  return initSocket();
};

// Simple socket events functions
export const subscribeToMessages = (callback) => {
  const socket = getSocket();
  if (socket) {
    console.log('[Socket] Subscribing to newMessage events');
    socket.on('newMessage', callback);
  }
};

export const unsubscribeFromMessages = () => {
  const socket = getSocket();
  if (socket) {
    console.log('[Socket] Unsubscribing from newMessage events');
    socket.off('newMessage');
  }
};

export const subscribeToActiveUsers = (callback) => {
  const socket = getSocket();
  if (socket) {
    console.log('[Socket] Subscribing to activeUsers events');
    socket.on('activeUsers', callback);
  }
};

export const unsubscribeFromActiveUsers = () => {
  const socket = getSocket();
  if (socket) {
    console.log('[Socket] Unsubscribing from activeUsers events');
    socket.off('activeUsers');
  }
};

export const emitLogin = (userId) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Emitting login event for user ${userId}`);
    socket.emit('login', { userId });
  } else {
    console.log(`[Socket] Cannot emit login: socket ${socket ? 'not connected' : 'is null'}`);
  }
};

export const emitJoinConversation = (conversationId) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Joining conversation: ${conversationId}`);
    socket.emit('join', { conversationId });
  }
};

export const emitLeaveConversation = (conversationId) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Leaving conversation: ${conversationId}`);
    socket.emit('leave', { conversationId });
  }
};