import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const otpInputs = useRef([]); // Dùng để tham chiếu tới từng ô nhập OTP

  const isPhoneNumber = (number) => {
    const phoneRe = /^[0-9]{9}$/;
    return phoneRe.test(number);
  };

  const handleSendOtp = () => {
    if (isPhoneNumber(phoneNumber)) {
      setIsOtpSent(true);
      setCountdown(60);
    } else {
      alert("Phone number is invalid!");
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return; // Chặn nhập ký tự không phải số

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Nếu người dùng nhập một số, chuyển sang ô tiếp theo
    if (value && index < otpInputs.current.length - 1) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otpCode[index] === "") {
      // Nếu ô hiện tại trống và bấm xóa, chuyển về ô trước đó
      if (index > 0) {
        otpInputs.current[index - 1].focus();
      }
    }
  };

  useEffect(() => {
    let timer;
    if (isOtpSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpSent, countdown]);

  const handleLogin = () => {
    if (otpCode.join("") === "1234") {
      navigation.navigate("Home_Chat");
    } else {
      alert("Please enter a valid OTP");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Login</Text>
          <Text style={styles.headerTitle2}>
            {isOtpSent ? "Enter OTP Code" : "Enter your phone number"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate("RegisterScreen")}
        >
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container_2}>
        {isOtpSent ? (
          <>
            <Text style={styles.infoText}>Sent to: (+84) {phoneNumber}</Text>
            <Text style={styles.countdown} onPress={handleSendOtp}>
              {countdown > 0
                ? `00:${countdown < 10 ? "0" : ""}${countdown}`
                : "Resend Code"}
            </Text>

            <View style={styles.otpContainer}>
              {otpCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (otpInputs.current[index] = ref)} // Gán ref cho từng ô input
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)} // Xử lý backspace
                />
              ))}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
              <Icon name="arrow-right" size={30} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Image
              source={{
                uri: "https://img.freepik.com/premium-vector/secure-login-form-page-with-password-computer-padlock-3d-vector-icon-cartoon-minimal-style_365941-1119.jpg",
              }}
              style={styles.logo}
            />

            <Text style={styles.infoText}>You will get a code via sms.</Text>

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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#4484CD",
    paddingHorizontal: 20,
    paddingVertical: 15,
    height: "30%",
    borderBottomLeftRadius: "30%",
    borderBottomRightRadius: "40%",
  },
  headerTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerTitle2: {
    marginTop: "14%",
    fontSize: 25,
    fontWeight: "bold",
    color: "#FFF",
  },
  registerButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#135CAF",
    top: "15%",
    right: "8%",
    position: "absolute",
  },
  registerText: {
    color: "#135CAF",
    fontWeight: "bold",
    fontSize: 16,
  },
  container_2: {
    padding: 20,
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
    textAlign: "center",
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
  countryCode: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
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

export default LoginScreen;
