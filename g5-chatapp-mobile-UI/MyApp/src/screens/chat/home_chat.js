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
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from "../../config/axiosInstance";
import { formatDistanceToNow } from 'date-fns';
import { getSocket } from "../../services/socket";

const HomeScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  // Hàm lấy danh sách conversations
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
        const otherUser = conv.members.find(member => member._id !== currentUserId);
        
        return {
          _id: conv._id,
          name: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User',
          avatar: otherUser?.avatar,
          lastMessage: conv.lastMessage?.content || 'No messages yet',
          lastMessageTime: conv.lastMessage?.createdAt,
          unreadCount: conv.unreadCount || 0,
          members: conv.members,
          isGroup: conv.isGroup || false
        };
      });

      setConversations(processedConversations);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Khởi tạo và lấy dữ liệu
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
  }, []);

  // Lắng nghe sự kiện cập nhật conversation
  useEffect(() => {
    const socket = getSocket(); // Lấy socket đã được khởi tạo
    if (socket) {
      const handleConversationUpdate = (updatedConversation) => {
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv._id === updatedConversation._id ? updatedConversation : conv
          )
        );
      };

      const handleNewMessage = async () => {
        await fetchConversations();
      };

      socket.on('conversationUpdate', handleConversationUpdate);
      socket.on('newMessage', handleNewMessage);

      // Cleanup function
      return () => {
        socket.off('conversationUpdate', handleConversationUpdate);
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, []);

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => navigation.navigate("ChatDetail", { conversation: item })}
    >
      <Image 
        source={item.avatar ? { uri: item.avatar } : require("../../../assets/chat/man.png")}
        style={styles.avatar} 
      />
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={styles.friendName}>{item.name}</Text>
          {item.lastMessageTime && (
            <Text style={styles.timeText}>
              {formatDistanceToNow(new Date(item.lastMessageTime), { addSuffix: true })}
            </Text>
          )}
        </View>
        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
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
            <Text style={styles.emptyText}>No conversations yet</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  friendName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
  timeText: {
    fontSize: 12,
    color: "#666",
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    color: "#666",
    flex: 1,
    marginRight: 10,
  },
  unreadBadge: {
    backgroundColor: "#135CAF",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default HomeScreen;