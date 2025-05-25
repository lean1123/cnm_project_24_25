import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { contactService } from "../../services/contact.service";
import { searchUsers } from "../../services/user/userService";
import { 
  getSocket, 
  subscribeToChatEvents, 
  unsubscribeFromChatEvents,
  emitSendRequestContact,
  emitCancelRequestContact,
  emitRejectRequestContact,
  emitAcceptRequestContact 
} from "../../services/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config/constants";
import Footer from "../../components/Footer";
import { useNotification } from "../../components/NotificationManager";

const { width } = Dimensions.get("window");

const FriendsListScreen = ({ navigation }) => {
  const notification = useNotification();
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [friendSearchText, setFriendSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [isUnfriendModalVisible, setIsUnfriendModalVisible] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);


  useEffect(() => {
    const initializeSocket = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        
        // Setup socket event listeners using the new socket service
        console.log("[FriendsListScreen] Setting up socket event handlers");
        
        const chatEventHandlers = {
          // Friend request events
          onNewRequestContact: (data) => {
            console.log("[FriendsListScreen] Received new friend request:", data);
            fetchPendingRequests();
            notification.showFriendRequest(
              `${data.user?.firstName} ${data.user?.lastName} sent you a friend request`,
              "New Friend Request",
              {
                onPress: () => {
                  setActiveTab("requests");
                }
              }
            );
          },
          
          onAcceptRequestContact: (data) => {
            console.log("[FriendsListScreen] Friend request accepted:", data);
            fetchFriends();
            fetchOutgoingRequests();
            notification.showFriendAccept(
              "Your friend request was accepted",
              "Friend Request Accepted"
            );
          },
          
          onCancelRequestContact: (contactId) => {
            console.log("[FriendsListScreen] Friend request cancelled:", contactId);
            fetchPendingRequests();
            notification.showInfo(
              "A friend request has been cancelled",
              "Notification"
            );
          },
          
          onRejectRequestContact: (data) => {
            console.log("[FriendsListScreen] Friend request rejected:", data);
            fetchOutgoingRequests();
            if (data.name) {
              notification.showWarning(
                `${data.name} rejected your friend request`,
                "Friend Request Rejected"
              );
            }
          }
        };
        
        // Subscribe to events
        subscribeToChatEvents(chatEventHandlers);
      }
    };

    initializeSocket();
    fetchFriends();
    fetchPendingRequests();
    fetchOutgoingRequests();

    return () => {
      // Unsubscribe from all events when component unmounts
      unsubscribeFromChatEvents();
    };
  }, []);

  useEffect(() => {
    filterFriends(friendSearchText);
  }, [friends, friendSearchText]);

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      const response = await contactService.getMyContacts();
      const userDataStr = await AsyncStorage.getItem("userData");
      const currentUser = JSON.parse(userDataStr);

      console.log("fetchFriends response:", response);

      if (response.success) {
        const formattedFriends = (response.data || []).map((friend) => {
          const isCurrentUser = friend.user._id === currentUser._id;
          const friendData = isCurrentUser ? friend.contact : friend.user;

          return {
            ...friend,
            user: friendData || {}, // user ở đây luôn là bạn bè
            conversation: friend.conversation || friend._id, // Store conversation ID if available
            avatar: friendData?.avatar || null,
            name: friendData ? `${friendData.firstName} ${friendData.lastName}` : "Unknown User",
            isGroup: false,
          };
        });

        console.log("Formatted friends:", formattedFriends);
        setFriends(formattedFriends);
        setFilteredFriends(formattedFriends);
      } else {
        console.error("fetchFriends failed:", response.message);
        Alert.alert("Error", response.message || "Failed to fetch friends");
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      Alert.alert("Error", "Failed to fetch friends");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await contactService.getMyRequestContacts();
      if (response.success) {
        setPendingRequests(response.data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchOutgoingRequests = async () => {
    try {
      const response = await contactService.getMyPendingContacts();
      if (response.success) {
        setOutgoingRequests(response.data);
      }
    } catch (error) {
      console.error("Error fetching outgoing requests:", error);
    }
  };

  const handleNewFriendRequest = (data) => {
    console.log("New friend request received:", data);
    fetchPendingRequests();
  };

  const handleFriendRequestAccepted = (data) => {
    console.log("Friend request accepted:", data);
    fetchFriends();
  };

  const handleFriendRequestCancelled = (data) => {
    console.log("[Socket] Friend request cancelled event received:", data);

    if (data && data.contactId) {
      setPendingRequests((prev) =>
        prev.filter((req) => req._id !== data.contactId)
      );
    }

    Alert.alert("Notification", "A friend request has been cancelled");

    fetchPendingRequests();
  };

  const handleFriendRequestRejected = (data) => {
    console.log("[Socket] Friend request rejected:", data);
  };

  const filterFriends = useCallback(
    (searchText) => {
      console.log("Filtering friends with searchText:", searchText);
      if (!searchText.trim()) {
        setFilteredFriends(friends);
        return;
      }

      const filtered = friends.filter((friend) => {
        const fullName = friend.user
          ? `${friend.user.firstName || ""} ${
              friend.user.lastName || ""
            }`.toLowerCase()
          : "";
        const email = friend.user?.email?.toLowerCase() || "";
        const search = searchText.toLowerCase();
        return fullName.includes(search) || email.includes(search);
      });

      console.log("Filtered friends:", filtered);
      setFilteredFriends(filtered);
    },
    [friends]
  );

  const handleSearch = async () => {
    if (!searchText.trim()) {
      notification.showWarning("Please enter an email or name to search", "Error");
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchUsers(searchText);
      if (response.ok) {
        setSearchResults(response.data || []);
      } else {
        notification.showError(response.message || "Failed to search users", "Error");
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      setIsLoading(true);
      const response = await contactService.createContact(userId);
      
      if (response.success) {
        const contact = response.data;
        
        // Use the socket service to emit friend request event
        if (currentUser) {
          emitSendRequestContact(userId, contact);
        }
        
        notification.showSuccess("Friend request sent successfully", "Success");
        fetchOutgoingRequests();
      } else {
        notification.showError(response.message || "Failed to send friend request", "Error");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      notification.showError(error.message || "Failed to send friend request", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (contactId) => {
    try {
      const response = await contactService.acceptContact(contactId);
      
      if (response.success) {
        // Use the socket service to emit accept request event
        const contact = response.data;
        const conversationId = response.conversation || "";
        
        emitAcceptRequestContact(contact, conversationId);
        
        notification.showSuccess("Friend request accepted", "Success");
        fetchFriends();
        fetchPendingRequests();
      } else {
        notification.showError(response.message || "Failed to accept friend request", "Error");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      notification.showError(error.message || "Failed to accept friend request", "Error");
    }
  };

  const handleRejectRequest = async (contactId) => {
    try {
      setSelectedContactId(contactId);
      
      Alert.alert(
        "Reject Friend Request",
        "Are you sure you want to reject this friend request?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Reject",
            style: "destructive",
            onPress: async () => {
              try {
                const contact = pendingRequests.find(req => req._id === contactId);
                const receiverId = contact?.user?._id;
                const name = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "";
                
                const response = await contactService.rejectContact(contactId);
                
                if (response.success) {
                  // Use the socket service to emit reject request event
                  if (receiverId) {
                    emitRejectRequestContact(receiverId, name, contactId);
                  }
                  
                  notification.showSuccess("Friend request rejected", "Success");
                  fetchPendingRequests();
                } else {
                  notification.showError(response.message || "Failed to reject friend request", "Error");
                }
              } catch (error) {
                console.error("Error rejecting friend request:", error);
                notification.showError(error.message || "Failed to reject friend request", "Error");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      notification.showError(error.message || "Failed to reject friend request", "Error");
    }
  };

  const handleCancelRequest = async (contactId) => {
    try {
      setSelectedContactId(contactId);
      
      Alert.alert(
        "Cancel Friend Request",
        "Are you sure you want to cancel this friend request?",
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Yes",
            style: "destructive",
            onPress: async () => {
              try {
                const contact = outgoingRequests.find(req => req._id === contactId);
                const receiverId = contact?.contact?._id;
                
                const response = await contactService.cancelPendingContact(contactId);
                
                if (response.success) {
                  // Use the socket service to emit cancel request event
                  if (receiverId) {
                    emitCancelRequestContact(receiverId, contactId);
                  }
                  
                  notification.showSuccess("Friend request cancelled", "Success");
                  fetchOutgoingRequests();
                } else {
                  notification.showError(response.message || "Failed to cancel friend request", "Error");
                }
              } catch (error) {
                console.error("Error cancelling friend request:", error);
                notification.showError(error.message || "Failed to cancel friend request", "Error");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error cancelling friend request:", error);
      notification.showError(error.message || "Failed to cancel friend request", "Error");
    }
  };

  const handleUnfriend = async (contactId) => {
    try {
      Alert.alert(
        "Confirm Unfriend",
        "Are you sure you want to remove this friend?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Unfriend",
            style: "destructive",
            onPress: async () => {
              const response = await contactService.deleteContact(contactId);
              if (response.success) {
                fetchFriends();
                if (socket) {
                  socket.emit("unfriend", {
                    contactId,
                    userId: currentUser._id,
                  });
                }
                notification.showSuccess("Friend removed successfully", "Success");
              } else {
                notification.showError("Failed to remove friend", "Error");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error removing friend:", error);
      notification.showError("Failed to remove friend", "Error");
    }
  };

  const renderFriendItem = ({ item }) => {
    console.log("Rendering friend item:", item);
    const user = item.user || item.contact || {}; // Handle both user and contact
    return (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={async () => {
          try {
            setIsLoading(true);
            
            // Important: Always try to find the existing conversation first
            const response = await contactService.getConversationWithUser(user._id);
            
            if (response.success && response.data) {
              console.log(`Found existing conversation: ${response.data._id}`);
              // Use the returned conversation data
              const conversationData = {
                _id: response.data._id,
                name: item.name || `${user.firstName} ${user.lastName}`,
                user: user,
                isGroup: response.data.isGroup || false,
                members: response.data.members || [
                  { user: currentUser },
                  { user: user }
                ],
                avatar: user.avatar
              };
              
              navigation.navigate("ChatDetail", { conversation: conversationData });
            } 
            // If no conversation found, fallback to conversation ID in contact data
            else if (item.conversation) {
              console.log(`Using conversation ID from contact: ${item.conversation}`);
              const conversationData = {
                _id: item.conversation,
                name: item.name || `${user.firstName} ${user.lastName}`,
                user: user,
                isGroup: item.isGroup || false,
                members: item.members || [
                  { user: currentUser },
                  { user: user }
                ],
                avatar: user.avatar
              };
              
              navigation.navigate("ChatDetail", { conversation: conversationData });
            } 
            // Last resort fallback
            else {
              console.log(`No conversation found, using contact ID: ${item._id}`);
              const conversationData = {
                _id: item._id,
                name: item.name || `${user.firstName} ${user.lastName}`,
                user: user,
                isGroup: false,
                members: [
                  { user: currentUser },
                  { user: user }
                ],
                avatar: user.avatar
              };
              
              navigation.navigate("ChatDetail", { conversation: conversationData });
            }
          } catch (error) {
            console.error("Error getting conversation:", error);
            
            // Fallback navigation with basic data
            const conversationData = {
              _id: item._id,
              name: item.name || `${user.firstName} ${user.lastName}`,
              user: user,
              isGroup: false,
              members: [
                { user: currentUser },
                { user: user }
              ],
              avatar: user.avatar
            };
            
            navigation.navigate("ChatDetail", { conversation: conversationData });
          } finally {
            setIsLoading(false);
          }
        }}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={
              user.avatar
                ? {
                    uri: user.avatar.startsWith("http")
                      ? user.avatar
                      : `${API_URL}/uploads/${user.avatar}`,
                  }
                : require("../../../assets/chat/avatar.png")
            }
            style={styles.avatar}
          />
          {user.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.friendInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>
              {user.firstName
                ? `${user.firstName} ${user.lastName || ""}`
                : "Unknown User"}
            </Text>
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => handleUnfriend(item._id)}
            >
              <Icon name="dots-horizontal" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.lastSeen}>
            {user.isOnline ? "Active now" : "Offline"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <View style={styles.avatarContainer}>
        <Image
          source={
            item.user?.avatar
              ? { uri: item.user.avatar }
              : require("../../../assets/chat/avatar.png")
          }
          style={styles.avatar}
        />
      </View>
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>
          {item.user
            ? `${item.user.firstName} ${item.user.lastName}`
            : "Unknown User"}
        </Text>
        <Text style={styles.requestEmail}>
          {item.user?.email || "No email"}
        </Text>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.requestButton, styles.acceptButton]}
            onPress={() => handleAcceptRequest(item._id)}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.requestButton, styles.declineButton]}
            onPress={() => handleRejectRequest(item._id)}
          >
            <Text style={[styles.buttonText, styles.declineText]}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderOutgoingRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <View style={styles.avatarContainer}>
        <Image
          source={
            item.contact?.avatar
              ? { uri: item.contact.avatar }
              : require("../../../assets/chat/avatar.png")
          }
          style={styles.avatar}
        />
      </View>
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>
          {item.contact
            ? `${item.contact.firstName} ${item.contact.lastName}`
            : "Unknown User"}
        </Text>
        <Text style={styles.requestEmail}>
          {item.contact?.email || "No email"}
        </Text>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.requestButton, styles.declineButton]}
            onPress={() => handleCancelRequest(item._id)}
          >
            <Text style={[styles.buttonText, styles.declineText]}>
              Cancel Request
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSearchItem = ({ item }) => {
    // Find existing friend relationship, looking specifically for the contact with conversation info
    const existingFriend = friends.find(
      (friend) =>
        friend.user?._id === item._id || friend.contact?._id === item._id
    );
    
    // Log relevant debugging information
    console.log("Search item:", item.firstName, item.lastName);
    console.log("Existing friend found:", existingFriend ? "Yes" : "No");
    if (existingFriend) {
      console.log("Conversation ID:", existingFriend.conversation);
    }

    return (
      <View style={styles.searchItem}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              item.avatar
                ? {
                    uri: item.avatar.startsWith("http")
                      ? item.avatar
                      : `${API_URL}/Uploads/${item.avatar}`,
                  }
                : require("../../../assets/chat/avatar.png")
            }
            style={styles.avatar}
          />
        </View>
        <View style={styles.searchInfo}>
          <Text style={styles.searchName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.searchEmail}>{item.email}</Text>
        </View>
        {existingFriend ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={async () => {
              try {
                setIsLoading(true);
                console.log(`Navigating to chat with user from search: ${item.firstName} ${item.lastName}`);
                
                // Find the existing conversation between these users
                const response = await contactService.getConversationWithUser(item._id);
                
                if (response.success && response.data) {
                  console.log(`Found conversation: ${response.data._id}`);
                  // Use the returned conversation data
                  const conversationData = {
                    _id: response.data._id,
                    name: `${item.firstName} ${item.lastName}`,
                    user: item,
                    isGroup: response.data.isGroup || false,
                    members: response.data.members || [
                      { user: currentUser },
                      { user: item }
                    ],
                    avatar: item.avatar
                  };
                  
                  navigation.navigate("ChatDetail", {
                    conversation: conversationData
                  });
                } else {
                  console.log("No conversation found, using existing friend data");
                  // Use conversation ID from friend data if available
                  const conversationId = existingFriend.conversation || 
                                        existingFriend.conversationId || 
                                        existingFriend._id;
                  
                  console.log(`Using conversation ID: ${conversationId}`);
                  
                  const conversationData = {
                    _id: conversationId,
                    name: `${item.firstName} ${item.lastName}`,
                    user: item,
                    isGroup: false,
                    members: [
                      { user: currentUser },
                      { user: item }
                    ],
                    avatar: item.avatar
                  };
                  
                  navigation.navigate("ChatDetail", {
                    conversation: conversationData
                  });
                }
              } catch (error) {
                console.error("Error getting conversation:", error);
                
                Alert.alert(
                  "Connection Issue",
                  "Could not find your conversation. Using basic information instead.",
                  [
                    {
                      text: "Continue",
                      onPress: () => {
                        // Fallback with basic data
                        const conversationData = {
                          _id: existingFriend.conversation || existingFriend.conversationId || existingFriend._id,
                          name: `${item.firstName} ${item.lastName}`,
                          user: item,
                          isGroup: false,
                          members: [
                            { user: currentUser },
                            { user: item }
                          ],
                          avatar: item.avatar
                        };
                        
                        navigation.navigate("ChatDetail", {
                          conversation: conversationData
                        });
                      }
                    }
                  ]
                );
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <Icon name="message-text" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={() => handleAddFriend(item._id)}
          >
            <Icon name="account-plus" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#135CAF" barStyle="light-content" />
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contacts</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                if (activeTab === "search") {
                  handleSearch();
                } else {
                  setActiveTab("search");
                }
              }}
            >
              <Icon name="account-plus" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate("AddGroupScreen")}
            >
              <Icon name="account-group" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Icon
            name="magnify"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeTab === "friends"
                ? "Search friends..."
                : "Search by email or name"
            }
            value={activeTab === "friends" ? friendSearchText : searchText}
            onChangeText={
              activeTab === "friends" ? setFriendSearchText : setSearchText
            }
            onSubmitEditing={activeTab === "search" ? handleSearch : null}
            placeholderTextColor="#999"
          />
          {activeTab === "search" && (
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "friends" && styles.activeTab]}
            onPress={() => setActiveTab("friends")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "friends" && styles.activeTabText,
              ]}
            >
              Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "requests" && styles.activeTab]}
            onPress={() => setActiveTab("requests")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "requests" && styles.activeTabText,
              ]}
            >
              Requests{" "}
              {pendingRequests.length > 0 ? `(${pendingRequests.length})` : ""}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "outgoing" && styles.activeTab]}
            onPress={() => setActiveTab("outgoing")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "outgoing" && styles.activeTabText,
              ]}
            >
              Sent{" "}
              {outgoingRequests.length > 0
                ? `(${outgoingRequests.length})`
                : ""}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "search" && styles.activeTab]}
            onPress={() => setActiveTab("search")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "search" && styles.activeTabText,
              ]}
            >
              Find
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#135CAF" />
          </View>
        ) : (
          <FlatList
            data={
              activeTab === "friends"
                ? filteredFriends
                : activeTab === "requests"
                ? pendingRequests
                : activeTab === "outgoing"
                ? outgoingRequests
                : searchResults
            }
            renderItem={
              activeTab === "friends"
                ? renderFriendItem
                : activeTab === "requests"
                ? renderRequestItem
                : activeTab === "outgoing"
                ? renderOutgoingRequestItem
                : renderSearchItem
            }
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Icon
                  name={
                    activeTab === "friends"
                      ? "account-group"
                      : activeTab === "requests"
                      ? "account-clock"
                      : activeTab === "outgoing"
                      ? "account-arrow-right"
                      : "account-search"
                  }
                  size={50}
                  color="#ccc"
                />
                <Text style={styles.emptyText}>
                  {activeTab === "friends"
                    ? friendSearchText
                      ? "No friends found"
                      : "No friends yet"
                    : activeTab === "requests"
                    ? "No pending requests"
                    : activeTab === "outgoing"
                    ? "No outgoing requests"
                    : searchText
                    ? "No users found"
                    : "Search for friends"}
                </Text>
              </View>
            )}
          />
        )}
      </View>
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mainContainer: {
    flex: 1,
    marginBottom: 55,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#135CAF",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 25,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
    height: "100%",
  },
  searchButton: {
    backgroundColor: "#135CAF",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#135CAF",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#135CAF",
    fontWeight: "600",
  },
  friendItem: {
    flexDirection: "row",
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f0f0f0",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  lastSeen: {
    fontSize: 13,
    color: "#666",
  },
  moreButton: {
    padding: 4,
  },
  requestItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 1,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  requestName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  requestEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  requestActions: {
    flexDirection: "row",
    gap: 12,
  },
  requestButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: "#135CAF",
  },
  declineButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  declineText: {
    color: "#666",
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  searchInfo: {
    flex: 1,
    marginLeft: 12,
  },
  searchName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  searchEmail: {
    fontSize: 14,
    color: "#666",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  messageButton: {
    backgroundColor: "#135CAF",
  },
  addButton: {
    backgroundColor: "#4CAF50",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
});

export default FriendsListScreen;
