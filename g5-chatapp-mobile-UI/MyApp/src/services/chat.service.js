import axiosInstance from "../config/axiosInstance";

export const chatService = {
  // Lấy danh sách cuộc trò chuyện
  getMyConversations: async () => {
    try {
      const response = await axiosInstance.get("/conversation/my-conversation");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
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
      throw error.response?.data || error;
    }
  },

  // Gửi tin nhắn
  sendMessage: async (conversationId, message, files = []) => {
    try {
      const formData = new FormData();
      formData.append("content", message.content);
      formData.append("type", message.type);
      
      if (files.length > 0) {
        files.forEach((file, index) => {
          formData.append("files", {
            uri: file.uri,
            type: file.type,
            name: file.name,
          });
        });
      }

      const response = await axiosInstance.post(
        `/message/send-message/${conversationId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cập nhật tin nhắn
  updateMessage: async (messageId, message) => {
    try {
      const response = await axiosInstance.put(`/message/${messageId}`, message);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy tin nhắn mới nhất
  getNewestMessages: async (conversationId) => {
    try {
      const response = await axiosInstance.get(`/message/newest/${conversationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
}; 