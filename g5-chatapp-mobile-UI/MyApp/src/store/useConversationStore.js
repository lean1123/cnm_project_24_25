import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { io } from 'socket.io-client';

/**
 * Store for managing conversations state
 */
const useConversationStore = create(
  persist(
    (set, get) => ({
      conversations: [],
      selectedConversation: null,
      userSelected: null,
      isLoading: false,
      error: null,
      messages: [],
      messagesTemp: [],
      isLoadingMessages: false,
      isLoadingSendMessage: false,
      errorSendMessage: null,
      isSuccessSendMessage: false,

      // Conversation actions
      addConversation: (conversation) => {
        if (!conversation || !conversation._id) return;

        set((state) => {
          // Check if conversation already exists
          const exists = state.conversations.some(
            (conv) => conv._id === conversation._id
          );
          
          if (exists) return state;
          
          return {
            conversations: [conversation, ...state.conversations],
          };
        });
      },

      updateConversation: (conversation) => {
        if (!conversation || !conversation._id) return;

        set((state) => {
          const updatedConversations = state.conversations.map((conv) =>
            conv._id === conversation._id ? conversation : conv
          );
          
          return {
            conversations: updatedConversations,
            selectedConversation:
              state.selectedConversation?._id === conversation._id
                ? conversation
                : state.selectedConversation,
          };
        });
      },

      removeConversation: (conversationId) => {
        set((state) => {
          const updatedConversations = state.conversations.filter(
            (conv) => conv._id !== conversationId
          );
          
          return {
            conversations: updatedConversations,
            selectedConversation:
              state.selectedConversation?._id === conversationId
                ? null
                : state.selectedConversation,
          };
        });
      },

      removeFromGroup: (conversationId, userId) => {
        set((state) => {
          const conversation = state.conversations.find(
            (conv) => conv._id === conversationId
          );
          
          if (!conversation) return state;
          
          const updatedMembers = conversation.members.filter(
            (member) => member.user._id !== userId
          );
          
          const updatedConversation = {
            ...conversation,
            members: updatedMembers,
          };
          
          return {
            conversations: state.conversations.map((conv) =>
              conv._id === conversationId ? updatedConversation : conv
            ),
          };
        });
      },

      updateLastMessage: (conversationId, message) => {
        if (!conversationId || !message) return;

        set((state) => {
          const conversation = state.conversations.find(
            (conv) => conv._id === conversationId
          );
          
          if (!conversation) return state;
          
          const updatedConversation = {
            ...conversation,
            lastMessage: message,
          };
          
          // Move the conversation with new message to the top
          const otherConversations = state.conversations.filter(
            (conv) => conv._id !== conversationId
          );
          
          return {
            conversations: [updatedConversation, ...otherConversations],
          };
        });
      },

      selectConversation: (conversation) => {
        set({ selectedConversation: conversation });
      },

      fetchConversations: async () => {
        set({ isLoading: true, error: null });
        try {
          // Replace with your API call
          const response = { success: true, data: [] };
          if (response.success) {
            set({ conversations: response.data });
          }
        } catch (error) {
          set({ error: 'Failed to fetch conversations' });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchingUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get(`/users/${userId}`);
          set({ userSelected: data.data });
        } catch (error) {
          set({ error: 'Failed to fetch user' });
        } finally {
          set({ isLoading: false });
        }
      },

      getConversations: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get('/conversation/my-conversation');
          set({ conversations: data.data });
        } catch (error) {
          set({ error: 'Failed to fetch conversations' });
        } finally {
          set({ isLoading: false });
        }
      },

      setSelectedConversation: (conversation) => {
        set({ selectedConversation: conversation });
      },

      getConversation: async (conversationId) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get(`/conversation/${conversationId}`);
          set({ selectedConversation: data.data });
          return data.data;
        } catch (error) {
          set({ error: 'Failed to fetch conversation' });
          return null;
        }
      },

      fetchMessages: async (conversationId) => {
        set({ isLoadingMessages: true, error: null });
        try {
          const { data } = await api.get(`/message/${conversationId}?page=1&limit=20`);
          set({ messages: data.data.data });
        } catch (error) {
          set({ error: 'Failed to fetch messages' });
        } finally {
          set({ isLoadingMessages: false });
        }
      },

      sendMessage: async (message) => {
        set({ isLoadingSendMessage: true, errorSendMessage: null });
        const formData = new FormData();
        formData.append('content', message.content);
        
        if (message.files) {
          message.files.forEach((file) => {
            formData.append('files', {
              uri: file.uri,
              type: file.type,
              name: file.name
            });
          });
        }

        try {
          const { selectedConversation } = get();
          await api.post(`/message/send-message/${selectedConversation?._id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          set({ isSuccessSendMessage: true });
        } catch (error) {
          set({ errorSendMessage: 'Failed to send message' });
        } finally {
          set({ isLoadingSendMessage: false });
        }
      },

      addTempMessage: (message) => {
        set((state) => ({
          messages: [message, ...state.messages],
          messagesTemp: [message, ...state.messagesTemp],
        }));
      },

      removeTempMessage: (messageId) => {
        set((state) => ({
          messages: state.messages.filter((message) => message._id !== messageId),
          messagesTemp: state.messagesTemp.filter((message) => message._id !== messageId),
        }));
      },

      subscribeToNewMessages: () => {
        const socket = io('http://localhost:3000');
        socket.on('newMessage', (message) => {
          set((state) => ({
            messages: [message, ...state.messages.filter((m) => m._id !== 'temp')],
            messagesTemp: state.messagesTemp.filter((m) => m._id !== 'temp'),
            conversations: state.conversations.map((conversation) => {
              if (conversation._id === message.conversation) {
                return {
                  ...conversation,
                  lastMessage: {
                    _id: message._id,
                    sender: message.sender,
                    content: message.content,
                    type: message.type,
                    files: message.files,
                  },
                };
              }
              return conversation;
            }),
          }));
        });
      },

      unsubscribeFromNewMessages: () => {
        const socket = io('http://localhost:3000');
        socket.off('newMessage');
      },
    }),
    {
      name: 'conversation-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useConversationStore; 