import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Show/ Hide Password
  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Regex 
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const isValidPassword = (password) => password.length >= 6;

  // Login Handler 
  const handleSignIn = async () => {
    if (!email || !password) {
      alert("Please fill all the required fields");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Invalid email format");
      return;
    }

    if (!isValidPassword(password)) {
      alert("Password must be at least 6 characters long");
      return;
    }

    // Call API
    try {
      const response = await fetch("http://192.168.1.3:3000/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("API Response:", data); 

      if (response.ok) {
        if (data && data.data && data.data.user) {
          try {
            await AsyncStorage.setItem("user", JSON.stringify(data.data.user));
            console.log("User data saved successfully:", data.data.user);
            alert("Login successful");
            navigation.navigate("Home_Chat");
          } catch (error) {
            console.error("Error saving user data:", error);
            alert("An error occurred while saving your data.");
          }
        } else {
          alert("User data is missing.");
          console.log("Received data without user key:", data); 
        }
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error during signin:", error);
      alert("An error occurred. Please try again later.");
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
          <View style={styles.inputContainer}>
            <Icon name="email" size={24} color="#4484CD" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={24} color="#4484CD" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureTextEntry}
            />
            <TouchableOpacity onPress={toggleSecureTextEntry} style={styles.eyeIcon}>
              <Icon name={secureTextEntry ? "eye-off" : "eye"} size={24} color="#4484CD" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Icon name="login" size={24} color="#fff" />
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
            <Text style={{ marginTop: 20, fontSize: 16, color: "#4484CD" }}>
              Don't have an account?
              <Text style={{ fontWeight: "bold" }}> Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  signInButton: {
    backgroundColor: "#135CAF",
    width: "90%",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 18,
  },
});

export default SignInScreen;
