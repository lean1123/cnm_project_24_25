import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import InputField from "../../components/InputField";
import PasswordField from "../../components/PasswordInput";
import NotificationModal from "../../components/CustomModal";
import { isValidEmail, isValidPassword } from "../../utils/validators";
import { forgotPassword, verifyForgotPasswordOtp } from "../../services/auth/authService";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleSendOTP = async () => {
    // Validate email and password
    if (!email || !newPassword || !confirmPassword) {
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

    if (newPassword !== confirmPassword) {
      setModalMessage("Passwords do not match");
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
            <Text style={styles.welcomeText}>Reset Password</Text>
            <Text style={styles.subText}>
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
              <>
                <PasswordField
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <PasswordField
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </>
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
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>
                {isLoading ? "Processing..." : (showOtpInput ? "Verify OTP" : "Send OTP")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
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
    paddingBottom: 40,
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
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#135CAF',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    width: '100%',
    shadowColor: '#135CAF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
    shadowOpacity: 0,
    elevation: 0,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 24,
    padding: 8,
  },
  backButtonText: {
    color: '#135CAF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;