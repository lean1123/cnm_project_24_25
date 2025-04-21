import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Footer from "../../components/Footer";

const SettingsScreen = () => {
  const [language, setLanguage] = useState("en");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const languageData = {
    en: {
      language: "Language",
      darkMode: "Dark Mode",
      settings: "Settings",
      about: "About",
      help: "Help",
      notifications: "Notifications",
      privacy: "Privacy",
      security: "Security",
      storage: "Storage and Data",
    },
    vi: {
      language: "Ngôn ngữ",
      darkMode: "Chế độ tối",
      settings: "Cài đặt",
      about: "Về chúng tôi",
      help: "Trợ giúp",
      notifications: "Thông báo",
      privacy: "Quyền riêng tư",
      security: "Bảo mật",
      storage: "Bộ nhớ và dữ liệu",
    },
  };

  const getText = (key) => languageData[language][key];

  const handleSettingPress = (setting) => {
    Alert.alert(`${setting} Pressed`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#135CAF" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity style={styles.headerButton}>
              <Icon name="cog" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.menuContainer}>
              <TouchableSettingItem
                icon="translate"
                title={getText("language")}
                value={language === "en" ? "English" : "Tiếng Việt"}
                onPress={() => setLanguage(language === "en" ? "vi" : "en")}
              />

              <SettingItem
                icon="theme-light-dark"
                title={getText("darkMode")}
                value={
                  <Switch
                    value={isDarkMode}
                    onValueChange={() => setIsDarkMode(!isDarkMode)}
                    trackColor={{ false: "#ddd", true: "#135CAF" }}
                    thumbColor={isDarkMode ? "#fff" : "#fff"}
                    ios_backgroundColor="#ddd"
                  />
                }
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            <View style={styles.menuContainer}>
              <TouchableSettingItem
                icon="bell-outline"
                title={getText("notifications")}
                onPress={() => handleSettingPress("Notifications")}
              />
              <TouchableSettingItem
                icon="shield-lock-outline"
                title={getText("privacy")}
                onPress={() => handleSettingPress("Privacy")}
              />
              <TouchableSettingItem
                icon="security"
                title={getText("security")}
                onPress={() => handleSettingPress("Security")}
              />
              <TouchableSettingItem
                icon="database"
                title={getText("storage")}
                onPress={() => handleSettingPress("Storage")}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.menuContainer}>
              <TouchableSettingItem
                icon="information-outline"
                title={getText("about")}
                onPress={() => handleSettingPress("About")}
              />
              <TouchableSettingItem
                icon="help-circle-outline"
                title={getText("help")}
                onPress={() => handleSettingPress("Help")}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
};

const SettingItem = ({ icon, title, value }) => (
  <View style={styles.menuItem}>
    <View style={styles.menuItemLeft}>
      <Icon name={icon} size={24} color="#135CAF" style={styles.menuIcon} />
      <Text style={styles.menuItemText}>{title}</Text>
    </View>
    {value}
  </View>
);

const TouchableSettingItem = ({ icon, title, value, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <Icon name={icon} size={24} color="#135CAF" style={styles.menuIcon} />
      <Text style={styles.menuItemText}>{title}</Text>
    </View>
    <View style={styles.menuItemRight}>
      {value && <Text style={styles.menuItemValue}>{value}</Text>}
      <Icon name="chevron-right" size={24} color="#666" />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  scrollView: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#135CAF',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: '15%',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemValue: {
    fontSize: 16,
    color: "#666",
    marginRight: 8,
  },
});

export default SettingsScreen;
