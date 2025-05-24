import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Image,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Header = ({ onSearch }) => {
  const navigation = useNavigation();
  const [isSearching, setIsSearching] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const modalOptions = [
    {
      icon: "account-group-outline",
      text: "Add Group",
      onPress: () => navigation.navigate("AddGroupScreen"),
    },
    {
      icon: "phone-outline",
      text: "Call Group",
      onPress: () => navigation.navigate("GroupCallScreen"),
    },
  ];

  const handleSearch = (text) => {
    setSearchTerm(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  const handleCancelSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <View style={styles.header}>
      {isSearching ? (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm theo tên cuộc trò chuyện..."
              placeholderTextColor="#666"
              autoFocus
              value={searchTerm}
              onChangeText={handleSearch}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity 
                onPress={() => handleSearch("")}
                style={styles.clearButton}
              >
                <Icon name="close-circle" size={18} color="#888" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancelSearch}
          >
            <Text style={styles.cancelText}>X</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/chat/logochat.png")}
              style={styles.logo}
            />
            <Text style={styles.headerTitle}>E-Chat</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setIsSearching(true)}
            >
              <Icon name="magnify" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Icon name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {modalOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalOption,
                    index === modalOptions.length - 1 && styles.lastOption
                  ]}
                  onPress={() => {
                    setIsModalVisible(false);
                    setTimeout(() => option.onPress(), 300);
                  }}
                >
                  <Icon name={option.icon} size={22} color="#135CAF" />
                  <Text style={styles.modalText}>{option.text}</Text>
                </TouchableOpacity>
              ))}
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
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -15,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 16,
    color: "#000",
  },
  clearButton: {
    padding: 4,
  },
  cancelButton: {
    marginLeft: 12,
    paddingVertical: 8,
  },
  cancelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontWeight: "500",
    borderColor: "#fff",
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    position: "absolute",
    top: 80,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: 200,
  },
  modalContent: {
    padding: 8,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  modalText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",
  },
});

export default Header;
