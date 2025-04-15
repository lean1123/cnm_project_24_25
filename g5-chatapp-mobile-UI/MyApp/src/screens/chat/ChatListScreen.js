import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService } from '../../services/chat.service';
import { styles } from './styles/ChatListStyles';
import { useFocusEffect } from '@react-navigation/native';
import { socket } from '../../config/socket';

const ChatListScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const fetchConversations = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      console.log('Fetching conversations for userId:', userId);
      
      const response = await chatService.getConversations();
      
      if (response.success) {
        console.log('Conversations fetched successfully:', response.data);
        setConversations(response.data);
      } else {
        console.error('Failed to fetch conversations:', response.error);
        Alert.alert('Error', 'Failed to load conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          let id = parsedUser._id;
          if (typeof id === 'object' && id._id) {
            id = id._id;
          }
          id = String(id).replace(/ObjectId\(['"](.+)['"]\)/, '$1').trim();
          console.log("Clean user ID:", id);
          setUserId(id);
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        Alert.alert('Error', 'Failed to get user data');
      }
    };
    getUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused, fetching conversations for userId:', userId);
      fetchConversations();
    }, [userId])
  );

  useEffect(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }

    socket.on('connect', () => {
      console.log('Socket connected successfully');
      if (userId) {
        fetchConversations();
      }
    });

    socket.on('new-message', (data) => {
      console.log('New message received in ChatList:', data);
      if (userId) {
        fetchConversations();
      }
    });

    return () => {
      socket.off('connect');
      socket.off('new-message');
    };
  }, [userId]);

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigation.navigate('ChatDetail', { conversation: item })}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {item.name ? item.name.charAt(0).toUpperCase() : '?'}
        </Text>
      </View>
      <View style={styles.conversationInfo}>
        <Text style={styles.conversationName}>{item.name || 'Unknown'}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage?.content || 'No messages yet'}
        </Text>
      </View>
      <View style={styles.conversationMeta}>
        <Text style={styles.time}>
          {item.lastMessage?.createdAt
            ? new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''}
        </Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchConversations}
      />
    </View>
  );
};

export default ChatListScreen; 