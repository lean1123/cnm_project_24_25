import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import InputField from "../../components/InputField";
import PasswordField from "../../components/PasswordInput";
import NotificationModal from "../../components/CustomModal";
import { signIn } from "../../services/auth/authService";
import { validateSignIn, isValidEmail, validatePassword } from "../../utils/validators";
import { CommonActions } from "@react-navigation/native";
import { initSocket, emitLogin } from "../../services/socket";
import useAuthStore from "../../store/useAuthStore";

const { width } = Dimensions.get('window');

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const { login } = useAuthStore();
  
  // Add validation error states
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // Validate individual field
  const validateField = (field, value) => {
    let error = "";
    switch (field) {
      case "email":
        if (value.trim() !== "" && !isValidEmail(value)) {
          error = "Please enter a valid email";
        }
        break;
      case "password":
        if (value.trim() !== "") {
          const passwordError = validatePassword(value);
          if (passwordError) error = passwordError;
        }
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
    return error === "";
  };

  // Update field with validation
  const updateEmail = (text) => {
    setEmail(text);
    validateField("email", text);
  };

  const updatePassword = (text) => {
    setPassword(text);
    validateField("password", text);
  };

  const handleSignIn = async () => {
    // Clear previous errors
    setErrors({
      email: "",
      password: "",
    });
    
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
        await initSocket();
        
        // Emit login event after socket is initialized
        emitLogin(result.user._id);

        // Set user in global state using the login function from useAuthStore
        await login({ email, password });

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
      <StatusBar backgroundColor="#135CAF" barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image
              source={require("../../../assets/chat/logochat.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subText}>Sign in to continue</Text>
          </View>

          <View style={styles.formContainer}>
            <InputField
              icon="email"
              placeholder="Email"
              value={email}
              onChangeText={updateEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}

            <PasswordField
              placeholder="Password"
              value={password}
              onChangeText={updatePassword}
              error={errors.password}
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => navigation.navigate("ForgotPasswordScreen")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSignIn}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("SignUpScreen")}
                style={styles.registerButton}
              >
                <Text style={styles.registerButtonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#135CAF',
    paddingTop: Platform.OS === 'ios' ? 30 : 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 14,
    tintColor: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#E8ECF4',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
    padding: 4,
  },
  forgotPasswordText: {
    color: '#135CAF',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#135CAF',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#135CAF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    color: '#6B7280',
    fontSize: 15,
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: '#F1F5FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#135CAF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#E8ECF4',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
});

export default SignInScreen;