import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Menu,
  TouchableRipple,
  Provider as PaperProvider,
} from "react-native-paper";

const EditProfileModal = ({ visible, user, onClose, onSave }) => {
  const [editedUser, setEditedUser] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    gender: user?.gender || "",
    dob: user?.dob?.split("T")[0] || "",
  });

  const [menuVisible, setMenuVisible] = useState(false);
  const genderOptions = ["male", "female", "other"];

  const handleSave = () => {
    onSave(editedUser);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <PaperProvider>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>

              <TextInput
                label="First Name"
                mode="outlined"
                value={editedUser.firstName}
                onChangeText={(text) =>
                  setEditedUser({ ...editedUser, firstName: text })
                }
                style={styles.input}
              />
              <TextInput
                label="Last Name"
                mode="outlined"
                value={editedUser.lastName}
                onChangeText={(text) =>
                  setEditedUser({ ...editedUser, lastName: text })
                }
                style={styles.input}
              />

              <View style={styles.menuWrapper}>
                <TouchableRipple
                  onPress={() => setMenuVisible(true)}
                  style={styles.menuTrigger}
                >
                  <View pointerEvents="none">
                    <TextInput
                      label="Gender"
                      mode="outlined"
                      value={
                        editedUser.gender
                          ? editedUser.gender.charAt(0).toUpperCase() +
                            editedUser.gender.slice(1)
                          : ""
                      }
                      editable={false}
                      right={<TextInput.Icon icon="menu-down" />}
                    />
                  </View>
                </TouchableRipple>

                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={{ x: 0, y: 0 }}
                  style={styles.menu}
                >
                  {genderOptions.map((option) => (
                    <Menu.Item
                      key={option}
                      onPress={() => {
                        setEditedUser({ ...editedUser, gender: option });
                        setMenuVisible(false);
                      }}
                      title={option.charAt(0).toUpperCase() + option.slice(1)}
                    />
                  ))}
                </Menu>
              </View>

              <TextInput
                label="Date of Birth (YYYY-MM-DD)"
                mode="outlined"
                value={editedUser.dob}
                onChangeText={(text) =>
                  setEditedUser({ ...editedUser, dob: text })
                }
                style={styles.input}
              />

              <View style={styles.modalButtons}>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.saveButton}
                >
                  Save
                </Button>
                <Button
                  mode="outlined"
                  onPress={onClose}
                  textColor="#E74C3C"
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
              </View>
            </View>
          </PaperProvider>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    elevation: 5,
    alignSelf: "center",
    marginTop: Platform.OS === "ios" ? 100 : 50,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    marginVertical: 5,
  },
  menu:{
    backgroundColor: "#fff",
    borderRadius: 8,
    alignSelf: "center",
    width: "50%",
    zIndex: 1,
    position: "absolute",
    top: '48%',
    left: '23%',
  },
  menuWrapper: {
    marginVertical: 5,
  },
  menuTrigger: {
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 5,
    borderColor: "#E74C3C",
  },
});

export default EditProfileModal;
