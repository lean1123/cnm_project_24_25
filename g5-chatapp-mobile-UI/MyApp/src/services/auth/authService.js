import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../config/axiosInstance"; // <-- import instance

{/* Register */}
export const signUp = async (formData) => {
  try {
    const response = await axiosInstance.post("/auth/sign-up", {
      ...formData,
      role: ['user']
    });
    const { data, success, message } = response.data;
    if (!success || !data?.userId) {
      return { ok: false, message: message || "Invalid response from server" };
    }
    return { ok: true, message: message || "OTP sent successfully", userId: data.userId };
  } catch (error) {
    return { ok: false, message: error.response?.data?.message || "Registration failed" };
  }
};

export const verifyOTP = async (userId, otp) => {
  try {
    const response = await axiosInstance.post(`/auth/verify-otp/${userId}`, { otp });
    const { token, user } = response.data.data || response.data;
    if (!token || !user) return { ok: false, message: "Invalid response from server" };

    await AsyncStorage.setItem("userToken", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));
    await AsyncStorage.setItem("userId", user.id);

    return { ok: true, message: "Verification successful", token, user };
  } catch (error) {
    return { ok: false, message: error.response?.data?.message || "Verification failed" };
  }
};

export const signIn = async (email, password) => {
  try {
    const response = await axiosInstance.post("/auth/sign-in", { email, password });
    const { data, success, message } = response.data;
    if (!success || !data) return { ok: false, message: message || "Login failed" };

    const { user, token } = data;
    await AsyncStorage.setItem("user", JSON.stringify(user));
    await AsyncStorage.setItem("userToken", token);

    return { ok: true, message: message || "Login successful", user, token };
  } catch (error) {
    return { ok: false, message: error.response?.data?.message || "Login failed" };
  }
};

export const provideOtp = async (userId) => {
  try {
    await axiosInstance.post(`/auth/provide-otp/${userId}`);
    return { ok: true, message: "OTP resent successfully" };
  } catch (error) {
    return { ok: false, message: error.response?.data?.message || "Failed to resend OTP" };
  }
};

export const forgotPassword = async (email, newPassword) => {
  try {
    const response = await axiosInstance.post("/auth/forgot-password", { email, newPassword });
    const { success, message } = response.data;
    if (!success) return { ok: false, message: message || "Failed to send OTP" };
    return { ok: true, message: message || "OTP sent successfully" };
  } catch (error) {
    return { ok: false, message: error.response?.data?.message || "Error occurred" };
  }
};

export const verifyForgotPasswordOtp = async (email, otp) => {
  try {
    const response = await axiosInstance.post("/auth/forgot-password-verification", { email, otp });
    const { success, message } = response.data;
    if (!success) return { ok: false, message: message || "Failed to verify OTP" };
    return { ok: true, message: message || "OTP verified successfully" };
  } catch (error) {
    return { ok: false, message: error.response?.data?.message || "Error occurred" };
  }
};

export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await axiosInstance.post("/auth/change-password", { oldPassword, newPassword });
    return { ok: true, message: "Password changed successfully", data: response.data };
  } catch (error) {
    return { ok: false, message: error.response?.data?.message || "Failed to change password" };
  }
};
