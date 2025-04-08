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
import NotificationModal from "../../components/CustomModal";
import { isValidEmail } from "../../utils/validators";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    // Validate email
    if (!email) {
      setModalMessage("Please enter your email address");
      setModalVisible(true);
      return;
    }

    if (!isValidEmail(email)) {
      setModalMessage("Please enter a valid email address");
      setModalVisible(true);
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Gọi API reset password
      // const result = await resetPassword(email);
      
      // Giả lập API call thành công
      setTimeout(() => {
        setIsLoading(false);
        setModalMessage("Password reset instructions have been sent to your email");
        setModalVisible(true);
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      setModalMessage("An error occurred. Please try again later.");
      setModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Forgot Password</Text>
          <Text style={styles.headerSubTitle}>
            Enter your email to reset your password
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
          />

          <TouchableOpacity 
            style={[styles.resetButton, isLoading && styles.disabledButton]} 
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Sending..." : "Reset Password"}
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