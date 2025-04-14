import axiosInstance from "../config/axiosInstance";

export const chatService = {
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
  },
};
