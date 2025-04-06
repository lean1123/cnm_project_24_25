import React from "react";
import { Text, StyleSheet } from "react-native";
import { Modal, Portal, Button } from "react-native-paper";

const CustomModal = ({ visible, message, onDismiss }) => (
  <Portal>
    <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <Button mode="contained" onPress={onDismiss} style={styles.button}>
        <Text style={styles.buttonText}>OK</Text>
      </Button>
    </Modal>
  </Portal>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    alignSelf: "center",
  },
  message: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#135CAF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CustomModal;
