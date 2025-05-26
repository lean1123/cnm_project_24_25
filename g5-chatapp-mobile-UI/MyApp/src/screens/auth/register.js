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
import AsyncStorage from "@react-native-async-storage/async-storage";
import InputField from "../../components/InputField";
import PasswordField from "../../components/PasswordInput";
import GenderSelector from "../../components/GenderSelector";
import NotificationModal from "../../components/CustomModal";
import { signUp } from "../../services/auth/authService";
import { validateSignUp, isValidName, isValidEmail, validatePassword, isValidDob } from "../../utils/validators";
import DateTimePicker from "@react-native-community/datetimepicker";
import DateInputField from "../../components/DateInputField";

const SignUpScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "male",
    dob: "",
  });
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [dobPickerVisible, setDobPickerVisible] = useState(false);
  const [language, setLanguage] = useState("vi"); // Default to Vietnamese
  
  // Add validation error states for each field
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dob: "",
  });

  const toggleSecure = () => setSecureTextEntry(!secureTextEntry);

  const languageData = {
    en: {
      createAccount: "Create Account",
      fillFormContinue: "Please fill in the form to continue",
      firstNameLabel: "First Name",
      lastNameLabel: "Last Name",
      emailLabel: "Email",
      passwordLabel: "Password",
      passwordHint: "Password must be at least 6 characters long and must not contain spaces",
      dobLabel: "Date of Birth",
      createAccountButton: "Create Account",
      alreadyAccount: "Already have an account?",
      signInButton: "Sign In",
      nameValidationError: "name can only contain letters and hyphens",
      emailValidationError: "Please enter a valid email",
      dobValidationError: "You must be at least 13 years old",
      otpSentSuccess: "OTP has been sent to your email. Please verify.",
      registrationFailedError: "Registration failed. Please try again.",
      genericError: "An error occurred during registration. Please try again."
    },
    vi: {
      createAccount: "Tạo tài khoản",
      fillFormContinue: "Vui lòng điền vào biểu mẫu để tiếp tục",
      firstNameLabel: "Tên",
      lastNameLabel: "Họ",
      emailLabel: "Email",
      passwordLabel: "Mật khẩu",
      passwordHint: "Mật khẩu phải dài ít nhất 6 ký tự và không được chứa dấu cách",
      dobLabel: "Ngày sinh",
      createAccountButton: "Tạo tài khoản",
      alreadyAccount: "Đã có tài khoản?",
      signInButton: "Đăng nhập",
      nameValidationError: "chỉ có thể chứa các chữ cái và dấu gạch ngang",
      emailValidationError: "Vui lòng nhập một email hợp lệ",
      dobValidationError: "Bạn phải đủ 13 tuổi trở lên",
      otpSentSuccess: "Mã OTP đã được gửi đến email của bạn. Vui lòng xác minh.",
      registrationFailedError: "Đăng ký thất bại. Vui lòng thử lại.",
      genericError: "Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại."
    },
  };

  const getText = (key, fieldName = "") => {
    let text = languageData[language][key] || languageData['en'][key];
    if (fieldName) {
        text = fieldName + " " + text;
    }
    return text;
  }

  // Handle individual field validation
  const validateField = (field, value) => {
    let error = "";
    switch (field) {
      case "firstName":
      case "lastName":
        if (value.trim() !== "" && !isValidName(value)) {
          error = getText("nameValidationError", field === "firstName" ? getText("firstNameLabel") : getText("lastNameLabel"));
        }
        break;
      case "email":
        if (value.trim() !== "" && !isValidEmail(value)) {
          error = getText("emailValidationError");
        }
        break;
      case "password":
        if (value.trim() !== "") {
          const passwordError = validatePassword(value);
          if (passwordError) error = passwordError;
        }
        break;
      case "dob":
        if (value && !isValidDob(value)) {
          error = getText("dobValidationError");
        }
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
    return error === "";
  };

  // Update form field with validation
  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSignUp = async () => {
    // Clear previous errors
    setErrors({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      dob: "",
    });

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
        await AsyncStorage.setItem("tempUserId", result.userId);
        // console.log("Stored tempUserId:", result.userId);

        setModalMessage(getText("otpSentSuccess"));
        setModalVisible(true);
        setTimeout(() => {
          navigation.navigate("VerifyOTPScreen", {
            userId: result.userId,
          });
        }, 1500);
      } else {
        setModalMessage(
          result.message || getText("registrationFailedError")
        );
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Sign up error:", error);
      setModalMessage(
        getText("genericError")
      );
      setModalVisible(true);
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
            <Text style={styles.welcomeText}>{getText("createAccount")}</Text>
            <Text style={styles.subText}>{getText("fillFormContinue")}</Text>
          </View>

          <View style={styles.formContainer}>

            <View style={[styles.inputWrapper, styles.halfWidth]}>
                <InputField
                  icon="account"
                  placeholder={getText("firstNameLabel")}
                  value={form.firstName}
                  onChangeText={(text) => updateField("firstName", text)}
                  error={errors.firstName}
                />
                {errors.firstName ? (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                ) : null}
              </View>

              <View style={[styles.inputWrapper, styles.halfWidth]}>
                <InputField
                  icon="account"
                  placeholder={getText("lastNameLabel")}
                  value={form.lastName}
                  onChangeText={(text) => updateField("lastName", text)}
                  error={errors.lastName}
                />
                {errors.lastName ? (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                ) : null}
              </View>

            <InputField
              icon="email"
              placeholder={getText("emailLabel")}
              value={form.email}
              onChangeText={(text) => updateField("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}

            <PasswordField
              placeholder={getText("passwordLabel")}
              value={form.password}
              onChangeText={(text) => updateField("password", text)}
              error={errors.password}
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
            <Text style={styles.passwordHint}>
              {getText("passwordHint")}
            </Text>

            <View style={styles.genderContainer}>
              <GenderSelector
                gender={form.gender}
                setGender={(g) => setForm({ ...form, gender: g })}
              />
            </View>

            <View style={styles.dobContainer}>
              <Text style={styles.sectionTitle}>{getText("dobLabel")}</Text>
              <DateInputField
                value={form.dob}
                onPress={() => setDobPickerVisible(true)}
                error={errors.dob}
              />
              {errors.dob ? (
                <Text style={styles.errorText}>{errors.dob}</Text>
              ) : null}
            </View>

            {Platform.OS === 'android' && dobPickerVisible && (
              <DateTimePicker
                value={form.dob ? new Date(form.dob) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setDobPickerVisible(false);
                  if (selectedDate) {
                    const formattedDate = selectedDate.toISOString().split('T')[0];
                    updateField("dob", formattedDate);
                  }
                }}
              />
            )}

            {Platform.OS === 'ios' && dobPickerVisible && (
              <DateTimePicker
                value={form.dob ? new Date(form.dob) : new Date()}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    const formattedDate = selectedDate.toISOString().split('T')[0];
                    updateField("dob", formattedDate);
                  }
                }}
              />
            )}

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleSignUp}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>{getText("createAccountButton")}</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>{getText("alreadyAccount")}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("SignInScreen")}
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>{getText("signInButton")}</Text>
              </TouchableOpacity>
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
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 2,
  },
  halfWidth: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3A4B',
    marginBottom: 8,
  },
  genderContainer: {
    marginBottom: 16,
  },
  dobContainer: {
    marginBottom: 24,
  },
  registerButton: {
    backgroundColor: '#135CAF',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#135CAF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    color: '#6B7280',
    fontSize: 15,
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#F1F5FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#135CAF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  passwordHint: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
});

export default SignUpScreen;