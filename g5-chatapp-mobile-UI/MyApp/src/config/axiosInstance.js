import axios from "axios";
import { API_URL } from "../config/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

axiosInstance.interceptors.request.use(
  async (config) => {
    // Try both token keys to ensure compatibility
    let token = await AsyncStorage.getItem("userToken");
    if (!token) {
      token = await AsyncStorage.getItem("accessToken");
    }
    console.log('Axios Interceptor - Token retrieved:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Axios Interceptor - Authorization header set:', config.headers.Authorization.substring(0, 40) + '...');
    } else {
      console.log('Axios Interceptor - No token found, no Authorization header set');
    }
    
    console.log('Axios Interceptor - Final headers:', JSON.stringify(config.headers, null, 2));
    return config;
  },
  (error) => {
    console.error('Axios Interceptor - Request error:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
