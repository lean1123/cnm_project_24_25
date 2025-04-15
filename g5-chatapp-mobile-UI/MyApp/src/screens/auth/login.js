import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import InputField from "../../components/InputField";
import PasswordField from "../../components/PasswordInput";
import NotificationModal from "../../components/CustomModal";
import { signIn } from "../../services/auth/authService";
import { validateSignIn } from "../../utils/validators";
import { CommonActions } from "@react-navigation/native";
import { initSocket } from "../../services/socket";
import useAuthStore from "../../store/useAuthStore";

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const { setUser } = useAuthStore();

  const handleSignIn = async () => {
    // Validate form
    const validationError = validateSignIn({ email, password });
    if (validationError) {
      setModalMessage(validationError);
      setModalVisible(true);
      return;
    }

    try {
      const result = await signIn(email, password);
      console.log("Sign in result:", result);

      if (result.ok && result.user && result.user._id) {
        // Store user data
        const userData = {
          _id: result.user._id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          avatar: result.user.avatar,
          phone: result.user.phone,
          status: result.user.status,
          isOnline: true,
          token: result.token,
        };

        // Store user data in AsyncStorage
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        await AsyncStorage.setItem("userToken", result.token);
        await AsyncStorage.setItem("userId", result.user._id);

        // Verify data was stored correctly
        const storedUserData = await AsyncStorage.getItem("userData");
        const storedToken = await AsyncStorage.getItem("userToken");
        const storedUserId = await AsyncStorage.getItem("userId");

        if (!storedUserData || !storedToken || !storedUserId) {
          throw new Error("Failed to store user data");
        }

        console.log("User data stored successfully");
        setModalMessage("Login successful!");
        setModalVisible(true);

        // Initialize socket connection
        await initSocket(result.user._id);

        // Navigate after showing modal
        setTimeout(() => {
          setModalVisible(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Home_Chat" }],
            })
          );
        }, 1500);
      } else {
        console.log("Login failed:", result.message);
        setModalMessage(result.message || "Login failed. Please try again.");
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setModalMessage(
        error.message || "An error occurred. Please try again later."
      );
      setModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Login</Text>
          <Text style={styles.headerSubTitle}>Please Login to continue</Text>
        </View>

        <View style={styles.formContainer}>
          <InputField
            icon="email"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <PasswordField
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate("ForgotPasswordScreen")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
            <Text style={styles.footerText}>
              Don't have an account?
              <Text style={{ fontWeight: "bold" }}> Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <NotificationModal
        visible={isModalVisible}
        message={modalMessage}
        onDismiss={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: 20,
  },
  header: {
    backgroundColor: "#135CAF",
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerSubTitle: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "500",
    color: "#fff",
  },
  formContainer: {
    width: "90%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  signInButton: {
    backgroundColor: "#135CAF",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footerText: {
    marginTop: 20,
    fontSize: 16,
    color: "#4484CD",
  },
  forgotPasswordButton: {
    marginTop: -5,
    marginBottom: 15,
    alignSelf: "flex-end",
    padding: 5,
  },
  forgotPasswordText: {
    color: "#135CAF",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default SignInScreen;
