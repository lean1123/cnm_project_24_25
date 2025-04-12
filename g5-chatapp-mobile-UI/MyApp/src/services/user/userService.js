import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config/constants";

const api = axios.create({
  baseURL: API_URL,
});

// Get access token from AsyncStorage
const getAccessToken = async () => {
  const token = await AsyncStorage.getItem("userToken");
  return token ? `Bearer ${token}` : "";
};

// Add request interceptor
api.interceptors.request.use(
  async (config) => {
    const publicEndpoints = ["/auth/sign-in", "/auth/sign-up", "/auth/refresh-token"];
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (!isPublicEndpoint) {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          const { data } = await axios.post(
            `${API_URL}/auth/refresh-token/${userId}`,
            {},
            { withCredentials: true }
          );
          await AsyncStorage.setItem("userToken", data.accessToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios.request(error.config);
        }
      } catch (refreshError) {
        console.log("Refresh token expired or invalid", refreshError);
        await AsyncStorage.removeItem("userToken");
      }
    }
    return Promise.reject(error);
  }
);

export const getUserProfile = async () => {
    try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
            return { ok: false, message: "No userId found" };
        }

        console.log("Fetching user profile for userId:", userId);

        const response = await api.get(`/users/${userId}`);
        // console.log("User profile API response:", response.data);

        if (!response.data) {
            return { ok: false, message: "No data received from server" };
        }

        const userData = response.data;
        return { 
            ok: true, 
            data: {
                firstName: userData.firstName || userData.first_name || "",
                lastName: userData.lastName || userData.last_name || "",
                email: userData.email || "",
                gender: userData.gender || "",
                role: Array.isArray(userData.role) ? userData.role : 
                     (userData.role ? [userData.role] : []),
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

export const updateUserProfile = async (profileData, token) => {
  try {
    if (!token) throw new Error("No token provided");

    const response = await api.put(`/users`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      ok: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Update user profile error:", error);
    return {
      ok: false,
      message: error.response?.data?.message || error.message || "Failed to update profile",
    };
  }
};


