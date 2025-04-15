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
        showNotification("Please login again");
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
          gender: userData.gender || "Not set",
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
        error.message || "An error occurred while loading profile"
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
        showNotification("Profile updated successfully");
        fetchUserProfile();
      } else {
        showNotification(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      showNotification("An error occurred while updating profile");
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
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showNotification("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification("New passwords do not match");
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
        showNotification("Password changed successfully");
        setShowChangePassword(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showNotification(response.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error details:", error);
      showNotification("An error occurred. Please try again later.");
    }
  };

  const handleChangeAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showNotification("Permission to access photo library is required!");
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
          showNotification("Avatar changed successfully");
            fetchUserProfile();
        } else {
          showNotification(response.message || "Failed to change avatar");
        }
      } else {
        showNotification("No image selected");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      showNotification("An error occurred while changing the avatar");
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
        <Text>No profile data available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user.avatar || "https://i.pravatar.cc/150?img=5" }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.editAvatar}
              onPress={() => handleChangeAvatar()}
            >
              <Icon name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text
            style={styles.name}
          >{`${user.firstName} ${user.lastName}`}</Text>

          <View style={styles.infoContainer}>
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Gender" value={user.gender} />
            <InfoRow
              label="Date of Birth"
              value={
                user.dob ? dayjs(user.dob).format("DD/MM/YYYY") : "Not set"
              }
            />
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditModalVisible(true)}
          >
            <Icon name="pencil" size={18} color="#fff" />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.changePasswordButton}
            onPress={() => setShowChangePassword(!showChangePassword)}
          >
            <Icon name="lock" size={18} color="#fff" />
            <Text style={styles.changePasswordText}>
              {showChangePassword ? "Hide Change Password" : "Change Password"}
            </Text>
          </TouchableOpacity>

          {showChangePassword && (
            <View style={styles.passwordForm}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Current Password"
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry={!showOldPassword}
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
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
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
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
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

              <Text style={styles.passwordRequirements}>
                Password must be at least 6 characters long
              </Text>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.submitButtonText}>Update Password</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={18} color="#E74C3C" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Footer />

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
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value }) => {
  const displayValue = Array.isArray(value) ? value.join(", ") : value;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{displayValue || "Not set"}</Text>
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
    alignItems: "center",
    paddingVertical: 20,
  },
  profileSection: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    width: "90%",
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#135CAF",
  },
  editAvatar: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#135CAF",
    borderRadius: 20,
    padding: 8,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 10,
    marginBottom: 5,
  },
  infoContainer: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#666666",
    fontSize: 16,
  },
  infoValue: {
    color: "#135CAF",
    fontSize: 16,
    fontWeight: "500",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#135CAF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    elevation: 3,
  },
  editText: {
    color: "#ffffff",
    marginLeft: 10,
    fontWeight: "bold",
    fontSize: 16,
  },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 15,
    width: "100%",
    elevation: 3,
  },
  changePasswordText: {
    color: "#ffffff",
    marginLeft: 10,
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 15,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E74C3C",
    elevation: 2,
  },
  logoutText: {
    color: "#E74C3C",
    marginLeft: 10,
    fontWeight: "bold",
    fontSize: 16,
  },
  passwordForm: {
    width: "100%",
    marginTop: 15,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  passwordRequirements: {
    fontSize: 12,
    color: "#666",
    marginBottom: 15,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: "#135CAF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
