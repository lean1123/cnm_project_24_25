import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService } from '../services/chat.service';
import { getSocket, initSocket } from '../config/socket';

/**
 * Store for managing chat messages state
 */
const useChatStore = create(
  persist(
    (set, get) => ({
      messages: {},
      typingUsers: {},

      // Message actions
      addMessage: (message) => {
        if (!message || !message.conversation) return;

        set((state) => {
          const conversationId = message.conversation;
          const conversationMessages = state.messages[conversationId] || [];
          
          // Check if message already exists to avoid duplicates
          const messageExists = conversationMessages.some(
            (msg) => msg._id === message._id
          );
          
          if (messageExists) return state;
          
          return {
            messages: {
              ...state.messages,
              [conversationId]: [...conversationMessages, message],
            },
          };
        });
      },

      updateMessage: (message) => {
        if (!message || !message.conversation) return;

        set((state) => {
          const conversationId = message.conversation;
          const conversationMessages = state.messages[conversationId] || [];
          
          const updatedMessages = conversationMessages.map((msg) =>
            msg._id === message._id ? message : msg
          );
          
          return {
            messages: {
              ...state.messages,
              [conversationId]: updatedMessages,
            },
          };
        });
      },

      deleteMessage: (message) => {
        if (!message || !message.conversation) return;

        set((state) => {
          const conversationId = message.conversation;
          const conversationMessages = state.messages[conversationId] || [];
          
          const updatedMessages = conversationMessages.filter(
            (msg) => msg._id !== message._id
          );
          
          return {
            messages: {
              ...state.messages,
              [conversationId]: updatedMessages,
            },
          };
        });
      },

      clearMessages: (conversationId) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [],
          },
        }));
      },

      // Typing indicator actions
      setTyping: (conversationId, userId) => {
        set((state) => {
          const typingUsersInConvo = state.typingUsers[conversationId] || [];
          
          if (!typingUsersInConvo.includes(userId)) {
            return {
              typingUsers: {
                ...state.typingUsers,
                [conversationId]: [...typingUsersInConvo, userId],
              },
            };
          }
          
          return state;
        });
      },

      clearTyping: (conversationId, userId) => {
        set((state) => {
          const typingUsersInConvo = state.typingUsers[conversationId] || [];
          
          return {
            typingUsers: {
              ...state.typingUsers,
              [conversationId]: typingUsersInConvo.filter((id) => id !== userId),
            },
          };
        });
      },

      // State
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

      addTempMessage: (message) => {
        set(state => ({ tempMessages: [...state.tempMessages, message] }));
      },

      removeTempMessage: (messageId) => {
        set(state => ({
          tempMessages: state.tempMessages.filter(m => m._id !== messageId)
        }));
      },

      markMessageAsError: (messageId) => {
        set(state => ({
          tempMessages: state.tempMessages.map(m => 
            m._id === messageId ? { ...m, status: 'error' } : m
          )
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
        set({ isOnline: isOnline });
      },

      // Clear actions
      clearTempMessages: () => set({ tempMessages: [] }),

      // Reset entire store
      reset: () => set({
        messages: {},
        tempMessages: [],
        isLoadingMessages: false,
        isSendingMessage: false,
        isOnline: false
      }),

      // API Actions
      fetchMessages: async (conversationId) => {
        set({ isLoadingMessages: true });
        try {
          const response = await chatService.getMessages(conversationId);
          if (response?.success) {
            set({ messages: { ...get().messages, [conversationId]: response.data } });
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
            try {
              const socket = getSocket();
              if (socket) {
                socket.emit('new-message', {
                  message: response.data,
                  conversationId,
                  sender: currentUserId
                });
              }
            } catch (error) {
              console.error('Error emitting socket event:', error);
            }
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
          const messageExists = messages[currentConversationId].some(msg => msg._id === message._id);
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
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useChatStore;
