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
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Header from "../../components/Header";
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
    },
    vi: {
      language: "Ngôn ngữ",
      darkMode: "Chế độ tối",
      settings: "Cài đặt",
      about: "Về chúng tôi",
      help: "Trợ giúp",
    },
  };

  const getText = (key) => languageData[language][key];

  const handleSettingPress = (setting) => {
    Alert.alert(`${setting} Pressed`);
  };

  // Tạo styles Dark Mode
  const styles = getStyles(isDarkMode);

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.section}>
          <TouchableSettingItem
            title={getText("language")}
            value={language === "en" ? "English" : "Tiếng Việt"}
            onPress={() => setLanguage(language === "en" ? "vi" : "en")}
            isDarkMode={isDarkMode}
          />

          <SettingItem
            title={getText("darkMode")}
            value={
              <Switch
                value={isDarkMode}
                onValueChange={() => setIsDarkMode(!isDarkMode)}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
              />
            }
            isDarkMode={isDarkMode}
          />

          <TouchableSettingItem
            title={getText("settings")}
            onPress={() => handleSettingPress("Settings")}
            isDarkMode={isDarkMode}
          />
          <TouchableSettingItem
            title={getText("about")}
            onPress={() => handleSettingPress("About")}
            isDarkMode={isDarkMode}
          />
          <TouchableSettingItem
            title={getText("help")}
            onPress={() => handleSettingPress("Help")}
            isDarkMode={isDarkMode}
          />
        </View>
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
};

const SettingItem = ({ title, value, isDarkMode }) => (
  <View style={[getStyles(isDarkMode).settingItem]}>
    <Text style={[getStyles(isDarkMode).settingItemText]}>{title}</Text>
    {value}
  </View>
);

const TouchableSettingItem = ({ title, value, onPress, isDarkMode }) => (
  <TouchableOpacity
    style={[getStyles(isDarkMode).settingItem]}
    onPress={onPress}
  >
    <Text style={[getStyles(isDarkMode).settingItemText]}>{title}</Text>
    {value && <Text style={[getStyles(isDarkMode).settingValue]}>{value}</Text>}
    <Icon
      name="chevron-forward"
      size={20}
      color={isDarkMode ? "#fff" : "#135CAF"}
    />
  </TouchableOpacity>
);

const getStyles = (isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#121212" : "#fff",
    },
    scrollViewContent: {
      paddingVertical: 20,
      paddingHorizontal: 20,
    },
    section: {
      marginBottom: 20,
    },
    settingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#444" : "#ddd",
    },
    settingItemText: {
      fontSize: 16,
      color: isDarkMode ? "#fff" : "#333",
    },
    settingValue: {
      fontSize: 16,
      color: isDarkMode ? "#aaa" : "#888",
      marginRight: 10,
    },
  });

export default SettingsScreen;
