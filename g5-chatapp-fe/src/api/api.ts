import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAccessToken = () => {
  const token = Cookies.get("accessToken");
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
    const token = getAccessToken();
    if (isPublicEndpoint) {
      delete config.headers.Authorization;
      return config;
    }
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response.status === 401) {
      try {
        const store = localStorage.getItem("auth-storage");
        const userId = store ? JSON.parse(store).stats.user._id : null;
        const { data } = await axios.post(
          "/auth/refresh-token/" + userId,
          {},
          { withCredentials: true }
        );
        Cookies.set("accessToken", data.accessToken, {
          expires: 1,
          secure: true,
          sameSite: "Strict",
        });
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return axios.request(error.config);
      } catch (error) {
        console.log("Refresh token expired or invalid", error);
        Cookies.remove("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
