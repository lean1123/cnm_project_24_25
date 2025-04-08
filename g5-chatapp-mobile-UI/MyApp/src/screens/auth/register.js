import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import InputField from "../../components/InputField";
import PasswordField from "../../components/PasswordInput";
import GenderSelector from "../../components/GenderSelector";
import NotificationModal from "../../components/CustomModal";

import { signUp } from "../../services/auth/authService";
import { validateSignUp } from "../../utils/validators";

const SignUpScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "male",
  });
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleSecure = () => setSecureTextEntry(!secureTextEntry);

  const handleSignUp = async () => {
    const validationError = validateSignUp(form);
    if (validationError) {
      setModalMessage(validationError);
      setModalVisible(true);
      return;
    }

    try {
      const result = await signUp(form);
      // console.log("Sign up result:", result);

      if (result.ok && result.userId) {
        await AsyncStorage.setItem('tempUserId', result.userId);
        // console.log("Stored tempUserId:", result.userId);
        
        setModalMessage("OTP has been sent to your email. Please verify.");
        setModalVisible(true);
        setTimeout(() => {
          navigation.navigate("VerifyOTPScreen", {
            userId: result.userId
          });
        }, 1500);
      } else {
        setModalMessage(result.message || "Registration failed. Please try again.");
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Sign up error:", error);
      setModalMessage("An error occurred during registration. Please try again.");
      setModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Register Account</Text>
          <Text style={styles.headerSubTitle}>Please register to login</Text>
        </View>

        <View style={styles.formContainer}>
          <InputField
            icon="account"
            placeholder="First Name"
            value={form.firstName}
            onChangeText={(text) => setForm({ ...form, firstName: text })}
          />
          <InputField
            icon="account"
            placeholder="Last Name"
            value={form.lastName}
            onChangeText={(text) => setForm({ ...form, lastName: text })}
          />
          <InputField
            icon="email"
            placeholder="Email"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            keyboardType="email-address"
          />
          <PasswordField
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            secureTextEntry={secureTextEntry}
            toggleSecure={toggleSecure}
          />
          <GenderSelector
            gender={form.gender}
            setGender={(g) => setForm({ ...form, gender: g })}
          />

          <TouchableOpacity style={styles.submitButtonContainer}>
            <Button
              mode="contained"
              style={styles.submitButton}
              onPress={handleSignUp}
            >
              <Text style={styles.submitText}>Register</Text>
            </Button>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("SignInScreen")}>
            <Text style={styles.signInText}>
              Already have an account?{" "}
              <Text style={{ fontWeight: "bold" }}>Sign In</Text>
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
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  header: {
    backgroundColor: "#135CAF",
    paddingVertical: 20,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: { fontSize: 34, fontWeight: "bold", color: "#fff" },
  headerSubTitle: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "500",
    color: "#fff",
  },
  formContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    backgroundColor: "#135CAF",
    width: "100%",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonContainer: {
    width: "100%",
    marginTop: 20,
  },
  submitText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  signInText: {
    marginTop: 20,
    color: "#4484CD",
    fontSize: 16,
  },
});

export default SignUpScreen;
