// services/userService.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../config/api";

{/* search users */}
export const searchUsers = async (keyword) => {
  try {
    const response = await api.get(`/users/search?keyword=${keyword}`);
    if (response.data.success) {
      return {
        ok: true,
        data: response.data.data || []
      };
    }
    return {
      ok: false,
      message: response.data.message || "Failed to search users"
    };
  } catch (error) {
    console.error("Search users error:", error);
    return {
      ok: false,
      message: error.response?.data?.message || error.message || "Failed to search users"
    };
  }
};

{/* get Profile User */}
export const getUserProfile = async () => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return { ok: false, message: "No userId found" };

    const response = await api.get(`/users/${userId}`);
    if (!response.data) return { ok: false, message: "No data received from server" };

    const userData = response.data;
    return {
      ok: true,
      data: {
        firstName: userData.firstName || userData.first_name || "",
        lastName: userData.lastName || userData.last_name || "",
        email: userData.email || "",
        gender: userData.gender || "",
        role: Array.isArray(userData.role) ? userData.role : (userData.role ? [userData.role] : []),
        avatar: userData.avatar || null
      }
    };
  } catch (error) {
    console.error("Get user profile error:", error);
    return {
      ok: false,
      message: error.response?.data?.message || error.message || "Failed to fetch user profile"
    };
  }
};

{/* update Profile User */}
export const updateUserProfile = async (profileData, token) => {
  try {
    if (!token) throw new Error("No token provided");

    const response = await api.put(`/users`, profileData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { ok: true, data: response.data };
  } catch (error) {
    console.error("Update user profile error:", error);
    return {
      ok: false,
      message: error.response?.data?.message || error.message || "Failed to update profile"
    };
  }
};

{/* change avatar */}
export const changeAvatar = async (file, token) => {
  try {
    if (!token) throw new Error("No token provided");

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.type,
      name: file.name,
    });

    // Gửi yêu cầu PUT tới backend để thay đổi avatar
    const response = await api.put("/users/change-avatar", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", // Đảm bảo Content-Type là multipart/form-data
      },
    });

    // Trả về kết quả
    return { ok: true, data: response.data };
  } catch (error) {
    console.error("Change avatar error:", error);

    // Ghi thêm chi tiết lỗi nếu có
    if (error.response) {
      console.error("Response error details:", error.response.data);
      console.error("Response status:", error.response.status);
    }

    return {
      ok: false,
      message: error.response?.data?.message || error.message || "Failed to change avatar",
    };
  }
};
