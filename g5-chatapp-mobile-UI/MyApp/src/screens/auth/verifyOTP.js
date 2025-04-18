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
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Button } from "react-native-paper";
import OTPInputView from "@twotalltotems/react-native-otp-input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import NotificationModal from "../../components/CustomModal";
import { verifyOTP, provideOtp } from "../../services/auth/authService";

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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
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

          <View style={styles.content}>
            <View style={styles.illustrationContainer}>
              <Image
                source={require('../../../assets/chat/logochat.png')}
                style={styles.illustration}
                resizeMode="contain"
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>OTP Verification</Text>
              <Text style={styles.subtitle}>
                Please enter the verification code sent to your email
              </Text>
            </View>

            <View style={styles.otpContainer}>
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
  },
  header: {
    backgroundColor: '#135CAF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resendButton: {
    padding: 8,
  },
  resendText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  illustration: {
    width: 120,
    height: 120,
    tintColor: '#135CAF',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3A4B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  otpContainer: {
    paddingHorizontal: 16,
  },
  otpInput: {
    width: '100%',
    height: 80,
  },
  underlineStyleBase: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    backgroundColor: '#F7F8F9',
    borderRadius: 12,
    color: '#2C3A4B',
    fontSize: 24,
    fontWeight: '600',
  },
  underlineStyleHighLighted: {
    borderColor: '#135CAF',
    backgroundColor: '#F1F5FF',
  },
});

export default VerifyOTPScreen; 