import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/constants";

const api = axios.create({
  baseURL: "http://localhost:3000",

  withCredentials: true,
});

const getAccessToken = async () => {
  const token = await AsyncStorage.getItem("accessToken");
  return token ? `Bearer ${token}` : "";
};

api.interceptors.request.use(
  async (config) => {
    const publicEndpoints = [
      "/auth/sign-in",
      "/auth/sign-up",
      "/auth/refresh-token",
      "/auth/forgot-password",
      "/auth/forgot-password-verification",
    ];

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
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const store = await AsyncStorage.getItem("auth-storage");
        const userId = store ? JSON.parse(store).stats.user._id : null;

        const { data } = await axios.post(
          "/auth/refresh-token/" + userId,
          {},
          { withCredentials: true }
        );

        await AsyncStorage.setItem("accessToken", data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return axios.request(error.config);
      } catch (error) {
        console.log("Refresh token expired or invalid", error);
        await AsyncStorage.removeItem("accessToken");
        // Navigate to login screen
        // You'll need to implement navigation here
      }
    }
    return Promise.reject(error);
  }
);

export default api;
