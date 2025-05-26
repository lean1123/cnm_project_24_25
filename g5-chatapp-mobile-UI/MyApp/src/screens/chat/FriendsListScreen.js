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
import useChatStore from "../../store/useChatStore";
import UserProfileModal from "../../components/UserProfileModal";
import { Menu, Divider, Provider as PaperProvider } from 'react-native-paper';

const { width } = Dimensions.get("window");

// Language data for online/offline status
const languageData = {
  en: {
    online: "",
    offline: "",
    viewProfile: "View Profile",
    unfriend: "Unfriend",
    searchFriendsPlaceholder: "Search friends...",
    searchUserPlaceholder: "Search by email or name",
    friendsTab: "Friends",
    requestsTab: "Requests",
    sentTab: "Sent",
    searchTab: "Search",
    noFriendsFound: "No friends found",
    noFriendsYet: "No friends yet",
    noRequests: "No requests",
    noSentRequests: "No sent requests",
    searchForFriends: "Search for friends",
    error: "Error",
    success: "Success",
    confirmUnfriendTitle: "Confirm Unfriend",
    confirmUnfriendMessage: "Are you sure you want to unfriend {name}? This action will also delete your conversation.",
    cancel: "Cancel",
    unfriendButton: "Unfriend",
    friendRequestSent: "Friend request sent successfully",
    failedToSendRequest: "Failed to send friend request",
    requestAccepted: "Friend request accepted",
    failedToAcceptRequest: "Failed to accept friend request",
    requestRejected: "Friend request rejected",
    failedToRejectRequest: "Failed to reject friend request",
    requestCancelled: "Sent request cancelled",
    failedToCancelRequest: "Failed to cancel sent request",
    unfriendedSuccessfully: "Unfriended successfully",
    failedToUnfriend: "Failed to unfriend",
    friendRemovedNotification: "A friend has been removed.",
    userNotAuthenticated: "User not authenticated. Please log in again.",
    validationError: "Validation Error",
    enterNameToSearch: "Please enter email or name to search.",
    cannotFindUser: "Cannot find user.",
    unexpectedSearchError: "An unexpected error occurred during search.",
    cannotShowUserInfo: "Cannot show user information.",
    conversationErrorTitle: "Connection Issue",
    conversationErrorMessage: "Could not find your conversation. Using basic information instead.",
    continue: "Continue",
    contactsTitle: "Contacts",
  },
  vi: {
    online: "",
    offline: "",
    viewProfile: "Xem trang cá nhân",
    unfriend: "Hủy kết bạn",
    searchFriendsPlaceholder: "Tìm bạn bè...",
    searchUserPlaceholder: "Tìm bằng email hoặc tên",
    friendsTab: "Bạn bè",
    requestsTab: "Lời mời",
    sentTab: "Đã gửi",
    searchTab: "Tìm kiếm",
    noFriendsFound: "Không tìm thấy bạn bè",
    noFriendsYet: "Chưa có bạn bè nào",
    noRequests: "Không có lời mời nào",
    noSentRequests: "Chưa gửi lời mời nào",
    searchForFriends: "Tìm kiếm bạn bè",
    error: "Lỗi",
    success: "Thành công",
    confirmUnfriendTitle: "Xác nhận hủy kết bạn",
    confirmUnfriendMessage: "Bạn có chắc chắn muốn hủy kết bạn với {name}? Hành động này cũng sẽ xóa cuộc trò chuyện của bạn.",
    cancel: "Hủy bỏ",
    unfriendButton: "Hủy kết bạn",
    friendRequestSent: "Gửi lời mời kết bạn thành công",
    failedToSendRequest: "Gửi lời mời kết bạn thất bại",
    requestAccepted: "Chấp nhận lời mời thành công",
    failedToAcceptRequest: "Chấp nhận lời mời thất bại",
    requestRejected: "Từ chối lời mời thành công",
    failedToRejectRequest: "Từ chối lời mời thất bại",
    requestCancelled: "Hủy lời mời đã gửi thành công",
    failedToCancelRequest: "Hủy lời mời thất bại",
    unfriendedSuccessfully: "Đã hủy kết bạn thành công.",
    failedToUnfriend: "Không thể hủy kết bạn",
    friendRemovedNotification: "Một người bạn đã bị xóa.",
    userNotAuthenticated: "Người dùng chưa xác thực. Vui lòng đăng nhập lại.",
    validationError: "Lỗi xác thực",
    enterNameToSearch: "Vui lòng nhập email hoặc tên để tìm kiếm.",
    cannotFindUser: "Không thể tìm người dùng.",
    unexpectedSearchError: "Đã có lỗi không mong muốn xảy ra trong quá trình tìm kiếm.",
    cannotShowUserInfo: "Không thể hiển thị thông tin người dùng.",
    conversationErrorTitle: "Sự cố kết nối",
    conversationErrorMessage: "Không thể tìm thấy cuộc trò chuyện của bạn. Sử dụng thông tin cơ bản thay thế.",
    continue: "Tiếp tục",
    contactsTitle: "Danh bạ",
  },
};

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
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [isUnfriendModalVisible, setIsUnfriendModalVisible] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const { clearMessages: clearConversationMessages } = useChatStore();

  // State for UserProfileModal
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState(null);

  // State for individual friend item menu
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [selectedFriendForMenu, setSelectedFriendForMenu] = useState(null);

  const [onlineUsers, setOnlineUsers] = useState(new Set()); // To track online user IDs from sockets
  const [currentLanguage, setCurrentLanguage] = useState("vi"); // Default to Vietnamese

  const getText = (key, params = {}) => {
    let text = languageData[currentLanguage][key] || languageData['en'][key] || key;
    Object.keys(params).forEach(paramKey => {
      text = text.replace(`{${paramKey}}`, params[paramKey]);
    });
    return text;
  };

  useEffect(() => {
    const initializeSocket = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        
        const currentSocket = getSocket();
        if (currentSocket) {
          currentSocket.off("contactDeleted");
          currentSocket.on("contactDeleted", (data) => {
            console.log("[FriendsListScreen] Received contactDeleted event:", data);
            if (data && data.contactId) {
              setFriends((prevFriends) => prevFriends.filter(f => f._id !== data.contactId && f.user?._id !== data.contactId && f.contact?._id !== data.contactId ));
              setFilteredFriends((prevFriends) => prevFriends.filter(f => f._id !== data.contactId && f.user?._id !== data.contactId && f.contact?._id !== data.contactId));
            }
            if (data && data.conversationId) {
              clearConversationMessages(data.conversationId);
            }
            notification.showInfo(getText("friendRemovedNotification"), getText("success"));
          });

          // Listen for user status changes
          currentSocket.off('userStatusChanged'); // Remove previous listener if any
          currentSocket.on('userStatusChanged', (data) => {
            console.log("[FriendsListScreen] Received userStatusChanged event:", data);
            if (data && data.userId) {
              setFriends(prevFriends => 
                prevFriends.map(friend => 
                  friend.user?._id === data.userId 
                    ? { ...friend, user: { ...friend.user, isOnline: data.isOnline } } 
                    : friend
                )
              );
              setFilteredFriends(prevFiltered => 
                prevFiltered.map(friend => 
                  friend.user?._id === data.userId 
                    ? { ...friend, user: { ...friend.user, isOnline: data.isOnline } } 
                    : friend
                )
              );
              // Also update the onlineUsers set for quick checks if needed elsewhere
              setOnlineUsers(prevOnlineUsers => {
                const newOnlineUsers = new Set(prevOnlineUsers);
                if (data.isOnline) {
                  newOnlineUsers.add(data.userId);
                } else {
                  newOnlineUsers.delete(data.userId);
                }
                return newOnlineUsers;
              });
            }
          });
        }
        
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
              getText("requestAccepted"),
              getText("success")
            );
          },
          
          onCancelRequestContact: (contactId) => {
            console.log("[Socket] Friend request cancelled:", contactId);
            fetchPendingRequests();
            notification.showInfo(
              getText("requestCancelled"),
              "Notification"
            );
          },
          
          onRejectRequestContact: (data) => {
            console.log("[Socket] Friend request rejected:", data);
            fetchOutgoingRequests();
            if (data.name) {
              notification.showWarning(
                `${data.name} ${getText("requestRejected")}`,
                getText("success")
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
      const currentSocket = getSocket();
      if (currentSocket) {
        currentSocket.off("contactDeleted");
        currentSocket.off("userStatusChanged");
      }
      // unsubscribeFromChatEvents();
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
      const localCurrentUser = JSON.parse(userDataStr);

      console.log("fetchFriends response:", response);

      if (response.success) {
        const formattedFriends = (response.data || []).map((friend) => {
          const isCurrentUserRelation = friend.user._id === localCurrentUser._id;
          const friendData = isCurrentUserRelation ? friend.contact : friend.user;
          
          // Ensure friendData and its properties exist, and merge with initial online status
          const populatedFriendData = friendData || {};

          return {
            ...friend,
            user: {
              ...populatedFriendData,
              // Assume backend provides friendData.isOnline or default to false
              isOnline: populatedFriendData.isOnline || false 
            },
            avatar: populatedFriendData.avatar || null,
            name: populatedFriendData ? `${populatedFriendData.firstName || ''} ${populatedFriendData.lastName || ''}`.trim() : "Unknown User",
            isGroup: false,
          };
        });

        console.log("Formatted friends:", formattedFriends);
        setFriends(formattedFriends);
        setFilteredFriends(formattedFriends);
      } else {
        console.error("fetchFriends failed:", response.message);
        Alert.alert(getText("error"), response.message || getText("failedToLoadFriends"));
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      Alert.alert(getText("error"), getText("failedToLoadFriends"));
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

    Alert.alert(getText("success"), getText("requestCancelled"));

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
    if (!currentUser) {
      notification.showError(getText("userNotAuthenticated"), getText("validationError"));
      setIsSearching(false);
      return;
    }
    if (!searchText.trim()) {
      notification.showWarning(getText("enterNameToSearch"), getText("error"));
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchUsers(searchText);
      if (response.ok) {
        setSearchResults(response.data || []);
      } else {
        notification.showError(response.message || getText("cannotFindUser"), getText("error"));
      }
    } catch (error) {
      console.error("Search error:", error);
      notification.showError(error.message || getText("unexpectedSearchError"), getText("error")); // More generic error
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
        
        notification.showSuccess(getText("friendRequestSent"), getText("success"));
        fetchOutgoingRequests();
      } else {
        notification.showError(response.message || getText("failedToSendRequest"), getText("error"));
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      notification.showError(error.message || getText("failedToSendRequest"), getText("error"));
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
        
        notification.showSuccess(getText("requestAccepted"), getText("success"));
        fetchFriends();
        fetchPendingRequests();
      } else {
        notification.showError(response.message || getText("failedToAcceptRequest"), getText("error"));
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      notification.showError(error.message || getText("failedToAcceptRequest"), getText("error"));
    }
  };

  const handleRejectRequest = async (contactId) => {
    try {
      setSelectedContactId(contactId);
      
      Alert.alert(
        getText("requestRejected"),
        getText("confirmUnfriendMessage", { name: pendingRequests.find(req => req._id === contactId)?.user?.firstName || "this user" }),
        [
          {
            text: getText("cancel"),
            style: "cancel",
          },
          {
            text: getText("requestRejected"),
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
                  
                  notification.showSuccess(getText("requestRejected"), getText("success"));
                  fetchPendingRequests();
                } else {
                  notification.showError(response.message || getText("failedToRejectRequest"), getText("error"));
                }
              } catch (error) {
                console.error("Error rejecting friend request:", error);
                notification.showError(error.message || getText("failedToRejectRequest"), getText("error"));
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      notification.showError(error.message || getText("failedToRejectRequest"), getText("error"));
    }
  };

  const handleCancelRequest = async (contactId) => {
    try {
      setSelectedContactId(contactId);
      
      Alert.alert(
        getText("requestCancelled"),
        "Bạn có chắc muốn hủy lời mời kết bạn đã gửi?",
        [
          {
            text: "Không",
            style: "cancel",
          },
          {
            text: "Có",
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
                  
                  notification.showSuccess(getText("requestCancelled"), getText("success"));
                  fetchOutgoingRequests();
                } else {
                  notification.showError(response.message || getText("failedToCancelRequest"), getText("error"));
                }
              } catch (error) {
                console.error("Error cancelling friend request:", error);
                notification.showError(error.message || getText("failedToCancelRequest"), getText("error"));
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error cancelling friend request:", error);
      notification.showError(error.message || getText("failedToCancelRequest"), getText("error"));
    }
  };

  const handleUnfriend = async (contactIdToUnfriend, contactName) => {
    try {
      Alert.alert(
        getText("confirmUnfriendTitle"),
        getText("confirmUnfriendMessage", { name: contactName }),        [
          {
            text: getText("cancel"),
            style: "cancel",
          },
          {
            text: getText("unfriendButton"),
            style: "destructive",
            onPress: async () => {
              try {
                const response = await contactService.deleteContact(contactIdToUnfriend);
                if (response.success) {
                  notification.showSuccess(response.message || getText("unfriendedSuccessfully"));
                  // UI update will be handled by the 'contactDeleted' socket event listener
                } else {
                  notification.showError(response.message || getText("failedToUnfriend"));
                }
              } catch (innerError) {
                console.error("Error during unfriend confirmation:", innerError);
                notification.showError(innerError.message || getText("failedToUnfriend"));
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error initiating unfriend:", error);
      notification.showError(getText("failedToUnfriend"));
    }
  };

  const openMenu = (event, friendItem) => {
    const { nativeEvent } = event;
    setMenuAnchor({ x: nativeEvent.pageX, y: nativeEvent.pageY });
    setSelectedFriendForMenu(friendItem); // Store the whole friend item
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedFriendForMenu(null);
  };

  const handleViewProfile = () => {
    if (selectedFriendForMenu) {
      // The actual user object with full details is expected to be in selectedFriendForMenu.user
      const userToView = selectedFriendForMenu.user;
      console.log("[FriendsListScreen] Attempting to view profile for:", JSON.stringify(userToView, null, 2));
      
      if (userToView && userToView._id) { // Ensure userToView is valid and has an ID
        setSelectedUserForProfile(userToView);
        setProfileModalVisible(true);
        console.log("[FriendsListScreen] setProfileModalVisible set to true. selectedUserForProfile:", JSON.stringify(userToView, null, 2));
      } else {
        console.warn("[FriendsListScreen] No valid user data found in selectedFriendForMenu.user to display profile.");
        notification.showError(getText("cannotShowUserInfo"), getText("error"));
      }
    } else {
      console.warn("[FriendsListScreen] handleViewProfile called without selectedFriendForMenu.");
    }
    closeMenu();
  };

  const handleUnfriendFromMenu = () => {
    if (selectedFriendForMenu) {
      const userToUnfriend = selectedFriendForMenu.user || selectedFriendForMenu.contact || {};
      const contactName = `${userToUnfriend.firstName || ''} ${userToUnfriend.lastName || ''}`.trim() || "this user";
      handleUnfriend(selectedFriendForMenu._id, contactName); // Pass contact ID and name
    }
    closeMenu();
  };

  const renderFriendItem = ({ item }) => {
    console.log("Rendering friend item:", item);
    const user = item.user || item.contact || {}; // Handle both user and contact
    return (
      <TouchableOpacity
        style={styles.friendItemContainer}
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
          {/* Display online indicator based on user.isOnline */}
          <View 
            style={[
              styles.onlineIndicatorBadge, 
              user.isOnline ? styles.onlineBadge : styles.offlineBadge
            ]} 
          />
        </View>
        <View style={styles.friendInfo}>
          <View style={styles.nameAndMenuContainer}>
            <Text style={styles.name}>
              {user.firstName
                ? `${user.firstName} ${user.lastName || ""}`.trim()
                : "Unknown User"}
            </Text>
            <TouchableOpacity onPress={(event) => openMenu(event, item)} style={styles.moreButton}>
                 <Icon name="dots-horizontal" size={24} color="#555" />
            </TouchableOpacity>
          </View>
          
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
                  getText("conversationErrorTitle"),
                  getText("conversationErrorMessage"),
                  [
                    {
                      text: getText("continue"),
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
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#135CAF" barStyle="light-content" />
        <View style={styles.mainContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{getText("contactsTitle")}</Text>
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
                  ? getText("searchFriendsPlaceholder")
                  : getText("searchUserPlaceholder")
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
                  <Text style={styles.searchButtonText}>Tìm kiếm</Text>
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
                {getText("friendsTab")}
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
                {getText("requestsTab")} {pendingRequests.length > 0 ? `(${pendingRequests.length})` : ""}
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
                {getText("sentTab")} {outgoingRequests.length > 0 ? `(${outgoingRequests.length})` : ""}
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
                {getText("searchTab")} 
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
                        ? getText("noFriendsFound")
                        : getText("noFriendsYet")
                      : activeTab === "requests"
                      ? getText("noRequests")
                      : activeTab === "outgoing"
                      ? getText("noSentRequests")
                      : searchText
                      ? getText("cannotFindUser")
                      : getText("searchForFriends")}
                  </Text>
                </View>
              )}
            />
          )}
        </View>

        {selectedFriendForMenu && (
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={menuAnchor}
          >
            <Menu.Item onPress={handleViewProfile} title={getText("viewProfile")} icon="account-details" />
            <Divider />
            <Menu.Item onPress={handleUnfriendFromMenu} title={getText("unfriend")} titleStyle={{ color: 'red' }} icon="account-remove" />
          </Menu>
        )}

        {selectedUserForProfile && (
          <UserProfileModal 
            visible={profileModalVisible} 
            onClose={() => setProfileModalVisible(false)} 
            user={selectedUserForProfile} 
          />
        )}
      </SafeAreaView>
      <Footer />
    </PaperProvider>
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
    marginTop: 10,
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
  friendItemContainer: {
    flexDirection: "row",
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E9E9E9",
  },
  onlineIndicatorBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  onlineBadge: {
    backgroundColor: "#4CAF50",
  },
  offlineBadge: {
    backgroundColor: "#BDBDBD",
  },
  friendInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameAndMenuContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#212121",
  },
  statusText: {
    fontSize: 13,
    color: "#757575",
  },
  onlineText: {
    color: "#4CAF50",
    fontWeight: '500',
  },
  offlineText: {
    color: "#757575",
  },
  moreButton: {
    padding: 8,
    marginLeft: 8,
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
    paddingBottom: 30,
  },
});

export default FriendsListScreen;
