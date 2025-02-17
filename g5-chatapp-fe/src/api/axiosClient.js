import axios from "axios";
import AuthApi from "./authApi";

const AdminAxiosClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const getToken = () => {
  const token = localStorage.getItem("accessToken");
  return token ? token : "";
};

AdminAxiosClient.interceptors.request.use(
  async (config) => {
    const publicEndpoints = [
      //   { urlPattern: /\/auth\/login/, methods: ["POST"] },
      //   { urlPattern: /\/auth\/signUp/, methods: ["POST"] },
      //   { urlPattern: /\/auth\/refreshToken/, methods: ["POST"] },
      //   { urlPattern: /\/products/, methods: ["GET"] },
      //   { urlPattern: /\/product-items/, methods: ["GET"] },
      //   { urlPattern: /\/cart/, methods: ["GET", "POST", "PUT"] },
    ];

    const isPublicEndpoint = publicEndpoints.some(
      (endpoint) =>
        endpoint.urlPattern.test(config.url) &&
        endpoint.methods.includes(config.method.toUpperCase())
    );

    if (isPublicEndpoint) {
      if (config.headers.Authorization) {
        delete config.headers.Authorization;
      }
      return config;
    }

    const token = getToken();

    config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

AdminAxiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      let token = getToken();

      if (token) {
        try {
          const refreshedToken = await AuthApi.refreshToken();

          console.log("refreshedToken in admin axios: ", refreshedToken);
          if (refreshedToken.status !== 200) {
            window.location.href = "/login";
            return Promise.reject(error);
          }
          token = await refreshedToken.data.token;
          localStorage.setItem("accessToken", token);
          originalRequest.headers.Authorization = `Bearer ${token}`;

          return AdminAxiosClient(originalRequest);
        } catch (error) {
          console.error("Error during token refresh request", error);
          //   logOutCurrentUser();
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (error.response) {
      console.error("Response error", error.response);
    } else if (error.request) {
      console.error("No response received", error.request);
    } else {
      console.error("Request setup error", error.message);
    }

    return Promise.reject(error);
  }
);

export default AdminAxiosClient;
