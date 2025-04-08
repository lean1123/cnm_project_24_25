import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../../config/constants";

{/* Register */}
export const signUp = async (formData) => {
  try {
    console.log("Sending sign up request with data:", formData);
    const response = await axios.post(`${API_URL}/auth/sign-up`, {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      password: formData.password,
      gender: formData.gender,
      role: ['user'] // Default role for new users
    });
    
    // console.log("Sign up response:", response.data);
    
    // The backend returns response with data property
    const { data, success, message } = response.data;
    if (!success || !data || !data.userId) {
      console.error("Invalid response from server:", response.data);
      return { 
        ok: false, 
        message: message || "Invalid response from server" 
      };
    }
    
    return { 
      ok: true, 
      message: message || "OTP sent successfully",
      userId: data.userId
    };
  } catch (error) {
    console.error("Sign up error:", error.response?.data);
    return { 
      ok: false, 
      message: error.response?.data?.message || "Registration failed" 
    };
  }
};

export const verifyOTP = async (userId, otp) => {
  try {
    console.log("Sending verify OTP request for userId:", userId);
    const response = await axios.post(`${API_URL}/auth/verify-otp/${userId}`, {
      otp
    });
    
    // console.log("Verify OTP response:", response.data);
    
    // Check if response has data property
    const responseData = response.data.data || response.data;
    const { token, user } = responseData;
    
    if (!token || !user) {
      console.error("Missing token or user in response:", responseData);
      return { 
        ok: false, 
        message: "Invalid response from server",
        error: responseData
      };
    }
    
    // Store all necessary data
    await AsyncStorage.setItem("userToken", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));
    await AsyncStorage.setItem("userId", user.id); // Store userId
    
    return { 
      ok: true, 
      message: "Verification successful",
      token,
      user
    };
  } catch (error) {
    console.error("Verify OTP error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return { 
      ok: false, 
      message: error.response?.data?.message || "Verification failed",
      error: error.response?.data
    };
  }
};

{/* Login */}
export const signIn = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/sign-in`, {
      email,
      password
    });

    // console.log("Sign in response:", response.data);
    
    // Kiểm tra response format
    if (!response.data) {
      throw new Error("Invalid response from server");
    }

    const { data, message, success } = response.data;
    
    if (!success || !data) {
      return { 
        ok: false, 
        message: message || "Login failed" 
      };
    }

    const { user, token } = data;
    if (!user || !token) {
      return { 
        ok: false, 
        message: "Missing user data or token" 
      };
    }

    await AsyncStorage.setItem("user", JSON.stringify(user));
    await AsyncStorage.setItem("userToken", token);

    return { 
      ok: true, 
      message: message || "Login successful",
      user,
      token
    };
  } catch (error) {
    console.error("Sign-in error:", error.response?.data || error);
    return { 
      ok: false, 
      message: error.response?.data?.message || "An error occurred. Please try again later." 
    };
  }
};

{/* Get OTP */}
export const provideOtp = async (userId) => {
  try {
    const response = await axios.post(`${API_URL}/auth/provide-otp/${userId}`);
    return { ok: true, message: "OTP resent successfully" };
  } catch (error) {
    return { ok: false, message: error.response?.data?.message || "Failed to resend OTP" };
  }
};

{/* Forgot Pasword */}

export const forgotPassword = async (email, newPassword) => {
  try {
    console.log("Sending forgot password request:", { email, newPassword });
    const response = await axios.post(`${API_URL}/auth/forgot-password`, {
      email,
      newPassword
    });
    
    // Kiểm tra response format
    if (!response.data) {
      throw new Error("Invalid response from server");
    }

    // console.log("Forgot password response:", response.data);
    const { data, message, success } = response.data;
    
    if (!success) {
      return { 
        ok: false, 
        message: message || "Failed to send OTP" 
      };
    }

    return { 
      ok: true, 
      message: message || "OTP sent successfully"
    };
  } catch (error) {
    console.error("Forgot password error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return { 
      ok: false, 
      message: error.response?.data?.message || "An error occurred. Please try again later." 
    };
  }
};

export const verifyForgotPasswordOtp = async (email, otp) => {
  try {
    // console.log("Sending verify OTP request:", { email, otp });
    const response = await axios.post(`${API_URL}/auth/forgot-password-verification`, {
      email,
      otp
    });

    // Kiểm tra response format
    if (!response.data) {
      throw new Error("Invalid response from server");
    }

    console.log("Verify OTP response:", response.data);
    const { data, message, success } = response.data;
    
    if (!success) {
      return { 
        ok: false, 
        message: message || "Failed to verify OTP" 
      };
    }

    return { 
      ok: true, 
      message: message || "OTP verified successfully"
    };
  } catch (error) {
    console.error("Verify OTP error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return { 
      ok: false, 
      message: error.response?.data?.message || "An error occurred. Please try again later." 
    };
  }
};

export const changePassword = async (userId, oldPassword, newPassword, token) => {
    try {
        console.log('Changing password for user:', userId);
        const response = await axios.post(
            `${API_URL}/auth/change-password/${userId}`,
            {
                oldPassword,
                newPassword
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Change password response:', response.data);
        return {
            ok: true,
            message: 'Password changed successfully'
        };
    } catch (error) {
        console.error('Change password error:', error);
        return {
            ok: false,
            message: error.response?.data?.message || 'Failed to change password'
        };
    }
};
