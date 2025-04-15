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
}; 