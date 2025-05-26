// services/userService.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../config/api";
import { API_URL } from "../../config/constants";

// Function to get the token from AsyncStorage
const getToken = async () => {
  try {
    const userDataString = await AsyncStorage.getItem("userData");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      return userData.token; // Or however your token is stored
    }
    return null;
  } catch (error) {
    console.error("Error getting token from AsyncStorage:", error);
    return null;
  }
};

{
  /* search users */
}
export const searchUsers = async (query) => {
  try {
    const token = await getToken();
    if (!token) {
      // Handle case where token is not available, e.g., by throwing an error or returning a specific response
      return { ok: false, message: "User not authenticated", status: 401 };
    }

    // Corrected endpoint based on backend controller
    const response = await api.get(`/users/search?keyword=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Adapt this based on your actual API response structure
    if (response.data && response.data.success !== undefined) { // Check for success property
      if (response.data.success) {
        return { ok: true, data: response.data.data, message: response.data.message };
      } else {
        return { ok: false, message: response.data?.message || "Search operation failed", status: response.status };
      }
    } else if (response.data && Array.isArray(response.data)) {
        // If backend directly returns an array of users on success
        return { ok: true, data: response.data, message: "Search successful" };
    } else {
        // Fallback if the structure is unexpected
        return { ok: false, message: "Unexpected response structure from server", status: response.status };
    }
  } catch (error) {
    console.error("Error in searchUsers service:", error.response?.data || error.message);
    return {
      ok: false,
      message: error.response?.data?.message || error.message || "An error occurred during user search.",
      status: error.response?.status,
    };
  }
};

{
  /* get Profile User */
}
export const getUserProfile = async () => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return { ok: false, message: "No userId found" };

    const response = await api.get(`/auth/get-my-profile`);
    if (!response.data)
      return { ok: false, message: "No data received from server" };

    const userData = response.data;
    return {
      ok: true,
      data: {
        firstName: userData.firstName || userData.first_name || "",
        lastName: userData.lastName || userData.last_name || "",
        email: userData.email || "",
        gender: userData.gender || "",
        role: Array.isArray(userData.role)
          ? userData.role
          : userData.role
          ? [userData.role]
          : [],
        avatar: userData.avatar || null,
      },
    };
  } catch (error) {
    console.error("Get user profile error:", error);
    return {
      ok: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch user profile",
    };
  }
};

{
  /* update Profile User */
}
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
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile",
    };
  }
};

{
  /* change avatar */
}
export const changeAvatar = async (file, token) => {
  try {
    if (!token) throw new Error("No token provided");

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.type,
      name: file.name,
    });


    const response = await api.put("/users/change-avatar", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", 
      },
    });

    return { ok: true, data: response.data };
  } catch (error) {
    console.error("Change avatar error:", error);


    if (error.response) {
      console.error("Response error details:", error.response.data);
      console.error("Response status:", error.response.status);
    }

    return {
      ok: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to change avatar",
    };
  }
};
