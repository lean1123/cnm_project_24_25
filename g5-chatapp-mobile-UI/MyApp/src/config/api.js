import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/constants";

const api = axios.create({
  baseURL: API_URL,
});

const getAccessToken = async () => {
  const token = await AsyncStorage.getItem("userToken");
  return token ? `Bearer ${token}` : "";
};

api.interceptors.request.use(
  async (config) => {
    const publicEndpoints = ["/auth/sign-in", "/auth/sign-up", "/auth/refresh-token"];
    const isPublic = publicEndpoints.some((endpoint) => config.url?.includes(endpoint));

    if (!isPublic) {
      const token = await getAccessToken();
      if (token) config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          const { data } = await axios.post(`${API_URL}/auth/refresh-token/${userId}`, {}, { withCredentials: true });
          await AsyncStorage.setItem("userToken", data.accessToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios.request(error.config);
        }
      } catch (err) {
        console.log("Token refresh failed:", err);
        await AsyncStorage.removeItem("userToken");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
