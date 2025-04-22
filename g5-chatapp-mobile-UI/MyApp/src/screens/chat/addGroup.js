import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { contactService } from "../../services/contact.service";
import { chatService } from "../../services/chat.service";
import { 
  getSocket, 
  emitCreateGroupConversation
} from "../../services/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../../config/constants";

const AddGroupScreen = ({ navigation }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [groupImage, setGroupImage] = useState(null);

  useEffect(() => {
    // Initialize socket and load user data
    const initializeData = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser(user);
          
          const socketInstance = getSocket();
          if (socketInstance) {
            console.log("[Socket] Setting up socket for AddGroupScreen");
            setSocket(socketInstance);
          }
          
          // Load friends after user data is available
          await loadFriends();
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    // Filter friends based on search text
    if (friends.length > 0) {
      filterFriends();
    }
  }, [searchText, friends]);

  const loadFriends = async () => {
    try {
      setIsLoading(true);
      
      // First, make sure we have current user data
      if (!currentUser) {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser(user);
        } else {
          throw new Error("User data not found");
        }
      }
      
      console.log("Current user ID:", currentUser?._id);
      
      // Get contacts
      const response = await contactService.getMyContacts();
      console.log("Contact service response:", response.success, "Count:", response.data?.length || 0);
      
      if (response.success && response.data) {
        console.log("Formatted friends:", JSON.stringify(response.data));
        
        // Log each contact for debugging
        response.data.forEach((contact, idx) => {
          console.log(`Contact ${idx + 1}:`, 
            contact.user?._id, 
            `(${contact.user?.firstName} ${contact.user?.lastName})`,
            "contact:", 
            contact.contact?._id,
            `(${contact.contact?.firstName} ${contact.contact?.lastName})`
          );
        });
        
        // Extract all possible friends from both user and contact fields
        let friendsList = [];
        
        response.data.forEach(contact => {
          // The friend could be in either the 'user' or 'contact' field
          // We need to check both and avoid duplicates
          
          // First check the 'user' field - if not the current user, add to list
          if (contact.user && contact.user._id !== currentUser?._id) {
            friendsList.push({
              _id: contact.user._id,
              name: `${contact.user.firstName} ${contact.user.lastName}`,
              avatar: contact.user.avatar,
              email: contact.user.email,
              contactId: contact._id
            });
          }
          
          // Also check the 'contact' field - if not the current user, add to list
          if (contact.contact && contact.contact._id !== currentUser?._id) {
            // Check if this contact is already in our list to avoid duplicates
            const alreadyAdded = friendsList.some(f => f._id === contact.contact._id);
            
            if (!alreadyAdded) {
              friendsList.push({
                _id: contact.contact._id,
                name: `${contact.contact.firstName} ${contact.contact.lastName}`,
                avatar: contact.contact.avatar,
                email: contact.contact.email,
                contactId: contact._id
              });
            }
          }
        });
        
        console.log("Processed friends list count:", friendsList.length);
        console.log("Friend IDs:", friendsList.map(f => f._id));
        
        setFriends(friendsList);
        setFilteredFriends(friendsList);
      } else {
        console.error("Failed to load friends:", response.error || "Unknown error");
        Alert.alert("Error", "Failed to load friends");
      }
    } catch (error) {
      console.error("Error loading friends:", error);
      Alert.alert("Error", "Failed to load friends. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterFriends = () => {
    if (!searchText.trim()) {
      setFilteredFriends(friends);
      return;
    }

    const filtered = friends.filter(friend => {
      const name = friend.name.toLowerCase();
      const email = friend.email?.toLowerCase() || "";
      const query = searchText.toLowerCase();
      return name.includes(query) || email.includes(query);
    });

    setFilteredFriends(filtered);
  };

  const toggleSelection = (friend) => {
    setSelectedFriends(prev => {
      const isSelected = prev.some(f => f._id === friend._id);
      if (isSelected) {
        return prev.filter(f => f._id !== friend._id);
      } else {
        return [...prev, friend];
      }
    });
  };

  const handleRemoveFriend = (id) => {
    setSelectedFriends(prev => prev.filter(friend => friend._id !== id));
  };

  const handlePickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Please allow access to your photos to set a group image.");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        // Format image for upload
        const imageFile = {
          uri: selectedImage.uri,
          type: 'image/jpeg',
          name: `group_${Date.now()}.jpg`,
        };
        setGroupImage(imageFile);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    if (selectedFriends.length < 2) {
      Alert.alert("Error", "Please select at least 2 members for the group");
      return;
    }

    try {
      setIsCreating(true);
      
      // Prepare group data
      const groupData = {
        name: groupName.trim(),
        members: selectedFriends.map(friend => friend._id),
      };

      // Create group
      const response = await chatService.createGroup(groupData, groupImage);
      
      if (response.success) {
        // Use the new socket service to emit group creation event
        emitCreateGroupConversation(response.data);
        
        Alert.alert(
          "Success", 
          "Group created successfully",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("Error", response.error || "Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Error", "Failed to create group. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenModal = async () => {
    setModalVisible(true);
    setIsLoading(true);
    
    // Always refresh the contact list when opening the modal
    try {
      await loadFriends();
    } catch (error) {
      console.error("Error loading friends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSelectedFriend = ({ item }) => (
    <View style={styles.selectedFriend}>
      <View style={styles.selectedFriendInfo}>
        <Image 
          source={
            item.avatar 
              ? { uri: item.avatar.startsWith('http') ? item.avatar : `${API_URL}/uploads/${item.avatar}` }
              : require("../../../assets/chat/avatar.png")
          }
          style={styles.selectedAvatar}
        />
        <Text style={styles.friendName}>{item.name}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemoveFriend(item._id)}>
        <Icon name="close-circle" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Group</Text>
      </View>

      <View style={styles.groupInfoContainer}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={handlePickImage}
        >
          <Image 
            source={
              groupImage 
                ? { uri: groupImage.uri } 
                : require("../../../assets/chat/group.jpg")
            }
            style={styles.groupAvatar}
          />
          <View style={styles.cameraIcon}>
            <Icon name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Enter Group Name"
          placeholderTextColor="#666"
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleOpenModal}
      >
        <Icon name="account-multiple-plus" size={22} color="#333" style={styles.buttonIcon} />
        <Text style={styles.addButtonText}>Add Members ({selectedFriends.length})</Text>
      </TouchableOpacity>

      {selectedFriends.length > 0 ? (
        <FlatList
          data={selectedFriends}
          keyExtractor={(item) => item._id}
          renderItem={renderSelectedFriend}
          style={styles.selectedFriendsList}
        />
      ) : (
        <View style={styles.emptySelection}>
          <Text style={styles.emptyText}>No members selected yet</Text>
          <Text style={styles.emptySubText}>Select at least 2 friends to create a group</Text>
        </View>
      )}

      <TouchableOpacity 
        style={[
          styles.button, 
          (isCreating || !groupName.trim() || selectedFriends.length < 2) && styles.disabledButton
        ]}
        onPress={handleCreateGroup}
        disabled={isCreating || !groupName.trim() || selectedFriends.length < 2}
      >
        {isCreating ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Create Group</Text>
        )}
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Members</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.searchInput}
                placeholder="Search friends..."
                placeholderTextColor="#666"
                value={searchText}
                onChangeText={setSearchText}
              />
              
              {isLoading ? (
                <ActivityIndicator size="large" color="#135CAF" style={styles.loader} />
              ) : (
                <FlatList
                  data={filteredFriends}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => {
                    console.log("Rendering friend item:", item.name, item._id);
                    return (
                      <TouchableOpacity
                        style={styles.friendItem}
                        onPress={() => toggleSelection(item)}
                      >
                        <View style={styles.friendInfo}>
                          <Image 
                            source={
                              item.avatar 
                                ? { uri: item.avatar.startsWith('http') ? item.avatar : `${API_URL}/uploads/${item.avatar}` }
                                : require("../../../assets/chat/avatar.png")
                            }
                            style={styles.avatar}
                          />
                          <View>
                            <Text style={styles.friendName}>{item.name}</Text>
                            <Text style={styles.friendEmail}>{item.email || 'No email'}</Text>
                          </View>
                        </View>
                        <Icon
                          name={
                            selectedFriends.some(f => f._id === item._id)
                              ? "checkbox-marked"
                              : "checkbox-blank-outline"
                          }
                          size={24}
                          color="#135CAF"
                        />
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={styles.emptyList}>
                      <Text style={styles.emptyListText}>
                        {searchText ? "No matching friends found" : "No friends available"}
                      </Text>
                      <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={loadFriends}
                      >
                        <Text style={styles.retryText}>Refresh</Text>
                      </TouchableOpacity>
                    </View>
                  }
                />
              )}
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#135CAF",
    paddingVertical: 15,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginRight: 30,
  },
  groupInfoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  groupAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#135CAF",
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    width: "100%",
    color: "#000",
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  addButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 16,
  },
  selectedFriendsList: {
    flex: 1,
    marginHorizontal: 20,
  },
  selectedFriend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedFriendInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  friendName: {
    fontSize: 16,
    color: "#000",
  },
  friendEmail: {
    fontSize: 12,
    color: "#666",
  },
  button: {
    backgroundColor: "#135CAF",
    padding: 15,
    borderRadius:
    8,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: "#000",
    backgroundColor: "#f9f9f9",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  closeButton: {
    backgroundColor: "#135CAF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  emptySelection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  emptyList: {
    padding: 20,
    alignItems: "center",
  },
  emptyListText: {
    fontSize: 16,
    color: "#666",
  },
  loader: {
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: "#135CAF",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 16,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default AddGroupScreen;
