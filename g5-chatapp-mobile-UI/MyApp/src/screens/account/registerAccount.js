import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const RegisterScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const otpInputs = useRef([]);

  // Kiểm tra số điện thoại hợp lệ
  const isPhoneNumber = (number) => /^[0-9]{9}$/.test(number);

  // Gửi OTP
  const handleSendOtp = () => {
    if (isPhoneNumber(phoneNumber)) {
      setIsOtpSent(true);
      setCountdown(60);
    } else {
      alert("Phone number is invalid!");
    }
  };

  // Xử lý nhập OTP với tự động focus
  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    if (value !== "" && index < otpInputs.current.length - 1) {
      otpInputs.current[index + 1].focus();
    }
  };

  // Xóa khi bấm Backspace
  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otpCode[index] === "") {
      if (index > 0) {
        otpInputs.current[index - 1].focus();
      }
    }
  };

  // Xác minh OTP
  const handleVerifyOtp = () => {
    if (otpCode.join("") === "1234") {
      setIsOtpVerified(true);
    } else {
      alert("Invalid OTP!");
    }
  };

  // Đếm ngược gửi lại mã OTP
  useEffect(() => {
    let timer;
    if (isOtpSent && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpSent, countdown]);

  // Xử lý đăng ký
  const handleRegisterSubmit = () => {
    if (!name) {
      alert("Please enter your name");
      return;
    }
    navigation.navigate("Home_Chat");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Register</Text>
        <Text style={styles.headerTitle2}>
          {isOtpVerified
            ? "Successfully registered!"
            : isOtpSent
            ? "Enter OTP Code"
            : "Enter your phone number"}
        </Text>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate("LoginScreen")}
        >
          <Icon name="chevron-left" size={24} color="#135CAF" />
          <Text style={styles.registerText}>Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container_2}>
        {isOtpVerified ? (
          <>
            {/* Nhập tên */}
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.infoText}>Select your avatar</Text>

            {/* Chọn avatar */}
            <View style={styles.avatarWrapper}>
              <TouchableOpacity
                onPress={() => console.log("Select Avatar")}
                style={styles.avatarContainer}
              >
                {selectedAvatar ? (
                  <Image
                    source={{ uri: selectedAvatar }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Icon name="account-circle" size={60} color="#ddd" />
                )}
                <Icon
                  name="pencil"
                  size={20}
                  color="#135CAF"
                  style={styles.avatarEditIcon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleRegisterSubmit}
            >
              <Icon name="check" size={30} color="#fff" />
            </TouchableOpacity>
          </>
        ) : isOtpSent ? (
          <>
            {/* OTP Section */}
            <Text style={styles.countdown}>
              {countdown > 0
                ? `00:${countdown < 10 ? "0" : ""}${countdown}`
                : "Resend Code"}
            </Text>

            <View style={styles.otpContainer}>
              {otpCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => (otpInputs.current[index] = el)}
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleVerifyOtp}
            >
              <Icon name="check" size={30} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.infoText}>You will get a code via SMS.</Text>

            {/* Nhập số điện thoại */}
            <View style={styles.inputContainer}>
              <View style={styles.flagContainer}>
                <Image
                  source={{ uri: "https://flagcdn.com/w320/vn.png" }}
                  style={styles.flagIcon}
                />
                <Text style={styles.countryCode}>+84</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="39 677 8989"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSendOtp}
            >
              <Icon name="arrow-right" size={30} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#4484CD",
    paddingHorizontal: 20,
    paddingVertical: 20,
    height: "30%",
    borderBottomLeftRadius: "30%",
    borderBottomRightRadius: "40%",
  },
  headerTitle: {
    marginLeft: "40%",
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerTitle2: {
    marginTop: "30%",
    marginRight: "8%",
    fontSize: 25,
    fontWeight: "bold",
    color: "#FFF",
    border: 1,
    borderColor: "#000",
    position: "absolute",
  },
  registerButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#135CAF",
    top: "15%",
    left: "8%",
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  registerText: {
    color: "#135CAF",
    fontWeight: "bold",
    fontSize: 16,
  },
  flagContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  flagIcon: {
    width: 24,
    height: 16,
    marginRight: 5,
  },
  container_2: {
    padding: 20,
    alignItems: "center",
  },
  countdown: {
    fontSize: 14,
    color: "#4484CD",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginBottom: 20,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    width: 40,
    height: 50,
    textAlign: "center",
    fontSize: 18,
    color: "#000",
  },
  avatarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedAvatar: {
    borderColor: "#135CAF",
  },
  input: {
    fontSize: 16,
    width: "90%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
    textAlign: "center",
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  avatarEditIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 5,
  },
  submitButton: {
    backgroundColor: "#135CAF",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});

export default RegisterScreen;
