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
import { Button, Modal, Portal } from "react-native-paper"; // React Native Paper

const SignUpScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("male");
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Show/ Hide Password
  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const isValidPassword = (password) => password.length >= 6;

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !gender) {
      setModalMessage("Please fill all the required fields");
      setModalVisible(true);
      return;
    }

    if (!isValidEmail(email)) {
      setModalMessage("Invalid email format");
      setModalVisible(true);
      return;
    }

    if (!isValidPassword(password)) {
      setModalMessage("Password must be at least 6 characters long");
      setModalVisible(true);
      return;
    }

    // Call API for registration
    try {
      const response = await fetch("http://192.168.1.3:3000/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          gender,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setModalMessage("Registration successful");
        setModalVisible(true);
        navigation.navigate("SignInScreen");
      } else {
        setModalMessage(data.message || "Something went wrong");
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setModalMessage("An error occurred. Please try again later.");
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
          {/* First Name */}
          <View style={styles.inputContainer}>
            <Icon
              name="account"
              size={24}
              color="#4484CD"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputContainer}>
            <Icon
              name="account"
              size={24}
              color="#4484CD"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Icon name="email" size={24} color="#4484CD" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View style={styles.passwordContainer}>
            <Icon name="lock" size={24} color="#4484CD" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureTextEntry}
            />
            <TouchableOpacity
              onPress={toggleSecureTextEntry}
              style={styles.eyeIcon}
            >
              <Icon
                name={secureTextEntry ? "eye-off" : "eye"}
                size={24}
                color="#4484CD"
              />
            </TouchableOpacity>
          </View>

          {/* Gender Selection */}
          <View style={styles.genderContainer}>
            <Text style={styles.genderLabel}>Gender</Text>
            <View style={styles.genderOptions}>
              <TouchableOpacity onPress={() => setGender("male")}>
                <Text
                  style={[
                    styles.genderOption,
                    gender === "male" && styles.selectedGender,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setGender("female")}>
                <Text
                  style={[
                    styles.genderOption,
                    gender === "female" && styles.selectedGender,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setGender("other")}>
                <Text
                  style={[
                    styles.genderOption,
                    gender === "other" && styles.selectedGender,
                  ]}
                >
                  Other
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button
            mode="contained"
            style={styles.submitButton}
            onPress={handleSignUp}
          >
            <Icon name="account-plus" size={22} color="#fff" />
            <Text style={styles.submitText}> Register</Text>
          </Button>

          <View>
            <TouchableOpacity
              onPress={() => navigation.navigate("SignInScreen")}
            >
              <Text style={{ marginTop: 20, color: "#4484CD", fontSize: 16 }}>
                Already have an account?
                <Text style={{ fontWeight: "bold" }}> Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal for Notifications */}
      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalMessage}>{modalMessage}</Text>
          <Button
            mode="contained"
            onPress={() => setModalVisible(false)}
            style={styles.modalButton}
          >
            OK
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
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
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubTitle: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "500",
    color: "#fff",
  },
  formContainer: {
    marginTop: "35%",
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
    position: "absolute",
    zIndex: 1,
    left: 10,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    paddingLeft: 45,
    borderWidth: 0,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  passwordContainer: {
    width: "100%",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 15,
  },
  genderContainer: {
    width: "100%",
    marginTop: 10,
    marginBottom: 10,
  },
  genderLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  genderOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#ddd",
    borderRadius: 15,
    fontSize: 16,
  },
  selectedGender: {
    backgroundColor: "#135CAF",
    color: "#fff",
  },
  submitButton: {
    backgroundColor: "#135CAF",
    width: "100%",
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    elevation: 5,
  },
  submitText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalMessage: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#135CAF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

export default SignUpScreen;
