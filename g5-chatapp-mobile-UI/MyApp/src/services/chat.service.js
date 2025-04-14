import axios from 'axios';
import { API_URL } from '../config/api';
import axiosInstance from "../config/axiosInstance";
import { getSocket } from "../config/socket";
import AsyncStorage from '@react-native-async-storage/async-storage';

const chatService = {
  // Get messages for a conversation
  getMessages: async (conversationId) => {
    try {
      const response = await axiosInstance.get(`/message/${conversationId}`);
      if (!response.data) {
        throw new Error('Invalid response format');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch messages');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to fetch messages');
      }
    }
  },

  // Send a new message
  sendMessage: async (conversationId, message) => {
    try {
      const formData = new FormData();
      
      // Clean conversationId
      const cleanConversationId = String(conversationId).replace(/ObjectId\(['"](.+)['"]\)/, '$1').trim();
      formData.append("conversationId", cleanConversationId);
      
      // Clean content and type
      formData.append("content", message.content || "");
      formData.append("type", message.type || "TEXT");

      // Get user data from AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        throw new Error('User data not found');
      }
      const parsedUserData = JSON.parse(userData);
      const userId = parsedUserData?._id || parsedUserData?.id;
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Clean and append sender ID
      formData.append("sender", userId);

      // Handle file upload
      if (message.file) {
        formData.append("file", message.file);
      }

      // Send message via API
      const response = await axiosInstance.post(`/message/send-message/${cleanConversationId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data) {
        throw new Error('Invalid response format');
      }

      // Emit socket event for real-time update
      const socket = getSocket();
      if (socket) {
        socket.emit('privateMessage', {
          conversationId: cleanConversationId,
          message: response.data,
          senderId: userId
        });
      }

      return response.data;
    } catch (error) {
      console.error("Error in sendMessage:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to send message');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to send message');
      }
    }
  },

  // Send a message with file (image/document)
  sendMessageWithFile: async (conversationId, messageData, file) => {
    try {
      const formData = new FormData();
      formData.append('content', messageData.content || '');
      formData.append('type', messageData.type);
      formData.append('sender', messageData.sender);
      
      if (file) {
        formData.append('file', {
          uri: file.uri,
          type: file.type,
          name: file.name
        });
      }

      const response = await axios.post(
        `${API_URL}/chat/messages/${conversationId}/file`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error sending message with file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get conversation list
  getConversations: async () => {
    try {
      // Get user data from AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        throw new Error('User data not found');
      }
      const parsedUserData = JSON.parse(userData);
      const userId = parsedUserData?._id || parsedUserData?.id;
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      console.log('Fetching conversations for user ID:', userId);
      
      const response = await axiosInstance.get("/conversation/my-conversation");
      if (!response.data) {
        throw new Error('Invalid response format');
      }

      // Process and normalize conversation data
      const conversations = response.data.data.map(conv => ({
        _id: conv._id,
        name: conv.name || 'Unknown',
        avatar: conv.avatar || null,
        lastMessage: conv.lastMessage || null,
        participants: conv.participants || [],
        unread: conv.unread || false,
        updatedAt: conv.updatedAt || new Date().toISOString(),
        type: conv.type || 'private'
      }));

      return conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch conversations');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to fetch conversations');
      }
    }
  },

  // Create a new conversation
  createConversation: async (participants) => {
    try {
      const response = await axios.post(`${API_URL}/chat/conversations`, { participants });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Update conversation
  updateConversation: async (conversationId, updateData) => {
    try {
      const response = await axios.put(`${API_URL}/chat/conversations/${conversationId}`, updateData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating conversation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    try {
      const response = await axios.delete(`${API_URL}/chat/conversations/${conversationId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Lấy danh sách cuộc trò chuyện
  getMyConversations: async () => {
    try {
      const response = await axiosInstance.get("/conversation/my-conversation");
      return response.data;
    } catch (error) {
      console.error("Error in getMyConversations:", error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy tin nhắn theo cuộc trò chuyện
  getMessagesByConversation: async (conversationId, page = 1, limit = 20) => {
    try {
      const response = await axiosInstance.get(`/message/${conversationId}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error in getMessagesByConversation:", error.response?.data || error.message);
      throw error;
    }
  },

  // Cập nhật tin nhắn
  updateMessage: async (messageId, message) => {
    try {
      const cleanMessageId = String(messageId).replace(/ObjectId\(['"](.+)['"]\)/, '$1').trim();
      const response = await axiosInstance.put(`/message/${cleanMessageId}`, message);
      return response.data;
    } catch (error) {
      console.error("Error in updateMessage:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get newest messages for a conversation
  getNewestMessages: async (conversationId) => {
    try {
      const cleanConversationId = String(conversationId).replace(/ObjectId\(['"](.+)['"]\)/, '$1').trim();
      const response = await axiosInstance.get(`/message/newest/${cleanConversationId}`);
      if (!response.data) {
        throw new Error('Invalid response format');
      }
      return response.data;
    } catch (error) {
      console.error("Error in getNewestMessages:", error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch newest messages');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to fetch newest messages');
      }
    }
  },

  // Mark message as read
  markMessageAsRead: async (conversationId) => {
    try {
      const socket = getSocket();
      if (socket) {
        socket.emit('markRead', {
          conversationId,
          userId: await AsyncStorage.getItem('userId')
        });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  },

  // Send typing indicator
  sendTypingIndicator: async (conversationId, isTyping) => {
    try {
      const socket = getSocket();
      if (socket) {
        socket.emit(isTyping ? 'typing' : 'stopTyping', {
          conversationId,
          userId: await AsyncStorage.getItem('userId')
        });
      }
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }
};

export { chatService };
