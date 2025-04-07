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
import { validateEmail, validatePassword } from "../../utils/validators";

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleSignIn = async () => {
  
    try {
      const result = await signIn(email, password);  // Gọi hàm signIn từ services

      if (result.ok) {
        // Lưu thông tin người dùng và token vào AsyncStorage
        await AsyncStorage.setItem("user", JSON.stringify(result.user));  
        await AsyncStorage.setItem("userToken", result.token); 

        console.log("Navigating to Home_Chat..."); 
        showModal("Login successful", () => {
          setTimeout(() => {
            navigation.navigate("Home_Chat"); 
          }, 1500); 
        });
      } else {
        showModal(result.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Sign-in error:", error); 
      showModal(error.message || "An error occurred. Please try again later.");
    }
    
  };
  

  const showModal = (message, callback) => {
    setModalMessage(message);
    setModalVisible(true);
    if (callback) {
      setTimeout(() => {
        setModalVisible(false);
        callback();
      }, 1500);
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

          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")} >
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
});

export default SignInScreen;
