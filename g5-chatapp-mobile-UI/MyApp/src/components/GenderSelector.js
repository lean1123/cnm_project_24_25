import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const GenderSelector = ({ gender, setGender }) => (
  <View style={styles.container}>
    <Text style={styles.label}>Gender</Text>
    <View style={styles.options}>
      {["male", "female", "other"].map((g) => (
        <TouchableOpacity key={g} onPress={() => setGender(g)}>
          <Text style={[styles.option, gender === g && styles.selected]}>{g.charAt(0).toUpperCase() + g.slice(1)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  options: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#ddd",
    borderRadius: 15,
    fontSize: 16,
  },
  selected: {
    backgroundColor: "#135CAF",
    color: "#fff",
  },
});

export default GenderSelector;
