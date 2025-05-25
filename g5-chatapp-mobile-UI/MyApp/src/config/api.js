import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ URL backend đã deploy
export const API_URL = "https://cnm-project-24-25.onrender.com";

// ✅ Tạo axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ✅ Lấy token từ AsyncStorage
const getAccessToken = async () => {
  const token = await AsyncStorage.getItem("accessToken");
  return token ? `Bearer ${token}` : "";
};

// ✅ Request interceptor: tự động thêm Authorization nếu cần
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

// ✅ Response interceptor: xử lý lỗi 401 và tự động refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const store = await AsyncStorage.getItem("auth-storage");
        const userId = store ? JSON.parse(store).stats.user._id : null;

        if (!userId) throw new Error("User ID not found");

        // ✅ Gọi API refresh token bằng đúng URL deploy
        const { data } = await axios.post(
          `${API_URL}/auth/refresh-token/${userId}`,
          {},
          { withCredentials: true }
        );

        // ✅ Lưu token mới và retry request cũ
        await AsyncStorage.setItem("accessToken", data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return axios.request(error.config);
      } catch (refreshError) {
        console.log("Refresh token expired or invalid", refreshError);
        await AsyncStorage.removeItem("accessToken");
        // ❗ Bạn cần điều hướng về login ở đây nếu dùng React Navigation
        // Ví dụ: navigation.navigate("Login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
