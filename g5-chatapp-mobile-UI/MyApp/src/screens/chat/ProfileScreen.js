import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Alert,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  getUserProfile,
  updateUserProfile,
  changeAvatar,
} from "../../services/user/userService";
import NotificationModal from "../../components/CustomModal";
import EditProfileModal from "../../components/EditProfileModal";
import { API_URL } from "../../config/constants";
import { changePassword } from "../../services/auth/authService";
import dayjs from "dayjs";
import * as ImagePicker from "expo-image-picker";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");
      console.log("userId:", userId);
      console.log("Token:", token);
      if (!token) {
        showNotification("Vui lòng đăng nhập lại");
        navigation.navigate("SignInScreen");
        return;
      }

      const response = await fetch(`${API_URL}/auth/get-my-profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch user profile");
      }

      if (result.data) {
        const userData = result.data;
        setUser({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          gender: userData.gender || "Chưa thiết lập",
          role: Array.isArray(userData.role)
            ? userData.role
            : [userData.role].filter(Boolean),
          avatar: userData.avatar || null,
          dob: userData.dob || null,
        });
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      showNotification(
        error.message || "Đã xảy ra lỗi khi tải thông tin cá nhân"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("userId");
      navigation.reset({
        index: 0,
        routes: [{ name: "SignInScreen" }],
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSave = async (updatedProfile) => {
    try {
      const tokenUpdate = await AsyncStorage.getItem("userToken");
      const result = await updateUserProfile(updatedProfile, tokenUpdate);
      if (result.ok) {
        setUser(result.data);
        setEditModalVisible(false);
        showNotification("Cập nhật thông tin thành công");
        fetchUserProfile();
      } else {
        showNotification(result.message || "Cập nhật thông tin thất bại");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      showNotification("Đã xảy ra lỗi khi cập nhật thông tin");
    }
  };

  const showNotification = (message) => {
    setNotificationMessage(message);
    setNotificationModalVisible(true);
    setTimeout(() => {
      setNotificationModalVisible(false);
    }, 2000);
  };

  const validatePassword = (password) => {
    const minLength = 6;
    if (password.length < minLength) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    return null;
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showNotification("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification("Mật khẩu mới không khớp");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      showNotification(passwordError);
      return;
    }

    try {
      const response = await changePassword(oldPassword, newPassword);

      if (response.ok) {
        showNotification("Thay đổi mật khẩu thành công");
        setShowChangePassword(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showNotification(response.message || "Thay đổi mật khẩu thất bại");
      }
    } catch (error) {
      console.error("Change password error details:", error);
      showNotification("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    }
  };

  const handleChangeAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showNotification("Cần quyền truy cập thư viện ảnh!");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const token = await AsyncStorage.getItem("userToken");
        const file = {
          uri: result.assets[0].uri,
          name: "avatar.jpg",
          type: result.assets[0].mimeType,
        };

        const response = await changeAvatar(file, token);

        if (response.ok) {
          setUser((prevUser) => ({
            ...prevUser,
            avatar: response.data.avatar,
          }));
          showNotification("Thay đổi ảnh đại diện thành công");
          fetchUserProfile();
        } else {
          showNotification(response.message || "Thay đổi ảnh đại diện thất bại");
        }
      } else {
        showNotification("Chưa chọn ảnh nào");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      showNotification("Đã xảy ra lỗi khi đổi ảnh đại diện");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#135CAF" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Không có dữ liệu hồ sơ</Text>
      </SafeAreaView>
    );
  }
  //  log first name and last name
  console.log("user:", user);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#135CAF" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.coverPhoto}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: user.avatar || "https://i.pravatar.cc/150?img=5",
                }}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.editAvatar}
                onPress={() => handleChangeAvatar()}
              >
                <Icon name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.sectionFullName}>
            <Text style={styles.sectionTitleFullName}>
              <Text style={styles.name}>
                {user.firstName} {user.lastName}
              </Text>
            </Text>
          </View>
          <View style={styles.section}>
            <View style={styles.infoContainer}>
              <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

              <InfoRow label="Email" value={user.email} icon="email" />
              <InfoRow label="Giới tính" value={user.gender} icon="gender-male-female" />
              <InfoRow
                label="Ngày sinh"
                value={user.dob ? dayjs(user.dob).format("DD/MM/YYYY") : "Chưa thiết lập"}
                icon="cake-variant"
              />
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditModalVisible(true)}
            >
              <Icon name="account-edit" size={20} color="#fff" />
              <Text style={styles.buttonText}>Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bảo mật</Text>
            <TouchableOpacity
              style={[
                styles.menuItem,
                showChangePassword && styles.menuItemActive,
              ]}
              onPress={() => setShowChangePassword(!showChangePassword)}
            >
              <View style={styles.menuItemLeft}>
                <Icon name="lock" size={24} color="#135CAF" />
                <Text style={styles.menuItemText}>Đổi mật khẩu</Text>
              </View>
              <Icon
                name={showChangePassword ? "chevron-up" : "chevron-right"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>

            {showChangePassword && (
              <View style={styles.passwordForm}>
                <View style={styles.inputContainer}>
                  <Icon
                    name="lock-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu hiện tại"
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry={!showOldPassword}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowOldPassword(!showOldPassword)}
                  >
                    <Icon
                      name={showOldPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Icon
                    name="lock-plus-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Icon
                      name={showNewPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Icon
                    name="lock-check-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Icon
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.passwordRequirements}>Mật khẩu phải có ít nhất 6 ký tự</Text>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleChangePassword}
                >
                  <Text style={styles.submitButtonText}>Cập nhật mật khẩu</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Icon name="logout" size={24} color="#E74C3C" />
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <EditProfileModal
        visible={editModalVisible}
        user={user}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSave}
      />

      <NotificationModal
        visible={notificationModalVisible}
        message={notificationMessage}
        onDismiss={() => setNotificationModalVisible(false)}
      />

      <Footer />
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value, icon }) => {
  const displayValue = Array.isArray(value) ? value.join(", ") : value;
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelContainer}>
        <Icon name={icon} size={20} color="#666" style={styles.infoIcon} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{displayValue || "Chưa thiết lập"}</Text>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  scrollView: {
    flexGrow: 1,
  },
  fullNameContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    position: "absolute",
    top: 120,
    left: 120,
    zIndex: 100,
    color: "#000",
    fontSize: 24,
  },
  coverPhoto: {
    height: 130,
    backgroundColor: "#135CAF",
    justifyContent: "flex-end",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: -70,
  },
  avatarContainer: {
    position: "relative",
    zIndex: 1,
    marginBottom: 26,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: "#fff",
    resizeMode: "stretch",
  },
  editAvatar: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#135CAF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginTop: 8,
    marginBottom: 16,
    alignSelf: "center",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginBottom: "15%",
  },
  sectionFullName: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: '20%',
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  sectionTitleFullName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    alignSelf: "center",
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#135CAF",
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemActive: {
    backgroundColor: "#f8f9fa",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#1a1a1a",
  },
  passwordForm: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputIcon: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#1a1a1a",
  },
  eyeIcon: {
    padding: 12,
  },
  passwordRequirements: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#135CAF",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 8,
    borderRadius: 25,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E74C3C",
  },
  logoutText: {
    color: "#E74C3C",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
