import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import InputField from "../../components/InputField";
import PasswordField from "../../components/PasswordInput";
import NotificationModal from "../../components/CustomModal";
import { isValidEmail, isValidPassword } from "../../utils/validators";
import { forgotPassword, verifyForgotPasswordOtp } from "../../services/auth/authService";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleSendOTP = async () => {
    // Validate email and password
    if (!email || !newPassword) {
      setModalMessage("Please fill in all fields");
      setModalVisible(true);
      return;
    }

    if (!isValidEmail(email)) {
      setModalMessage("Please enter a valid email address");
      setModalVisible(true);
      return;
    }

    if (!isValidPassword(newPassword)) {
      setModalMessage("Password must be at least 6 characters long");
      setModalVisible(true);
      return;
    }

    try {
      setIsLoading(true);
      const result = await forgotPassword(email, newPassword);
      
      if (result.ok) {
        setModalMessage("OTP has been sent to your email");
        setModalVisible(true);
        setShowOtpInput(true);
      } else {
        setModalMessage(result.message || "Failed to send OTP");
        setModalVisible(true);
      }
    } catch (error) {
      setModalMessage(error.message || "An error occurred. Please try again later.");
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setModalMessage("Please enter the OTP");
      setModalVisible(true);
      return;
    }

    try {
      setIsLoading(true);
      const result = await verifyForgotPasswordOtp(email, otp);
      
      if (result.ok) {
        setModalMessage("Password has been reset successfully");
        setModalVisible(true);
        setTimeout(() => {
          navigation.navigate("SignInScreen");
        }, 1500);
      } else {
        setModalMessage(result.message || "Invalid OTP");
        setModalVisible(true);
      }
    } catch (error) {
      setModalMessage(error.message || "An error occurred. Please try again later.");
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Forgot Password</Text>
          <Text style={styles.headerSubTitle}>
            {showOtpInput 
              ? "Enter the OTP sent to your email" 
              : "Enter your email and new password"}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <InputField
            icon="email"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!showOtpInput}
          />

          {!showOtpInput && (
            <PasswordField
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
            />
          )}

          {showOtpInput && (
            <InputField
              icon="key"
              placeholder="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
            />
          )}

          <TouchableOpacity 
            style={[styles.resetButton, isLoading && styles.disabledButton]} 
            onPress={showOtpInput ? handleVerifyOtp : handleSendOTP}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Processing..." : (showOtpInput ? "Verify OTP" : "Send OTP")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
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
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  formContainer: {
    width: "90%",
    alignSelf: "center",
    alignItems: "center",
  },
  resetButton: {
    backgroundColor: "#135CAF",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    color: "#135CAF",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ForgotPasswordScreen;