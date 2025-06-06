import axios from "axios";
import { API_URL } from "../config/api";
import axiosInstance from "../config/axiosInstance";
import { getSocket } from "../services/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";

const chatService = {
  // Get messages for a conversation
  getMessages: async (conversationId) => {
    try {
      const response = await axiosInstance.get(`/message/${conversationId}`);
      if (!response.data) {
        throw new Error("Invalid response format");
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch messages"
        );
      } else if (error.request) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error(error.message || "Failed to fetch messages");
      }
    }
  },

  // Send a new message
  sendMessage: async (conversationId, message) => {
    try {
      const formData = new FormData();
      formData.append("content", message.content || "");
      // Add replyTo if it exists in message
      if (message.replyTo) {
        formData.append("replyTo", message.replyTo);
      }

      // Nếu có file đính kèm thì thêm vào
      if (message.file) {
        formData.append("file", {
          uri: message.file.uri,
          type: message.file.type,
          name: message.file.name || "file",
        });
      }

      // Lấy token từ AsyncStorage
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) throw new Error("User not logged in");
      const token = JSON.parse(userData).token;

      const response = await axios.post(
        `${API_URL}/message/send-message/${conversationId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data) throw new Error("Invalid response");

      // Emit socket sau khi gửi thành công
      const socket = getSocket();
      if (socket) {
        socket.emit("privateMessage", {
          conversationId,
          message: response.data,
        });
      }

      return response.data;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw new Error(
        error.response?.data?.message || "Failed to send message"
      );
    }
  },

  // Send a message with file (image/document)
  sendMessageWithFile: async (conversationId, messageData, file) => {
    try {
      const formData = new FormData();
      formData.append("content", messageData.content || "");
      formData.append("type", messageData.type || "TEXT");
      formData.append("sender", messageData.sender);
      // Add replyTo if it exists in messageData
      if (messageData.replyTo) {
        formData.append("replyTo", messageData.replyTo);
      }

      if (file) {
        const fileName =
          file.name || file.fileName || file.uri.split("/").pop();
        const fileType = file.type || "image/jpeg";

        console.log("Preparing to send file with properties:", {
          uri: file.uri,
          type: fileType,
          name: fileName,
        });

        formData.append("files", {
          uri: file.uri,
          type: fileType,
          name: fileName,
        });
      }

      console.log("Sending formData:", Object.fromEntries(formData._parts));

      const userData = await AsyncStorage.getItem("userData");
      const token = userData ? JSON.parse(userData).token : null;

      const response = await axiosInstance.post(
        `/message/send-message/${conversationId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000,
        }
      );

      console.log("API response:", response.data);

      if (!response.data) {
        throw new Error("Invalid response format");
      }

      const socket = getSocket();
      if (socket) {
        socket.emit("sendMessage", {
          conversationId,
          message: response.data,
          senderId: messageData.sender,
        });
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error sending message with file:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get conversation list
  getConversations: async () => {
    try {
      // Get user data from AsyncStorage
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        throw new Error("User data not found");
      }
      const parsedUserData = JSON.parse(userData);
      const userId = parsedUserData?._id || parsedUserData?.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      console.log("Fetching conversations for user ID:", userId);

      const response = await axiosInstance.get("/conversation/my-conversation");
      if (!response.data) {
        throw new Error("Invalid response format");
      }

      const conversations = response.data.data.map((conv) => ({
        _id: conv._id,
        name: conv.name || "Unknown",
        avatar: conv.avatar || null,
        lastMessage: conv.lastMessage || null,
        participants: conv.participants || [],
        unread: conv.unread || false,
        updatedAt: conv.updatedAt || new Date().toISOString(),
        type: conv.type || "private",
      }));

      return conversations;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch conversations"
        );
      } else if (error.request) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error(error.message || "Failed to fetch conversations");
      }
    }
  },

  // Create a new conversation
  createConversation: async (participants) => {
    try {
      const response = await axios.post(`${API_URL}/chat/conversations`, {
        participants,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating conversation:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Create a new group conversation
  createGroup: async (groupData, file) => {
    try {
      console.log("Creating group with data:", groupData);

      const formData = new FormData();
      formData.append("name", groupData.name);

      // Add all member IDs to the request
      if (groupData.members && groupData.members.length > 0) {
        groupData.members.forEach((memberId) => {
          formData.append("members", memberId);
        });
      }

      // Append file if provided
      if (file) {
        const fileName =
          file.name || file.fileName || file.uri.split("/").pop();
        const fileType = file.type || "image/jpeg";

        formData.append("file", {
          uri: file.uri,
          type: fileType,
          name: fileName,
        });
      }

      console.log(
        "Sending formData:",
        JSON.stringify(Object.fromEntries(formData._parts))
      );

      const response = await axiosInstance.post("/conversation", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Group creation response:", response.data);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error creating group:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Update conversation
  updateConversation: async (conversationId, updateData) => {
    try {
      const response = await axios.put(
        `${API_URL}/chat/conversations/${conversationId}`,
        updateData
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating conversation:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/chat/conversations/${conversationId}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting conversation:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Lấy danh sách cuộc trò chuyện
  getMyConversations: async () => {
    try {
      const response = await axiosInstance.get("/conversation/my-conversation");
      return response.data;
    } catch (error) {
      console.error(
        "Error in getMyConversations:",
        error.response?.data || error.message
      );
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
      console.error(
        "Error in getMessagesByConversation:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Cập nhật tin nhắn
  updateMessage: async (messageId, message) => {
    try {
      const cleanMessageId = String(messageId)
        .replace(/ObjectId\(['"](.+)['"]\)/, "$1")
        .trim();
      const response = await axiosInstance.put(
        `/message/${cleanMessageId}`,
        message
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error in updateMessage:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Get newest messages for a conversation
  getNewestMessages: async (conversationId) => {
    try {
      const cleanConversationId = String(conversationId)
        .replace(/ObjectId\(['"](.+)['"]\)/, "$1")
        .trim();
      const response = await axiosInstance.get(
        `/message/newest/${cleanConversationId}`
      );
      if (!response.data) {
        throw new Error("Invalid response format");
      }
      return response.data;
    } catch (error) {
      console.error("Error in getNewestMessages:", error);
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch newest messages"
        );
      } else if (error.request) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error(error.message || "Failed to fetch newest messages");
      }
    }
  },

  // Mark message as read
  markMessageAsRead: async (conversationId) => {
    try {
      const socket = getSocket();
      if (socket) {
        socket.emit("markRead", {
          conversationId,
          userId: await AsyncStorage.getItem("userId"),
        });
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  },

  // Xóa tin nhắn (chỉ người gửi mới có quyền xóa)
  revokeMessage: async (messageId) => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) throw new Error("User not authenticated");

      const response = await axiosInstance.patch(
        `/message/${messageId}/revoke-self`
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error revoking message:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Xóa tin nhắn cho tất cả người dùng trong cuộc trò chuyện
  revokeMessageForAll: async (messageId, conversationId) => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) throw new Error("User not authenticated");

      const response = await axiosInstance.patch(
        `/message/${messageId}/revoke-both/${conversationId}`
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error revoking message for all:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Chuyển tiếp tin nhắn
  forwardMessage: async (data) => {
    try {
      console.log("Forward message input:", data);

      // Ensure we have the required fields
      if (
        !data.originalMessageId ||
        !data.conversationIds ||
        !Array.isArray(data.conversationIds)
      ) {
        throw new Error(
          "Missing required fields: originalMessageId and conversationIds array"
        );
      }

      // Extract just the ID string from any object structure
      const getCleanId = (value) => {
        if (!value) return null;

        // If it's a string, clean it directly
        if (typeof value === "string") {
          return value.replace(/ObjectId\(['"](.+)['"]\)/, "$1").trim();
        }

        // If it has _id property, use that
        if (value._id) {
          return typeof value._id === "string"
            ? value._id.replace(/ObjectId\(['"](.+)['"]\)/, "$1").trim()
            : String(value._id);
        }

        // If it's an object but doesn't have _id, stringify it
        return String(value)
          .replace(/ObjectId\(['"](.+)['"]\)/, "$1")
          .trim();
      };

      // Clean the original message ID
      const cleanOriginalMessageId = getCleanId(data.originalMessageId);

      // Clean the conversation IDs
      const cleanConversationIds = data.conversationIds
        .map((conv) => getCleanId(conv))
        .filter(Boolean);

      if (!cleanOriginalMessageId || cleanConversationIds.length === 0) {
        throw new Error("Invalid ID format provided");
      }

      // Get the current user data from AsyncStorage
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        throw new Error("User not authenticated");
      }

      const currentUser = JSON.parse(userData);
      const userId = currentUser._id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const requestData = {
        originalMessageId: cleanOriginalMessageId,
        conversationIds: cleanConversationIds,
        userId: userId, // Add the current user's ID
      };

      console.log("Sending forward request with clean data:", requestData);

      // Send the request with only string IDs
      const response = await axiosInstance.patch(
        "/message/forward",
        requestData
      );

      console.log("Forward response success:", response.data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error forwarding message:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        stack: error.stack,
      });

      // Handle specific error cases
      if (error.response?.status === 500) {
        return {
          success: false,
          error: "Server error while forwarding message. Please try again.",
        };
      }

      if (error.response?.status === 404) {
        return {
          success: false,
          error: "Original message not found or has been deleted.",
        };
      }

      if (error.response?.status === 403) {
        return {
          success: false,
          error: "You do not have permission to forward this message.",
        };
      }

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to forward message",
      };
    }
  },

  // Ghim tin nhắn
  pinMessage: async (messageId, conversationId) => {
    try {
      const response = await axiosInstance.patch(`/message/${messageId}/pin`, {
        conversationId,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error pinning message:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Send typing indicator
  sendTypingIndicator: async (conversationId, isTyping) => {
    try {
      const socket = getSocket();
      if (socket) {
        socket.emit(isTyping ? "typing" : "stopTyping", {
          conversationId,
          userId: await AsyncStorage.getItem("userId"),
        });
      }
    } catch (error) {
      console.error("Error sending typing indicator:", error);
    }
  },

  sendMessageWithFiles: async (conversationId, message, files = []) => {
    try {
      const formData = new FormData();

      // Append each file to formData
      files.forEach((file) => {
        formData.append("files", {
          uri: file.uri,
          name: file.name,
          type: file.type,
        });
      });

      formData.append("content", message.content);

      const response = await axiosInstance.post(
        `/message/send-message/${conversationId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error sending message with files:", error);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  },

  revokeMessageBoth: async (messageId, conversationId) => {
    try {
      const response = await axiosInstance.patch(
        `/message/${messageId}/revoke-both`
      );
      return response.data;
    } catch (error) {
      console.error("Error revoking message:", error);
      throw error;
    }
  },

  deleteMessageForMe: async (messageId) => {
    try {
      const response = await axiosInstance.patch(
        `/message/${messageId}/revoke-self`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting message for me:", error);
      throw error;
    }
  },

  // Search users for adding to group
  searchUsers: async (searchQuery) => {
    try {
      const response = await axiosInstance.get(
        `/user/search?q=${encodeURIComponent(searchQuery)}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error searching users:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Add members to group
  addMembersToGroup: async (conversationId, memberIds) => {
    try {
      // Try with a different field name - the backend error suggests it's looking for "newMemberIds"
      console.log("API call: Adding members to group", conversationId);
      console.log("Members to add:", memberIds);

      const response = await axiosInstance.post(
        `/conversation/add-member/${conversationId}`,
        {
          newMemberIds: memberIds,
        }
      );

      console.log("Add members API response:", response.status);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error adding members to group:", error);

      // Log detailed error information
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }

      return {
        success: false,
        error: error.response?.data || error.message || "Failed to add members",
      };
    }
  },

  // Remove member from group
  removeMemberFromGroup: async (conversationId, memberId) => {
    try {
      const response = await axiosInstance.delete(
        `/conversation/remove-member/${conversationId}`,
        {
          data: { memberId },
        }
      );

      if (!response.data) {
        throw new Error("Invalid response format");
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error removing member from group:", error);
      throw new Error(
        error.response?.data?.message || "Failed to remove member"
      );
    }
  },

  // Change member role (promote/demote admin)
  changeRoleMember: async (conversationId, memberId) => {
    try {
      console.log(
        `[chatService] Changing role for member ${memberId} in conversation ${conversationId}`
      );

      const response = await axiosInstance.post(
        `/conversation/change-role/${conversationId}/${memberId}`
      );

      console.log("[chatService] Change role response:", response.data);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("[chatService] Error changing member role:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Change admin role (assign new admin when leaving group)
  changeAdmin: async (conversationId, adminId) => {
    try {
      console.log(
        `[chatService] Changing admin for conversation ${conversationId} to user ${adminId}`
      );
      const response = await axiosInstance.put(
        `/conversation/change-admin/${conversationId}`,
        {
          adminId: adminId,
        }
      );

      if (!response.data) {
        throw new Error("Invalid response format");
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("[chatService] Error changing admin:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Update group information
  updateGroupInfo: async (conversationId, updateData) => {
    try {
      const formData = new FormData();

      if (updateData.name) {
        formData.append("name", updateData.name);
      }

      if (updateData.avatar) {
        const fileName =
          updateData.avatar.name ||
          updateData.avatar.fileName ||
          updateData.avatar.uri.split("/").pop();
        const fileType = updateData.avatar.type || "image/jpeg";

        formData.append("avatar", {
          uri: updateData.avatar.uri,
          type: fileType,
          name: fileName,
        });
      }

      const response = await axiosInstance.patch(
        `/conversation/${conversationId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data) {
        throw new Error("Invalid response format");
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating group info:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update group information"
      );
    }
  },

  // Get group media (images, videos, files)
  getGroupMedia: async (
    conversationId,
    mediaType = "all",
    page = 1,
    limit = 20
  ) => {
    try {
      const response = await axiosInstance.get(
        `/conversation/${conversationId}/media`,
        {
          params: {
            type: mediaType,
            page,
            limit,
          },
        }
      );

      if (!response.data) {
        throw new Error("Invalid response format");
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching group media:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch media");
    }
  },

  // Dissolve group (only for group owner)
  dissolveGroup: async (conversationId) => {
    try {
      console.log(
        `[chatService] Dissolving group conversation ${conversationId}`
      );

      const response = await axiosInstance.delete(
        `/conversation/${conversationId}`
      );

      console.log("[chatService] Dissolve group response:", response.data);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("[chatService] Error dissolving group:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  async reactToMessage(messageId, reaction) {
    try {
      const response = await axiosInstance.put("/message/reaction", {
        messageId,
        reaction,
      });

      if (response.data) {
        // Update via socket for real-time feedback
        const socket = getSocket();
        if (socket) {
          socket.emit("messageReaction", {
            messageId,
            reaction,
          });
        }
        return response.data;
      }
      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Error reacting to message:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  async removeReaction(messageId) {
    try {
      const response = await axiosInstance.put(
        `/message/${messageId}/un-reaction`
      );

      if (response.data) {
        // Update via socket for real-time feedback
        const socket = getSocket();
        if (socket) {
          socket.emit("messageReaction", {
            messageId,
            remove: true,
          });
        }
        return response.data;
      }
      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Error removing reaction:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
  leaveGroup: async (conversationId) => {
    try {
      console.log(`[chatService] Leaving group conversation ${conversationId}`);

      const response = await axiosInstance.post(
        `/conversation/leave/${conversationId}`
      );

      console.log("[chatService] Leave group response:", response.data);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("[chatService] Error leaving group:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Remove a member from a group conversation
  removeMember: async (conversationId, memberId) => {
    try {
      console.log(
        `[chatService] Removing member ${memberId} from conversation ${conversationId}`
      );

      const response = await axiosInstance.delete(
        `/conversation/remove-member/${conversationId}`,
        {
          data: { memberId: memberId },
        }
      );

      console.log("[chatService] Remove member response:", response.data);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("[chatService] Error removing member:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
};

export { chatService };
