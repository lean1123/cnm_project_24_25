import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

const getAccessToken = () => {
  const token = Cookies.get("accessToken");
  return token ? `Bearer ${token}` : "";
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response.status === 401) {
      try {
        const { data } = await axios.post(
          "/auth/refresh",
          {},
          { withCredentials: true }
        );
        Cookies.set("accessToken", data.accessToken, { expires: 1,secure: true , sameSite: "Strict" });
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
