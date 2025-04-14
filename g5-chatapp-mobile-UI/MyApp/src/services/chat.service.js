import axios from 'axios';
import { API_URL } from '../config/api';
import axiosInstance from "../config/axiosInstance";

const chatService = {
  // Get messages for a conversation
  getMessages: async (conversationId) => {
    try {
      const response = await axios.get(`${API_URL}/chat/messages/${conversationId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Send a new message
  sendMessage: async (conversationId, messageData) => {
    try {
      const response = await axios.post(`${API_URL}/chat/messages/${conversationId}`, messageData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error.message
      };
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
      const response = await axios.get(`${API_URL}/chat/conversations`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return {
        success: false,
        error: error.message
      };
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

  // Gửi tin nhắn
  sendMessage: async (conversationId, message) => {
    try {
      const formData = new FormData();
      
      // Clean conversationId
      const cleanConversationId = String(conversationId).replace(/ObjectId\(['"](.+)['"]\)/, '$1').trim();
      formData.append("conversationId", cleanConversationId);
      
      // Clean content and type
      formData.append("content", message.content || "");
      formData.append("type", message.type || "TEXT");

      // Clean and append sender ID
      if (message.sender) {
        const cleanSenderId = String(message.sender).replace(/ObjectId\(['"](.+)['"]\)/, '$1').trim();
        formData.append("sender", cleanSenderId);
      }

      // Handle file upload
      if (message.file) {
        formData.append("file", message.file);
      }

      const response = await axiosInstance.post(`/message/send-message/${cleanConversationId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // BE luôn trả về message object trong response.data
      return response.data;
    } catch (error) {
      console.error("Error in sendMessage:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
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

  // Lấy tin nhắn mới nhất
  getNewestMessages: async (conversationId) => {
    try {
      const cleanConversationId = String(conversationId).replace(/ObjectId\(['"](.+)['"]\)/, '$1').trim();
      const response = await axiosInstance.get(`/message/newest/${cleanConversationId}`);
      return response.data;
    } catch (error) {
      console.error("Error in getNewestMessages:", error.response?.data || error.message);
      throw error;
    }
  }
};

export { chatService };
