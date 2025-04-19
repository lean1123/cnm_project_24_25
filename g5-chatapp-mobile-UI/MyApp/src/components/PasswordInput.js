import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const PasswordInput = ({ value, onChangeText }) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true); 

  const toggleSecureTextEntry = () => {
    setSecureTextEntry((prevState) => !prevState); 
  };

  return (
    <View style={styles.container}>
      <Icon name="lock" size={24} color="#4484CD" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry} 
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
    borderWidth: 1,
    borderColor: '#E8ECF4',
    boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
  },
});

export default PasswordInput;
