import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const InputField = ({ 
  icon, 
  placeholder, 
  value, 
  onChangeText, 
  keyboardType = "default", 
  error = "",
  autoCapitalize = "sentences" 
}) => (
  <View style={styles.inputContainer}>
    <Icon name={icon} size={24} color={error ? "#FF3B30" : "#4484CD"} style={styles.icon} />
    <TextInput
      style={[
        styles.input,
        error ? styles.inputError : null
      ]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
    />
  </View>
);

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
    position: "absolute",
    zIndex: 1,
    left: 10,
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
  inputError: {
    borderColor: '#FF3B30',
  },
});

export default InputField;
