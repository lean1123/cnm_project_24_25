import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../config/axiosInstance";
import { formatDistanceToNow } from "date-fns";
import { getSocket, initSocket } from "../../services/socket";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  const renderLastMessage = (lastMessage) => {
    if (!lastMessage) return "Bắt đầu cuộc trò chuyện!";

    const isMyMessage = lastMessage.sender._id === userId;
    let prefix = isMyMessage ? "Bạn: " : "";

    // Check if it's a location message either by content format or isLocation flag
    const isLocationMessage =
      (lastMessage.content &&
        /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(lastMessage.content)) ||
      lastMessage.isLocation;
    if (isLocationMessage) {
      return `${prefix}Đã chia sẻ vị trí`;
    }

    switch (lastMessage.type) {
      case "IMAGE":
        if (lastMessage.files && lastMessage.files.length > 1) {
          return `${prefix}Đã gửi ${lastMessage.files.length} ảnh`;
        }
        return `${prefix}Đã gửi một ảnh`;
      case "VIDEO":
        return `${prefix}Đã gửi một video`;
      case "FILE":
        if (lastMessage.files && lastMessage.files.length > 1) {
          return `${prefix}Đã gửi ${lastMessage.files.length} tệp`;
        }
        return `${prefix}Đã gửi ${lastMessage.files[0].fileName}`;
      case "AUDIO":
        return `${prefix}Đã gửi tin nhắn thoại`;
      case "LOCATION":
        return `${prefix}Đã chia sẻ vị trí`;
      case "CONTACT":
        return `${prefix}Đã chia sẻ liên hệ`;
      case "STICKER":
        return `${prefix}Đã gửi nhãn dán`;
      case "REACT":
        return `${prefix}Đã thả ${lastMessage.content}`;
      case "CALL":
        return `Cuộc gọi ${lastMessage.content}`;
      case "AUDIO":
        return `${prefix}Đã gửi tin nhắn thoại`;
      default:
        return `${prefix}${lastMessage.content}`;
    }
  };

  const updateConversationWithNewMessage = (
    conversationId,
    message,
    senderId
  ) => {
    setConversations((prevConversations) => {
      // Find the conversation to update
      const conversationToUpdate = prevConversations.find(
        (c) => c._id === conversationId
      );
      if (!conversationToUpdate) return prevConversations;

      // Remove the conversation from the list
      const otherConversations = prevConversations.filter(
        (c) => c._id !== conversationId
      );

      // Create updated conversation
      const updatedConversation = {
        ...conversationToUpdate,
        lastMessage: message,
        lastMessageTime: message.createdAt,
        // Increment unread count only if the sender is not the current user
        unreadCount:
          senderId !== userId
            ? conversationToUpdate.unreadCount + 1
            : conversationToUpdate.unreadCount,
      };

      // Return new array with updated conversation at the beginning
      return [updatedConversation, ...otherConversations];
    });
  };

  const fetchConversations = async () => {
    try {
      const response = await axiosInstance.get("/conversation/my-conversation");

      if (!response.data || !response.data.data) {
        throw new Error("Invalid response format");
      }

      const userData = await AsyncStorage.getItem("userData");
      const currentUser = userData ? JSON.parse(userData) : null;
      const currentUserId = currentUser?._id || currentUser?.id;

      const processedConversations = response.data.data.map((conv) => {
        const otherUser = conv.members.find(
          (member) => member._id !== currentUserId
        );

        return {
          _id: conv._id,
          name: conv.isGroup
            ? conv.name
            : otherUser
            ? `${otherUser.firstName} ${otherUser.lastName}`
            : "Unknown User",
          avatar: conv.isGroup ? conv.avatar : otherUser?.avatar,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessage?.createdAt,
          unreadCount: conv.unreadCount || 0,
          members: conv.members,
          isGroup: conv.isGroup || false,
          isOnline: otherUser?.isOnline || false,
          otherUserId: otherUser?._id,
        };
      });

      // Sort conversations by last message time and unread count
      const sortedConversations = processedConversations.sort((a, b) => {
        // First sort by unread count
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
        if (a.unreadCount === 0 && b.unreadCount > 0) return 1;

        // Then sort by last message time
        const timeA = a.lastMessageTime
          ? new Date(a.lastMessageTime)
          : new Date(0);
        const timeB = b.lastMessageTime
          ? new Date(b.lastMessageTime)
          : new Date(0);
        return timeB - timeA;
      });

      setConversations(sortedConversations);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      Alert.alert("Error", "Failed to load conversations");
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user._id || user.id);
        }
        await fetchConversations();
      } catch (error) {
        console.error("Error initializing:", error);
        setLoading(false);
      }
    };

    initializeData();

    const refreshInterval = setInterval(() => {
      if (!refreshing) {
        fetchConversations();
      }
    }, 2000);

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      const handleNewMessage = async (data) => {
        console.log("New message received:", data);
        if (data.conversationId && data.message) {
          updateConversationWithNewMessage(
            data.conversationId,
            data.message,
            data.message.sender
          );
        }
      };

      const handleMessageRead = (data) => {
        if (data.conversationId) {
          setConversations((prevConversations) => {
            const updatedConversations = prevConversations.map((conv) =>
              conv._id === data.conversationId
                ? { ...conv, unreadCount: 0 }
                : conv
            );
            return [...updatedConversations]; // Create new array to trigger re-render
          });
        }
      };

      const handleUserOnlineStatus = ({ userId: targetUserId, isOnline }) => {
        console.log("User online status update:", targetUserId, isOnline);
        setConversations((prevConversations) => {
          const updatedConversations = prevConversations.map((conv) => {
            // Check if this conversation involves the user whose status changed
            if (conv.otherUserId === targetUserId) {
              return {
                ...conv,
                isOnline: isOnline,
              };
            }
            return conv;
          });
          return [...updatedConversations]; // Create new array to trigger re-render
        });
      };

      socket.on("newMessage", handleNewMessage);
      socket.on("messageRead", handleMessageRead);
      socket.on("userOnline", handleUserOnlineStatus);
      socket.on("userOffline", (data) =>
        handleUserOnlineStatus({ ...data, isOnline: false })
      );

      return () => {
        socket.off("newMessage", handleNewMessage);
        socket.off("messageRead", handleMessageRead);
        socket.off("userOnline", handleUserOnlineStatus);
        socket.off("userOffline");
      };
    }
  }, [userId]); // Add userId as dependency

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      initSocket(userId);
    }
  }, [userId]);

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.friendItem,
        item.unreadCount > 0 && styles.unreadConversation,
      ]}
      onPress={() => {
        // Reset unread count when entering the conversation
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv._id === item._id ? { ...conv, unreadCount: 0 } : conv
          )
        );
        navigation.navigate("ChatDetail", { conversation: item });
      }}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={
            item.avatar
              ? { uri: item.avatar }
              : require("../../../assets/chat/avatar.png")
          }
          style={styles.avatar}
        />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text
            style={[
              styles.friendName,
              item.unreadCount > 0 && styles.unreadName,
            ]}
          >
            {item.name}
          </Text>
          {item.lastMessageTime && (
            <Text
              style={[
                styles.timeText,
                item.unreadCount > 0 && styles.unreadTime,
              ]}
            >
              {formatDistanceToNow(new Date(item.lastMessageTime), {
                addSuffix: true,
              })}
            </Text>
          )}
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {renderLastMessage(item.lastMessage)}
          </Text>
          {item.unreadCount > 0 && (
            <View
              style={[
                styles.unreadBadge,
                item.unreadCount > 9 && styles.unreadBadgePlus,
              ]}
            >
              <Text style={styles.unreadText}>
                {item.unreadCount > 9 ? "9+" : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#135CAF" />
        </View>
        <Footer />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item._id}
        style={styles.friendList}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchConversations();
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={64}
              color="#666"
            />
            <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
            <Text style={styles.emptySubText}>
              Hãy bắt đầu trò chuyện với bạn bè của bạn
            </Text>
          </View>
        )}
      />
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  friendList: {
    flex: 1,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "white",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "white",
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  friendName: {
    fontSize: 16,
    color: "#000",
  },
  unreadName: {
    fontWeight: "bold",
    color: "#135CAF",
  },
  timeText: {
    fontSize: 12,
    color: "#666",
  },
  unreadTime: {
    color: "#135CAF",
    fontWeight: "500",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    color: "#666",
    flex: 1,
    marginRight: 10,
  },
  unreadMessage: {
    color: "#000",
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: "#135CAF",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadBadgePlus: {
    backgroundColor: "#E53935",
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    fontWeight: "500",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  unreadConversation: {
    backgroundColor: "rgba(19, 92, 175, 0.05)",
  },
});

export default HomeScreen;
