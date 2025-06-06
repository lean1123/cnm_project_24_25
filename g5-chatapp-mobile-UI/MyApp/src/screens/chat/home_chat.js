import React, { useState, useEffect, useMemo } from "react";
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
import { getSocket, initSocket, reconnectSocket, subscribeToChatEvents, unsubscribeFromChatEvents, subscribeToNewConversations, unsubscribeFromNewConversations } from "../../services/socket";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { decryptMessage } from "../../utils/securityMessage";

const HomeScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigation = useNavigation();
  const renderLastMessage = (lastMessage, conversationId) => {
    if (!lastMessage) return "Bắt đầu cuộc trò chuyện!";

    const isMyMessage = lastMessage.sender?._id === userId;
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
      default:
        // Debug logging
        console.log('[HomeChat] Processing TEXT message:', {
          content: lastMessage.content,
          conversationId: conversationId,
          lastMessageConversation: lastMessage.conversation,
          isLocationContent: lastMessage.content && /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(lastMessage.content)
        });
        
        // Decrypt the message content before displaying
        // Use the passed conversationId as the primary key, fallback to lastMessage.conversation
        const isLocationContent = lastMessage.content && /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(lastMessage.content);
        const decryptionKey =  lastMessage.forwardFromConversation || conversationId || lastMessage.conversation || "default_key";
        const decryptedContent = isLocationContent ? lastMessage.content : decryptMessage(lastMessage.content, decryptionKey);
        
        console.log('[HomeChat] Decrypted content with key:', decryptionKey, '→', decryptedContent);
        
        return `${prefix}${decryptedContent || lastMessage.content}`;
    }
  };
  const updateConversationWithNewMessage = (message) => {
    const conversationId = message.conversation?.toString();
    if (!conversationId) return;

    const senderId = message.sender?._id?.toString();
    
    setConversations(prevConversations => {
      // Find the conversation to update
      const conversationToUpdate = prevConversations.find(c => c._id === conversationId);
      if (!conversationToUpdate) return prevConversations;

      // Remove the conversation from the list
      const otherConversations = prevConversations.filter(c => c._id !== conversationId);

      // Create updated conversation with the new message
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
        // Debug logging for lastMessage from API
        if (conv.lastMessage) {
          console.log('[HomeChat] API lastMessage debug:', {
            conversationId: conv._id,
            lastMessageContent: conv.lastMessage.content,
            lastMessageType: conv.lastMessage.type,
            lastMessageConversationField: conv.lastMessage.conversation,
            lastMessageSender: conv.lastMessage.sender
          });
        }
        
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
    // Setup user data and socket connection
    const setupUserAndSocket = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          const currentUserId = user._id || user.id;
          setUserId(currentUserId);
          
          // Initialize socket
          await reconnectSocket();
          const socket = getSocket();
          
          if (socket) {
            setSocketConnected(socket.connected);
            
            // Handle socket connection events
            const handleConnect = () => {
              console.log('[HomeChat] Socket connected');
              setSocketConnected(true);
              
              // Emit login when reconnected
              if (currentUserId) {
                socket.emit('login', { userId: currentUserId });
              }
            };
            
            const handleDisconnect = () => {
              console.log('[HomeChat] Socket disconnected');
              setSocketConnected(false);
            };
            
            socket.on('connect', handleConnect);
            socket.on('disconnect', handleDisconnect);
            
            return () => {
              socket.off('connect', handleConnect);
              socket.off('disconnect', handleDisconnect);
            };
          }
        }
      } catch (error) {
        console.error('[HomeChat] Error setting up user and socket:', error);
      }
    };
    
    setupUserAndSocket();
  }, []);

  useEffect(() => {
    if (userId) {
      // Setup chat event listeners
      const chatCallbacks = {        // Message events
        onNewMessage: (message) => {
          console.log('[HomeChat] New message received:', message);
          console.log('[HomeChat] Message content:', message.content);
          console.log('[HomeChat] Message type:', message.type);
          updateConversationWithNewMessage(message);
        },
        
        // Group events
        onNewGroupConversation: (data) => {
          console.log('[HomeChat] New group conversation:', data);
          
          // Tự động join vào conversation mới qua socket
          if (data && data.conversation && data.conversation._id) {
            const socket = getSocket();
            if (socket && socket.connected) {
              console.log('[HomeChat] Auto-joining new conversation:', data.conversation._id);
              
              // Join conversation
              socket.emit('joinNewConversation', {
                conversationId: data.conversation._id,
                userId: userId
              });
              
              // Cũng cần join room thông thường để nhận tin nhắn
              socket.emit('join', {
                conversationId: data.conversation._id,
                userId: userId
              });
            }
          }
          
          // Vẫn fetch lại để cập nhật UI
          fetchConversations();
        },
        onUpdateConversation: (data) => {
          console.log('[HomeChat] Conversation updated:', data);
          fetchConversations();
        },
        onRemovedFromGroup: (data) => {
          console.log('[HomeChat] Removed from group:', data);
          fetchConversations();
        },
        onDissolvedGroup: (data) => {
          console.log('[HomeChat] Group dissolved:', data);
          fetchConversations();
        },
        
        // Friend/contact events
        onAcceptRequestContact: (data) => {
          console.log('[HomeChat] Friend request accepted:', data);
          fetchConversations();
        },

        // User status
        onActiveUsers: (data) => {
          console.log('[HomeChat] Active users updated:', data);
          if (data && data.activeUsers) {
            setConversations(prevConversations => {
              const updatedConversations = prevConversations.map(conv => {
                if (conv.otherUserId && data.activeUsers.includes(conv.otherUserId)) {
                  return { ...conv, isOnline: true };
                } else if (conv.otherUserId) {
                  return { ...conv, isOnline: false };
                }
                return conv;
              });
              return updatedConversations;
            });
          }
        }
      };
      
      // Subscribe to all events
      subscribeToChatEvents(chatCallbacks);
      
      // Thêm đăng ký riêng cho conversations mới
      // Sử dụng callback để xử lý UI khi có conversation mới
      subscribeToNewConversations(userId, (data) => {
        console.log('[HomeChat] New conversation callback triggered:', data?.conversation?._id);
        fetchConversations();
      });
      
      // Fetch initial data
      fetchConversations();
      
      return () => {
        // Unsubscribe from all events when component unmounts
        unsubscribeFromChatEvents();
        unsubscribeFromNewConversations();
      };
    }
  }, [userId]);

  // Filter conversations based on search term
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) {
      return conversations;
    }
    
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    
    return conversations.filter(conv => {
      // Search only by conversation name
      if (conv.name && conv.name.toLowerCase().includes(normalizedSearchTerm)) {
        return true;
      }
      
      return false;
    });
  }, [conversations, searchTerm]);

  const handleSearch = (text) => {
    setSearchTerm(text);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#135CAF" barStyle="light-content" />
        <Header onSearch={handleSearch} />
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
          source={item.avatar ? { uri: item.avatar } : require("../../../assets/chat/group.jpg")}
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
            {renderLastMessage(item.lastMessage, item._id)}
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
      <Header onSearch={handleSearch} />
      <View style={styles.content}>
        {searchTerm.trim() !== "" && filteredConversations.length === 0 ? (
          <View style={styles.emptySearchContainer}>
            <Icon name="magnify" size={64} color="#666" />
            <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptySubText}>
              Không tìm thấy cuộc trò chuyện nào phù hợp với "{searchTerm}"
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
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
        )}
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
  emptySearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});

export default HomeScreen;