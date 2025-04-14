import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { chatService } from "../../services/chat.service";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "../../config/constants";
import { io } from "socket.io-client";

const HomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const socket = useRef(null);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      setupSocket();
      fetchConversations();
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [userId]);

  useEffect(() => {
    if (isFocused && userId) {
      fetchConversations();
    }
  }, [isFocused]);

  const setupSocket = () => {
    if (socket.current) {
      socket.current.disconnect();
    }

    console.log("Setting up socket with userId:", userId);

    socket.current = io(API_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      query: { userId }
    });

    socket.current.on("connect", () => {
      console.log("Socket connected successfully");
      fetchConversations();
    });

    socket.current.on("receiveMessage", (data) => {
      console.log("Received new message:", data);
      setConversations(prev => {
        const newConversations = [...prev];
        const conversationIndex = newConversations.findIndex(
          conv => conv._id === data.conversationId
        );

        if (conversationIndex !== -1) {
          const updatedConversation = {
            ...newConversations[conversationIndex],
            lastMessage: {
              content: `${data.senderName}: ${data.message}`,
              createdAt: data.createdAt || new Date().toISOString(),
              sender: data.senderId,
              senderName: data.senderName
            },
            unread: data.senderId !== userId
          };

          newConversations.splice(conversationIndex, 1);
          newConversations.unshift(updatedConversation);
        }

        return newConversations;
      });
    });

    socket.current.on("messageSent", (data) => {
      console.log("Message sent successfully:", data);
      setConversations(prev => {
        const newConversations = [...prev];
        const conversationIndex = newConversations.findIndex(
          conv => conv._id === data.conversationId
        );

        if (conversationIndex !== -1) {
          const updatedConversation = {
            ...newConversations[conversationIndex],
            lastMessage: {
              content: `Bạn: ${data.message}`,
              createdAt: data.createdAt || new Date().toISOString(),
              sender: userId
            }
          };

          newConversations.splice(conversationIndex, 1);
          newConversations.unshift(updatedConversation);
        }

        return newConversations;
      });
    });

    socket.current.on("messageRead", (data) => {
      console.log("Message marked as read:", data);
      if (data.conversationId) {
        setConversations(prev => 
          prev.map(conv => 
            conv._id === data.conversationId 
              ? { ...conv, unread: false }
              : conv
          )
        );
      }
    });

    socket.current.on("disconnect", () => {
      console.log("Socket disconnected, attempting to reconnect...");
    });

    socket.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  };

  const getUserId = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      if (id) {
        setUserId(id);
      }
    } catch (error) {
      console.error('Error getting userId:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await chatService.getMyConversations();
      
      if (response.success && Array.isArray(response.data)) {
        const validConversations = response.data.map(conv => {
          let displayName = 'Unknown';
          let displayAvatar = null;
          
          if (conv.isGroup) {
            displayName = conv.name || 'Unknown Group';
            displayAvatar = conv.profilePicture ? `${API_URL}/uploads/${conv.profilePicture}` : null;
          } else if (Array.isArray(conv.members)) {
            const otherMember = conv.members.find(member => member?.userId !== userId);
            
            if (otherMember) {
              displayName = otherMember.fullName || 'Unknown';
              if (otherMember.profilePicture) {
                displayAvatar = `${API_URL}/uploads/${otherMember.profilePicture}`;
              }
            }
          }

          let lastMessageContent = "No messages yet";
          let lastMessageTime = null;
          let lastMessageSender = null;
          
          if (conv.lastMessage) {
            lastMessageTime = conv.lastMessage.createdAt;
            lastMessageSender = conv.lastMessage.sender;
            const isMyMessage = conv.lastMessage.sender === userId;
            
            lastMessageContent = conv.lastMessage.message || "No messages yet";
            if (lastMessageContent !== "No messages yet") {
              lastMessageContent = isMyMessage ? `Bạn: ${lastMessageContent}` : `${conv.lastMessage.senderName || 'Unknown'}: ${lastMessageContent}`;
            }
          }

          return {
            _id: conv._id || conv.id,
            name: displayName,
            avatar: displayAvatar,
            lastMessage: {
              content: lastMessageContent,
              createdAt: lastMessageTime,
              sender: lastMessageSender
            },
            members: conv.members,
            isGroup: conv.isGroup,
            profilePicture: conv.profilePicture,
            unread: conv.unread
          };
        });
        setConversations(validConversations);
      } else {
        console.error('Invalid conversations data:', response);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationPress = (conversation) => {
    if (conversation && (conversation._id || conversation.id)) {
      setConversations(prev => prev.map(conv => {
        if (conv._id === conversation._id) {
          return { ...conv, unread: false };
        }
        return conv;
      }));

      if (socket.current) {
        socket.current.emit("markRead", {
          conversationId: conversation._id,
          userId: userId
        });
      }

      navigation.navigate("ChatDetail", { 
        conversation: {
          _id: conversation._id || conversation.id,
          name: conversation.name,
          avatar: conversation.avatar,
          members: conversation.members,
          isGroup: conversation.isGroup
        }
      });
    } else {
      console.error('Invalid conversation data:', conversation);
    }
  };

  const handleNavigate = (screen) => {
    switch(screen) {
      case 'Contacts':
        navigation.navigate('Contacts');
        break;
      case 'Profile':
        navigation.navigate('Profile');
        break;
      case 'More':
        navigation.navigate('More');
        break;
      default:
        break;
    }
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.friendItem,
        item.unread && styles.unreadItem
      ]}
      onPress={() => handleConversationPress(item)}
    >
      <Image 
        source={
          item.avatar 
            ? { uri: item.avatar } 
            : require("../../../assets/chat/man.png")
        } 
        style={styles.avatar}
        defaultSource={require("../../../assets/chat/man.png")} 
      />
      <View style={styles.conversationInfo}>
        <Text style={[
          styles.friendName,
          item.unread && styles.unreadText
        ]}>
          {item.name}
        </Text>
        <Text style={[
          styles.lastMessage,
          item.unread && styles.unreadText
        ]} numberOfLines={1}>
          {item.lastMessage?.content}
        </Text>
        {item.lastMessage?.createdAt && (
          <Text style={[
            styles.messageTime,
            item.unread && styles.unreadText
          ]}>
            {new Date(item.lastMessage.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        )}
        {item.unread && <View style={styles.unreadDot} />}
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
        onRefresh={fetchConversations}
        refreshing={loading}
      />
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
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
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  conversationInfo: {
    flex: 1,
    position: 'relative',
  },
  friendName: {
    fontWeight: "500",
    fontSize: 16,
    marginBottom: 4,
  },
  lastMessage: {
    color: "gray",
    fontSize: 14,
  },
  messageTime: {
    position: 'absolute',
    right: 0,
    top: 0,
    fontSize: 12,
    color: 'gray',
  },
  unreadItem: {
    backgroundColor: '#f0f9ff',
  },
  unreadText: {
    fontWeight: "bold",
    color: "#000",
  },
  unreadDot: {
    position: 'absolute',
    right: 0,
    top: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0084ff',
    marginTop: -4,
  }
});

export default HomeScreen;
