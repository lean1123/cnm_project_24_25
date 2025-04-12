import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Image,
  Dimensions
} from "react-native";
import { Button } from "react-native-paper";
import OTPInputView from "@twotalltotems/react-native-otp-input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import NotificationModal from "../../components/CustomModal";
import { verifyOTP, provideOtp } from "../../services/auth/authService";

const { width } = Dimensions.get('window');

const VerifyOTPScreen = ({ route, navigation }) => {
  const [userId, setUserId] = useState(route.params?.userId);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const checkUserId = async () => {
      if (!userId) {
        const storedUserId = await AsyncStorage.getItem('tempUserId');
        /** console.log("Stored userId from AsyncStorage:", storedUserId); */
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          setModalMessage("Session expired. Please register again.");
          setModalVisible(true);
          setTimeout(() => {
            navigation.navigate("SignUpScreen");
          }, 1500);
        }
      }
    };
    checkUserId();
  }, []);

  const handleVerifyOTP = async (code) => {
    if (!userId) {
      setModalMessage("Session expired. Please register again.");
      setModalVisible(true);
      return;
    }

    try {
      /** console.log("Verifying OTP for userId:", userId); */
      const result = await verifyOTP(userId, code);
      /** console.log("Verify OTP result:", result); */
      
      if (result.ok) {
        setModalMessage("Verification successful! Redirecting to home...");
        setModalVisible(true);
        await AsyncStorage.removeItem('tempUserId');
        setTimeout(() => {
          navigation.navigate("Home_Chat");
        }, 1500);
      } else {
        /** console.log("Verification error:", result.error); */
        if (result.message.includes("User not found")) {
          setModalMessage("OTP has expired. Please register again.");
          setModalVisible(true);
          await AsyncStorage.removeItem('tempUserId');
          setTimeout(() => {
            navigation.navigate("SignUpScreen");
          }, 1500);
        } else if (result.message.includes("Invalid OTP")) {
          setModalMessage("Invalid OTP code. Please try again.");
          setModalVisible(true);
        } else {
          setModalMessage(result.message || "Verification failed. Please try again.");
          setModalVisible(true);
        }
      }
    } catch (error) {
      /** console.error("Verification error:", error); */
      setModalMessage("An error occurred. Please try again.");
      setModalVisible(true);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const result = await provideOtp(userId);
      if (result.ok) {
        setModalMessage("New OTP has been sent to your email.");
        setModalVisible(true);
      } else {
        setModalMessage(result.message);
        setModalVisible(true);
      }
    } catch (error) {
      setModalMessage("Failed to resend OTP. Please try again.");
      setModalVisible(true);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#135CAF" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify OTP</Text>
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendOTP}
            disabled={isResending}
          >
            <Text style={styles.resendText}>
              {isResending ? "Resending..." : "Resend"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../../../assets/images/otp-verification.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.subtitle}>
              Please enter the OTP sent to your email
            </Text>
          </View>

          <View style={styles.formContainer}>
            <OTPInputView
              style={styles.otpInput}
              pinCount={6}
              autoFocusOnLoad
              codeInputFieldStyle={styles.underlineStyleBase}
              codeInputHighlightStyle={styles.underlineStyleHighLighted}
              onCodeFilled={(code) => handleVerifyOTP(code)}
            />
          </View>
        </View>

        <NotificationModal
          visible={isModalVisible}
          message={modalMessage}
          onDismiss={() => setModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    marginTop: Platform.OS === 'android' ? 0 : 0,
    backgroundColor: '#135CAF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 12 : 28,
    paddingBottom: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  resendButton: {
    padding: 8,
  },
  resendText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  illustration: {
    marginTop: '-40%',
    width: width * 0.4,
    height: width * 0.35,
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 17,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  otpInput: {
    width: '100%',
    height: 100,
  },
  underlineStyleBase: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    color: '#111827',
    fontSize: 22,
    fontWeight: '600',
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  underlineStyleHighLighted: {
    borderColor: '#2563EB',
    backgroundColor: '#ffffff',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default VerifyOTPScreen; 