import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const PasswordInput = ({ value, onChangeText }) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true); // state quản lý việc ẩn/mở mật khẩu

  const toggleSecureTextEntry = () => {
    setSecureTextEntry((prevState) => !prevState); // toggle giữa true/false
  };

  return (
    <View style={styles.container}>
      <Icon name="lock" size={24} color="#4484CD" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry} // sử dụng state này để ẩn/mở mật khẩu
      />
      <TouchableOpacity onPress={toggleSecureTextEntry} style={styles.eyeIcon}>
        <Icon name={secureTextEntry ? "eye-off" : "eye"} size={24} color="#4484CD" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    position: "absolute",
    left: 10,
    zIndex: 1,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    paddingLeft: 45,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
});

export default PasswordInput;
