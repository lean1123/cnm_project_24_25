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
    
    // Socket configuration optimized for mobile
    const config = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 15000,
      transports: ['websocket', 'polling'],
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

// MESSAGE EVENTS
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

// USER STATUS EVENTS
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

// CONNECTION EVENTS
export const emitLogin = (userId) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Emitting login event for user ${userId}`);
    socket.emit('login', { userId });
  } else {
    console.log(`[Socket] Cannot emit login: socket ${socket ? 'not connected' : 'is null'}`);
  }
};

export const emitJoinConversation = (conversationId, userId) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Joining conversation: ${conversationId}`);
    socket.emit('join', { conversationId, userId });
  }
};

export const emitJoinNewConversation = (conversationId, userId) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Joining new conversation: ${conversationId}`);
    socket.emit('joinNewConversation', { conversationId, userId });
  }
};

// MESSAGE ACTIONS
export const emitSendMessage = (conversationId, user, messageDto, files = []) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Sending message to conversation: ${conversationId}`);
    socket.emit('handleMessage', { conversationId, user, messageDto, files });
  }
};

export const emitDeleteMessage = (message) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Deleting message: ${message._id}`);
    socket.emit('handleDeleteMessage', message);
  }
};

export const emitRevokeMessage = (message) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Revoking message: ${message._id}`);
    socket.emit('handleRevokeMessage', message);
  }
};

export const emitForwardMessage = (messages) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Forwarding ${messages.length} messages`);
    socket.emit('handleForwardMessage', messages);
  }
};

export const emitReactToMessage = (message) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Reacting to message: ${message._id}`);
    socket.emit('handleReactToMessage', message);
  }
};

export const emitUnReactToMessage = (message) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Removing reaction from message: ${message._id}`);
    socket.emit('handleUnReactToMessage', message);
  }
};

// TYPING EVENTS
export const emitTyping = (userId, conversationId) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit('typing', { userId, conversationId });
  }
};

export const emitStopTyping = (userId, conversationId) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit('stopTyping', { userId, conversationId });
  }
};

// CONTACT/FRIEND EVENTS
export const emitSendRequestContact = (receiverId, contact) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Sending friend request to: ${receiverId}`);
    socket.emit('sendRequestContact', { receiverId, contact });
  }
};

export const emitCancelRequestContact = (receiverId, contactId) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Cancelling friend request: ${contactId}`);
    socket.emit('cancelRequestContact', { receiverId, contactId });
  }
};

export const emitRejectRequestContact = (receiverId, name, contactId) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Rejecting friend request: ${contactId}`);
    socket.emit('rejectRequestContact', { receiverId, name, contactId });
  }
};

export const emitAcceptRequestContact = (contact, conversation) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Accepting friend request: ${contact._id}`);
    socket.emit('handleAcceptRequestContact', contact, conversation);
  }
};

// GROUP CONVERSATION EVENTS
export const emitCreateGroupConversation = (conversation) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Creating group conversation: ${conversation._id}`);
    socket.emit('createGroupConversation', conversation);
  }
};

export const emitUpdateConversation = (conversation) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Updating conversation: ${conversation._id}`);
    socket.emit('handleUpdateConversation', conversation);
  }
};

export const emitRemoveMemberFromGroup = (adminRemoveMember) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Removing member ${adminRemoveMember.memberId} from group ${adminRemoveMember.conversationId}`);
    socket.emit('handleRemoveMemberFromConversation', adminRemoveMember);
  }
};

export const emitDeleteConversation = (conversation, adminId) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Deleting conversation: ${conversation._id}`);
    socket.emit('handleDeleteConversation', { conversation, adminId });
  }
};

// CALL EVENTS
export const emitCall = (sender, conversationId, type, isGroup) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] Initiating ${type} call in conversation: ${conversationId}`);
    socket.emit('call', { sender, conversationId, type, isGroup });
  }
};

export const emitJoinCall = (userId, conversationId, isGroup) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] User ${userId} joining call in conversation: ${conversationId}`);
    socket.emit('joinCall', { userId, conversationId, isGroup });
  }
};

export const emitAcceptCall = (userId, conversationId, isGroup) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] User ${userId} accepting call in conversation: ${conversationId}`);
    socket.emit('acceptCall', { userId, conversationId, isGroup });
  }
};

export const emitRejectCall = (userId, conversationId, isGroup) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] User ${userId} rejecting call in conversation: ${conversationId}`);
    socket.emit('rejectCall', { userId, conversationId, isGroup });
  }
};

export const emitEndCall = (userId, conversationId) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] User ${userId} ending call in conversation: ${conversationId}`);
    socket.emit('endCall', { userId, conversationId });
  }
};

export const emitCancelCall = (userId, conversationId, isGroup) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    console.log(`[Socket] User ${userId} cancelling call in conversation: ${conversationId}`);
    socket.emit('cancelCall', { userId, conversationId, isGroup });
  }
};

// COMBINED SUBSCRIPTION
export const subscribeToChatEvents = (callbacks) => {
  const socket = getSocket();
  if (socket) {
    console.log('[Socket] Setting up all chat-related event listeners');
    
    // Conversation events
    if (callbacks.onNewGroupConversation) {
      socket.on('createConversationForGroup', callbacks.onNewGroupConversation);
    }
    if (callbacks.onUpdateConversation) {
      socket.on('updateConversation', callbacks.onUpdateConversation);
    }
    if (callbacks.onRemovedFromGroup) {
      socket.on('removedGroupByAdmin', callbacks.onRemovedFromGroup);
    }
    if (callbacks.onDissolvedGroup) {
      socket.on('dissolvedGroup', callbacks.onDissolvedGroup);
    }
    
    // Message events
    if (callbacks.onNewMessage) {
      socket.on('newMessage', callbacks.onNewMessage);
    }
    if (callbacks.onDeleteMessage) {
      socket.on('deleteMessage', callbacks.onDeleteMessage);
    }
    if (callbacks.onRevokeMessage) {
      socket.on('revokeMessage', callbacks.onRevokeMessage);
    }
    if (callbacks.onReactToMessage) {
      socket.on('reactToMessage', callbacks.onReactToMessage);
    }
    if (callbacks.onUnReactToMessage) {
      socket.on('unReactToMessage', callbacks.onUnReactToMessage);
    }
    
    // Contact events
    if (callbacks.onNewRequestContact) {
      socket.on('newRequestContact', callbacks.onNewRequestContact);
    }
    if (callbacks.onCancelRequestContact) {
      socket.on('cancelRequestContact', callbacks.onCancelRequestContact);
    }
    if (callbacks.onRejectRequestContact) {
      socket.on('rejectRequestContact', callbacks.onRejectRequestContact);
    }
    if (callbacks.onAcceptRequestContact) {
      socket.on('acceptRequestContact', callbacks.onAcceptRequestContact);
    }
    
    // Call events
    if (callbacks.onCall) {
      socket.on('call', callbacks.onCall);
    }
    if (callbacks.onJoinCall) {
      socket.on('joinCall', callbacks.onJoinCall);
    }
    if (callbacks.onAcceptCall) {
      socket.on('acceptCall', callbacks.onAcceptCall);
    }
    if (callbacks.onRejectCall) {
      socket.on('rejectCall', callbacks.onRejectCall);
    }
    if (callbacks.onEndCall) {
      socket.on('endCall', callbacks.onEndCall);
    }
    if (callbacks.onCancelCall) {
      socket.on('cancelCall', callbacks.onCancelCall);
    }
    
    // User status
    if (callbacks.onActiveUsers) {
      socket.on('activeUsers', callbacks.onActiveUsers);
    }
    
    // Typing indicators
    if (callbacks.onTyping) {
      socket.on('typing', callbacks.onTyping);
    }
    if (callbacks.onStopTyping) {
      socket.on('stopTyping', callbacks.onStopTyping);
    }
  }
};

export const unsubscribeFromChatEvents = () => {
  const socket = getSocket();
  if (socket) {
    console.log('[Socket] Removing all chat-related event listeners');
    
    // Conversation events
    socket.off('createConversationForGroup');
    socket.off('updateConversation');
    socket.off('removedGroupByAdmin');
    socket.off('dissolvedGroup');
    
    // Message events
    socket.off('newMessage');
    socket.off('deleteMessage');
    socket.off('revokeMessage');
    socket.off('reactToMessage');
    socket.off('unReactToMessage');
    
    // Contact events
    socket.off('newRequestContact');
    socket.off('cancelRequestContact');
    socket.off('rejectRequestContact');
    socket.off('acceptRequestContact');
    
    // Call events
    socket.off('call');
    socket.off('joinCall');
    socket.off('acceptCall');
    socket.off('rejectCall');
    socket.off('endCall');
    socket.off('cancelCall');
    
    // User status
    socket.off('activeUsers');
    
    // Typing indicators
    socket.off('typing');
    socket.off('stopTyping');
  }
};