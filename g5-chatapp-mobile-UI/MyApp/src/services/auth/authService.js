import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.3:3000";

{/* Register */}
export const signUp = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) {
      return { ok: false, message: data.message || "Something went wrong" };
    }

    if (data.refreshToken) {
      await AsyncStorage.setItem("refreshToken", data.refreshToken);
    }

    return { ok: true, message: data.message || "Signup successful", refreshToken: data.refreshToken };
  } catch (error) {
    console.error("Signup error:", error);
    return { ok: false, message: "Something went wrong, please try again later." };
  }
};

{/* Login */}
export const signIn = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { ok: false, message: data.message || "Something went wrong" };
    }

    const { user, token } = data.data || {};
    if (!user || !token) {
      return { ok: false, message: "User data is missing" };
    }

    await AsyncStorage.setItem("user", JSON.stringify(user));
    await AsyncStorage.setItem("userToken", token);

    return { ok: true, message: data.message || "Login successful", token, user };
  } catch (error) {
    console.error("Sign-in error:", error);
    return { ok: false, message: error.message || "An error occurred. Please try again later." };
  }
};
