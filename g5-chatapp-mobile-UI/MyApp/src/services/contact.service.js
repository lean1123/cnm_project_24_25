import axiosInstance from "../config/axiosInstance";

export const contactService = {
  // Tạo yêu cầu kết bạn
  createContact: async (receiverId) => {
    try {
      const response = await axiosInstance.post("/contact", {
        contactId: receiverId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Chấp nhận yêu cầu kết bạn
  acceptContact: async (contactId) => {
    try {
      const response = await axiosInstance.post(`/contact/accept/${contactId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Từ chối yêu cầu kết bạn
  rejectContact: async (contactId) => {
    try {
      const response = await axiosInstance.post(`/contact/reject/${contactId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Hủy yêu cầu kết bạn
  cancelContact: async (contactId) => {
    try {
      const response = await axiosInstance.post(`/contact/cancel/${contactId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy danh sách bạn bè
  getMyContacts: async () => {
    try {
      const response = await axiosInstance.get("/contact/my-contact");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy danh sách yêu cầu kết bạn đã gửi
  getMyRequestContacts: async () => {
    try {
      const response = await axiosInstance.get("/contact/get-my-request-contact");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy danh sách yêu cầu kết bạn đang chờ
  getMyPendingContacts: async () => {
    try {
      const response = await axiosInstance.get("/contact/get-my-pending-contact");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy hủy lời kết bạn đã gửi
  cancelPendingContact: async (contactId) => {
    try {
      // Use the same pattern as cancelContact (POST instead of DELETE)
      console.log(`Cancelling pending contact with ID: ${contactId}`);
      const response = await axiosInstance.post(`/contact/cancel/${contactId}`);
      return response.data;
    } catch (error) {
      console.error("Error cancelling pending contact:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  // Xóa bạn bè
  deleteContact: async (contactId) => {
    try {
      const response = await axiosInstance.delete(`/contact/${contactId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  // Lấy cuộc trò chuyện với một người dùng cụ thể
  getConversationWithUser: async (userId) => {
    try {
      console.log(`[ContactService] Getting conversation with user: ${userId}`);
      
      // First try to get the contact relationship
      const contactResponse = await axiosInstance.get("/contact/my-contact");
      
      if (contactResponse.data && contactResponse.data.success) {
        // Find the contact with this user
        const contact = contactResponse.data.data.find(
          c => (c.user && c.user._id === userId) || (c.contact && c.contact._id === userId)
        );
        
        if (contact && contact.conversation) {
          console.log(`[ContactService] Found conversation ID in contact: ${contact.conversation}`);
          
          // If we have a conversation ID in the contact, use it to get conversation details
          try {
            const conversationResponse = await axiosInstance.get(`/conversation/${contact.conversation}`);
            
            if (conversationResponse.data && conversationResponse.data.success) {
              return {
                success: true,
                data: conversationResponse.data.data
              };
            }
          } catch (error) {
            console.log(`[ContactService] Error fetching conversation ${contact.conversation}:`, error.message);
            // Continue to fallback methods if this fails
          }
        }
      }
      
      // Fallback to getting all conversations and finding the one with this user
      console.log(`[ContactService] Searching through all conversations for user: ${userId}`);
      const allConversationsResponse = await axiosInstance.get("/conversation/my-conversation");
      
      if (allConversationsResponse.data && allConversationsResponse.data.success) {
        const conversations = allConversationsResponse.data.data;
        
        // Find a direct conversation with this user (not a group)
        const targetConversation = conversations.find(conv => {
          if (conv.isGroup) return false; // Skip group conversations
          
          // Check if the conversation includes the target user
          return conv.members && conv.members.some(member => 
            (member.user && member.user._id === userId) || member._id === userId
          );
        });
        
        if (targetConversation) {
          console.log(`[ContactService] Found conversation in all conversations: ${targetConversation._id}`);
          return {
            success: true,
            data: targetConversation
          };
        }
      }
      
      // If no existing conversation is found, return a failure
      console.log(`[ContactService] No conversation found with user: ${userId}`);
      return { 
        success: false, 
        message: "No existing conversation found with this user" 
      };
    } catch (error) {
      console.error("Error getting conversation with user:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to get conversation" 
      };
    }
  },
}; 