import { create } from 'zustand';
import { chatService } from '../services/chat.service';
import { socket } from '../config/socket';

export const useChatStore = create((set, get) => ({
  // State
  messages: [],
  tempMessages: [],
  isLoadingMessages: false,
  errorMessages: null,
  isSendingMessage: false,
  errorSendMessage: null,
  isSuccessSendMessage: false,
  isOnline: false,
  currentConversationId: null,
  currentUserId: null,

  // Actions
  setCurrentConversation: (conversationId) => set({ currentConversationId: conversationId }),
  setCurrentUser: (userId) => set({ currentUserId: userId }),

  // Message Actions
  addMessage: (message) => {
    set((state) => ({
      messages: [message, ...state.messages],
    }));
  },

  addTempMessage: (message) => {
    set((state) => ({
      messages: [message, ...state.messages],
      tempMessages: [message, ...state.tempMessages],
    }));
  },

  removeTempMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg._id !== messageId),
      tempMessages: state.tempMessages.filter((msg) => msg._id !== messageId),
    }));
  },

  markMessageAsError: (messageId) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId ? { ...msg, isError: true } : msg
      ),
      tempMessages: state.tempMessages.map((msg) =>
        msg._id === messageId ? { ...msg, isError: true } : msg
      ),
    }));
  },

  // Loading States
  setLoadingMessages: (isLoading) => {
    set({ isLoadingMessages: isLoading });
  },

  setSendingMessage: (isSending) => {
    set({ isSendingMessage: isSending });
  },

  // Online Status
  setIsOnline: (isOnline) => {
    set({ isOnline });
  },

  // Reset State
  resetState: () => {
    set({
      messages: [],
      tempMessages: [],
      isLoadingMessages: false,
      isSendingMessage: false,
      isOnline: false,
    });
  },

  // API Actions
  fetchMessages: async (conversationId) => {
    set({ isLoadingMessages: true });
    try {
      const response = await chatService.getMessages(conversationId);
      if (response?.success) {
        set({ messages: response.data });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (conversationId, messageData) => {
    const { currentUserId } = get();
    set({ isSendingMessage: true });

    try {
      // Create temporary message
      const tempId = messageData._id;
      const tempMessage = {
        _id: tempId,
        content: messageData.content,
        type: messageData.type,
        sender: currentUserId,
        conversation: conversationId,
        createdAt: new Date().toISOString(),
        isTemp: true,
        status: 'sending'
      };

      // Add temp message immediately
      get().addTempMessage(tempMessage);

      // Send to server
      const response = await chatService.sendMessage(conversationId, {
        content: messageData.content,
        type: messageData.type,
        sender: currentUserId
      });

      if (response?.success) {
        // Remove temp message and add real message
        get().removeTempMessage(tempId);
        get().addMessage({
          ...response.data,
          status: 'sent'
        });

        // Emit socket event
        socket.emit('new-message', {
          message: response.data,
          conversationId,
          sender: currentUserId
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      get().markMessageAsError(messageData._id);
      throw error;
    } finally {
      set({ isSendingMessage: false });
    }
  },

  // Socket Handlers
  handleNewMessage: (data) => {
    const { messages, currentConversationId } = get();
    const message = data?.message || data;
    
    if (!message || !message._id) {
      console.log('Invalid message data received:', data);
      return;
    }

    // Check if message belongs to current conversation
    if (message.conversation === currentConversationId) {
      // Check if message already exists
      const messageExists = messages.some(msg => msg._id === message._id);
      if (!messageExists) {
        get().addMessage({
          ...message,
          status: 'received'
        });
      }
    }
  },

  handleOnlineStatus: (data) => {
    const { currentUserId } = get();
    if (data.userId && data.userId !== currentUserId) {
      set({ isOnline: data.isOnline });
    }
  },

  // Socket Setup
  setupSocketListeners: (conversationId, userId) => {
    set({ currentConversationId: conversationId, currentUserId: userId });

    // Join conversation room
    socket.emit('join-conversation', { conversationId, userId });

    // Set up listeners
    socket.on('new-message', get().handleNewMessage);
    socket.on('user-online', get().handleOnlineStatus);
    socket.on('user-offline', get().handleOnlineStatus);

    // Set up ping interval to maintain connection
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
    };
  },

  cleanupSocketListeners: (conversationId, userId) => {
    // Leave conversation room
    socket.emit('leave-conversation', { conversationId, userId });

    // Remove listeners
    socket.off('new-message', get().handleNewMessage);
    socket.off('user-online', get().handleOnlineStatus);
    socket.off('user-offline', get().handleOnlineStatus);
  }
})); 