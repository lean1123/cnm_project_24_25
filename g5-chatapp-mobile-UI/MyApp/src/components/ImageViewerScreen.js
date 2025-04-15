// src/screens/ImageViewerScreen.js

import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // hoặc dùng react-native-vector-icons
import { useNavigation, useRoute } from "@react-navigation/native";

const ImageViewerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { uri } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={30} color="#fff" />
      </TouchableOpacity>
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />
    </View>
  );
};

export default ImageViewerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
});
