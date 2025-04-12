import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const DateInputField = ({ value, onPress, icon = "calendar" }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Icon name={icon} size={24} color="#135CAF" style={styles.icon} />
      <Text
        style={[
          styles.text,
          !value && { color: "#aaa", fontStyle: "italic", fontWeight: "normal" },
        ]}
      >
        {value ? `Date of Birth: ${value}` : "Select Date of Birth"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginTop: 10,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    color: "#135CAF",
    fontWeight: "bold",
  },
});

export default DateInputField;
