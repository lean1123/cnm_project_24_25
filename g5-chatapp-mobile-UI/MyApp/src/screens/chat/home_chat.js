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
  StatusBar,
} from "react-native";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from "../../config/axiosInstance";
import { formatDistanceToNow } from 'date-fns';
import { getSocket, initSocket, reconnectSocket } from "../../services/socket";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const HomeScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const navigation = useNavigation();

  const renderLastMessage = (lastMessage) => {
    if (!lastMessage) return "Bắt đầu cuộc trò chuyện!";

    const isMyMessage = lastMessage.sender._id === userId;
    let prefix = isMyMessage ? "Bạn: " : "";

    // Check if it's a location message either by content format or isLocation flag
    const isLocationMessage = (lastMessage.content && /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(lastMessage.content)) || lastMessage.isLocation;
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

  const updateConversationWithNewMessage = (conversationId, message, senderId) => {
    setConversations(prevConversations => {
      // Find the conversation to update
      const conversationToUpdate = prevConversations.find(c => c._id === conversationId);
      if (!conversationToUpdate) return prevConversations;

      // Remove the conversation from the list
      const otherConversations = prevConversations.filter(c => c._id !== conversationId);

      // Create updated conversation
      const updatedConversation = {
        ...conversationToUpdate,
        lastMessage: message,
        lastMessageTime: message.createdAt,
        // Increment unread count only if the sender is not the current user
        unreadCount: senderId !== userId ? conversationToUpdate.unreadCount + 1 : conversationToUpdate.unreadCount
      };

      // Return new array with updated conversation at the beginning
      return [updatedConversation, ...otherConversations];
    });
  };

  const fetchConversations = async () => {
    try {
      const response = await axiosInstance.get("/conversation/my-conversation");
  
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response format');
      }
  
      const userData = await AsyncStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;
      const currentUserId = currentUser?._id || currentUser?.id;
  
      const processedConversations = response.data.data.map((conv) => {
        // Tìm người dùng khác trong mảng members
        const otherUser = conv.members.find(member => member.user._id !== currentUserId)?.user;
  
        const name = conv.isGroup
          ? conv.name || 'Untitled Group'  // Nếu là nhóm thì lấy tên nhóm
          : otherUser ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() : 'Unknown User';  
          
        const avatar = conv.isGroup
          ? conv.profilePicture || ''  // Nếu là nhóm thì lấy avatar nhóm
          : otherUser?.avatar || '';  // Nếu là người dùng, lấy avatar của user
          
        return {
          _id: conv._id,
          name: name,
          avatar: avatar,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessage?.createdAt,
          unreadCount: conv.unreadCount || 0,
          members: conv.members,
          isGroup: conv.isGroup || false,
          isOnline: otherUser?.isOnline || false,
          otherUserId: otherUser?._id || null
        };
      });
  
      // Sắp xếp các cuộc trò chuyện theo tin nhắn chưa đọc và thời gian tin nhắn cuối cùng
      const sortedConversations = processedConversations.sort((a, b) => {
        // Sắp xếp theo số lượng tin nhắn chưa đọc
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
        if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
        
        // Sắp xếp theo thời gian tin nhắn cuối cùng
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime) : new Date(0);
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime) : new Date(0);
        return timeB - timeA;
      });
  
      setConversations(sortedConversations);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
      setLoading(false);
      setRefreshing(false);
    }
  };
  

  useEffect(() => {
    // Socket connection management - simplified approach
    const setupSocket = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          const currentUserId = user._id || user.id;
          setUserId(currentUserId);
          
          // Simplified socket initialization
          const socket = getSocket();
          
          if (socket) {
            console.log('Socket initialized in home_chat');
            
            // Simple approach for tracking connection status
            const handleConnect = () => {
              console.log('Socket connected event received in home_chat');
              setSocketConnected(true);
            };
            
            const handleDisconnect = () => {
              console.log('Socket disconnected event received in home_chat');
              setSocketConnected(false);
            };
            
            socket.on('connect', handleConnect);
            socket.on('disconnect', handleDisconnect);
            
            // Set initial state based on current connection
            setSocketConnected(socket.connected);
            
            return () => {
              socket.off('connect', handleConnect);
              socket.off('disconnect', handleDisconnect);
            };
          }
        }
      } catch (error) {
        console.error('Error setting up socket in home_chat:', error);
      }
    };
    
    setupSocket();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (socket && socketConnected && userId) {
      const handleNewMessage = async (data) => {
        console.log('[Socket] New message received:', data);
        if (data.conversationId && data.message) {
          updateConversationWithNewMessage(data.conversationId, data.message, data.message.sender);
        }
      };

      const handleMessageRead = (data) => {
        console.log('[Socket] Message read event received:', data);
        if (data.conversationId) {
          setConversations(prevConversations => {
            const updatedConversations = prevConversations.map(conv =>
              conv._id === data.conversationId
                ? { ...conv, unreadCount: 0 }
                : conv
            );
            return [...updatedConversations]; // Create new array to trigger re-render
          });
        }
      };

      const handleUserOnlineStatus = ({ userId: targetUserId, isOnline }) => {
        console.log('[Socket] User online status update:', targetUserId, isOnline);
        setConversations(prevConversations => {
          const updatedConversations = prevConversations.map(conv => {
            // Check if this conversation involves the user whose status changed
            if (conv.otherUserId === targetUserId) {
              return {
                ...conv,
                isOnline: isOnline
              };
            }
            return conv;
          });
          return [...updatedConversations]; // Create new array to trigger re-render
        });
      };

      // Remove old event listeners before adding new ones
      socket.off('newMessage');
      socket.off('messageReceived');
      socket.off('receiveMessage');
      socket.off('receiveMessageGroup');
      socket.off('messageRead');
      socket.off('messageSeen');
      socket.off('userOnline');
      socket.off('userOffline');
      socket.off('userOnlineStatus');
      
      // Add event listeners for both old and new event names
      socket.on('newMessage', handleNewMessage);
      socket.on('messageReceived', handleNewMessage);
      socket.on('receiveMessage', handleNewMessage);
      socket.on('receiveMessageGroup', handleNewMessage);
      
      socket.on('messageRead', handleMessageRead);
      socket.on('messageSeen', handleMessageRead);
      
      socket.on('userOnline', handleUserOnlineStatus);
      socket.on('userOffline', data => handleUserOnlineStatus({ ...data, isOnline: false }));
      socket.on('userOnlineStatus', data => handleUserOnlineStatus({ 
        userId: data.userId, 
        isOnline: data.status 
      }));

      return () => {
        socket.off('newMessage');
        socket.off('messageReceived');
        socket.off('receiveMessage');
        socket.off('receiveMessageGroup');
        socket.off('messageRead');
        socket.off('messageSeen');
        socket.off('userOnline');
        socket.off('userOffline');
        socket.off('userOnlineStatus');
      };
    }
  }, [userId, socketConnected]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user._id || user.id);
        }
        await fetchConversations();
      } catch (error) {
        console.error('Error initializing:', error);
        setLoading(false);
      }
    };

    initializeData();

    // Reduce polling frequency to prevent excessive API calls
    const refreshInterval = setInterval(() => {
      if (!refreshing) {
        fetchConversations();
      }
    }, 5000);  // Changed from 2000 to 5000ms

    return () => clearInterval(refreshInterval);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#135CAF" barStyle="light-content" />
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#135CAF" />
        </View>
        <Footer />
      </SafeAreaView>
    );
  }

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        item.unreadCount > 0 && styles.unreadConversation
      ]}
      onPress={() => {
        setConversations(prevConversations =>
          prevConversations.map(conv =>
            conv._id === item._id
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
        navigation.navigate("ChatDetail", { conversation: item });
      }}
    >
      <View style={styles.avatarContainer}>
        <Image 
          source={item.avatar ? { uri: item.avatar } : require("../../../assets/chat/avatar.png")}
          style={styles.avatar} 
        />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={[
            styles.conversationName,
            item.unreadCount > 0 && styles.unreadName
          ]}>
            {item.name}
          </Text>
          {item.lastMessageTime && (
            <Text style={[
              styles.timeText,
              item.unreadCount > 0 && styles.unreadTime
            ]}>
              {formatDistanceToNow(new Date(item.lastMessageTime), { addSuffix: true })}
            </Text>
          )}
        </View>
        <View style={styles.messageRow}>
          <Text 
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.unreadMessage
            ]} 
            numberOfLines={1}
          >
            {renderLastMessage(item.lastMessage)}
          </Text>
          {item.unreadCount > 0 && (
            <View style={[
              styles.unreadBadge,
              item.unreadCount > 9 && styles.unreadBadgePlus
            ]}>
              <Text style={styles.unreadText}>
                {item.unreadCount > 9 ? '9+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#135CAF" barStyle="light-content" />
      <Header />
      <View style={styles.content}>
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item._id}
          style={styles.conversationList}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchConversations();
          }}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="message-text-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
              <Text style={styles.emptySubText}>
                Hãy bắt đầu trò chuyện với bạn bè của bạn
              </Text>
              <TouchableOpacity 
                style={styles.startChatButton}
                onPress={() => navigation.navigate("FriendsList")}
              >
                <Text style={styles.startChatButtonText}>Bắt đầu chat</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  content: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    paddingBottom: '20%',
  },
  conversationList: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  unreadConversation: {
    backgroundColor: "#fff",
    borderLeftWidth: 4,
    borderLeftColor: "#135CAF",
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  unreadName: {
    fontWeight: "700",
    color: "#135CAF",
  },
  timeText: {
    fontSize: 12,
    color: "#666",
  },
  unreadTime: {
    color: "#135CAF",
    fontWeight: "600",
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    color: "#1a1a1a",
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: "#135CAF",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadBadgePlus: {
    backgroundColor: "#E53935",
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#1a1a1a',
    marginTop: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  startChatButton: {
    backgroundColor: "#135CAF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  startChatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HomeScreen;