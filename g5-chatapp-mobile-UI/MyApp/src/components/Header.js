import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Header = () => {
  const navigation = useNavigation();
  const [isSearching, setIsSearching] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <View style={styles.header}>
      {isSearching ? (
        <View style={styles.headerContent}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#888"
            autoFocus
          />
          <TouchableOpacity onPress={() => setIsSearching(false)}>
            <Icon
              name="close-circle"
              size={30}
              color="#fff"
              style={styles.iconBack}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/chat/logochat.png")}
              style={styles.logo}
            />
            <Text style={styles.text_header}>E-Chat</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setIsSearching(true)}>
              <Icon
                name="magnify"
                size={30}
                color="#fff"
                style={styles.searchIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsModalVisible(true)}>
              <Icon
                name="plus"
                size={34}
                color="#fff"
                style={styles.plusIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        {/* Lớp phủ đen mờ */}
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          {/* Modal giữ vị trí cũ */}
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setIsModalVisible(false);
                  setTimeout(() => navigation.navigate("AddFriend"), 300);
                }}
              >
                <Icon name="account-plus" size={20} color="#000" />
                <Text style={styles.modalText}>Add Friend</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setIsModalVisible(false);
                  setTimeout(() => navigation.navigate("AddGroupScreen"), 300);
                }}
              >
                <Icon name="account-group" size={20} color="#000" />
                <Text style={styles.modalText}>Add Group</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setIsModalVisible(false);
                  setTimeout(() => navigation.navigate("GroupCallScreen"), 300);
                }}
              >
                <Icon name="phone" size={20} color="#000" />
                <Text style={styles.modalText}>Call Group</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setIsModalVisible(false)}
              >
                <Icon name="close" size={22} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#135CAF",
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    height: 70, // giữ nguyên kích thước header
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    marginHorizontal: 8,
  },
  plusIcon: {
    marginHorizontal: 5,
  },
  iconBack: {
    marginLeft: 10,
  },
  text_header: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 24,
    marginLeft: 5,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    color: "#000",
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 30,
    paddingVertical: 5,
    textAlignVertical: "center",
    fontSize: 16,
  },
  modalContainer: {
    position: "absolute",
    top: "12%", 
    right: "5%", 
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    width: 200,
    alignItems: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalText: {
    fontSize: 16,
    marginLeft: 10,
  },
  modalClose: {
    marginTop: 10,
  },
  modalCloseText: {
    color: "red",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Header;
