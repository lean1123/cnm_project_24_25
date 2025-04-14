import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Linking
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService } from "../../services/chat.service";
import { MessageType } from './constants';
import ChatHeader from './components/ChatHeader';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ChatOptions from './components/ChatOptions';
import { styles } from './styles/ChatDetailStyles';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useChatStore } from '../../store/useChatStore';
import { socket } from '../../config/socket';

const ChatDetailScreen = () => {
  const [newMessage, setNewMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [userId, setUserId] = useState(null);

  const { conversation } = useRoute().params;
  const navigation = useNavigation();

  // Get state and actions from store
  const {
    messages,
    tempMessages,
    isLoadingMessages,
    isSendingMessage,
    isOnline,
    addMessage,
    addTempMessage,
    removeTempMessage,
    markMessageAsError,
    setLoadingMessages,
    setSendingMessage,
    setIsOnline
  } = useChatStore();

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

  // Fetch messages when conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversation?._id) return;
      
      try {
        setLoadingMessages(true);
        const response = await chatService.getMessagesByConversation(conversation._id);
        console.log('Fetched messages:', response);
        
        // Add messages to store
        if (response?.data?.data) {
          response.data.data.forEach(message => {
            addMessage(message);
          });
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        Alert.alert('Error', 'Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [conversation?._id]);

  // Socket connection handling
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', () => {
      console.log('Socket connected successfully');
      if (userId && conversation?._id) {
        socket.emit('join-conversation', { 
          conversationId: conversation._id,
          userId: userId 
        });
      }
    });

    socket.on('new-message', (data) => {
      console.log('New message received:', data);
      if (data?.message?.conversation === conversation._id) {
        addMessage(data.message);
      }
    });

    socket.on('user-online', (data) => {
      if (data.userId && data.userId !== userId) {
        setIsOnline(true);
      }
    });

    socket.on('user-offline', (data) => {
      if (data.userId && data.userId !== userId) {
        setIsOnline(false);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('new-message');
      socket.off('user-online');
      socket.off('user-offline');
    };
  }, [userId, conversation?._id]);

  const handleSendMessage = async () => {
    const content = newMessage.trim();
    if (!content || !userId) return;

    // Create a more stable tempId using conversation ID and timestamp
    const tempId = `temp-${conversation._id}-${Date.now()}`;
    const now = new Date().toISOString();
    
    // Create temporary message
    const tempMessage = {
      _id: tempId,
      content,
      type: MessageType.TEXT,
      sender: userId,
      conversation: conversation._id,
      createdAt: now,
      isTemp: true
    };

    // Reset input and add temp message immediately
    setNewMessage('');
    addTempMessage(tempMessage);
    
    try {
      const cleanUserId = String(userId).replace(/ObjectId\(['"](.+)['"]\)/, '$1').trim();
      console.log('Sending message:', { content, sender: cleanUserId, conversation: conversation._id });

      // Send message to server
      const response = await chatService.sendMessage(conversation._id, {
        content,
        type: MessageType.TEXT,
        sender: cleanUserId
      });

      // Remove temp message and add real message
      removeTempMessage(tempId);
      addMessage(response);

      // Emit socket event
      socket.emit('new-message', {
        message: response,
        conversationId: conversation._id,
        sender: cleanUserId
      });
    } catch (error) {
      console.error('Error sending message:', error);
      markMessageAsError(tempId);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleSendImage = async (imageUri) => {
    if (!imageUri || !userId) return;

    const tempId = `img-${Date.now()}`;
    const now = new Date().toISOString();
    const tempMessage = {
      _id: tempId,
      content: imageUri,
      type: MessageType.IMAGE,
      sender: userId,
      createdAt: now,
      conversation: conversation._id,
      isTemp: true
    };

    addTempMessage(tempMessage);

    try {
      const cleanUserId = String(userId).replace(/ObjectId\(['"](.+)['"]\)/, '$1').trim();
      
      const response = await chatService.sendMessage(conversation._id, {
        content: "",
        type: MessageType.IMAGE,
        sender: cleanUserId,
        file: {
          uri: imageUri,
          type: "image/jpeg",
          name: "image.jpg"
        }
      });

      removeTempMessage(tempId);
      
      if (response?.success) {
        // Emit socket event
        socket.emit('sendMessage', {
          message: response.data,
          conversationId: conversation._id,
          sender: cleanUserId
        });
      }
    } catch (error) {
      console.error('Error sending image:', error);
      markMessageAsError(tempId);
      Alert.alert('Error', 'Failed to send image. Please try again.');
    }
  };

  const handleSendFile = async (fileUri) => {
    if (!fileUri || !userId) return;

    const tempId = `file-${Date.now()}`;
    const now = new Date().toISOString();
    const tempMessage = {
      _id: tempId,
      content: fileUri,
      type: MessageType.FILE,
      sender: userId,
      createdAt: now,
      conversation: conversation._id,
      isTemp: true
    };

    addTempMessage(tempMessage);

    try {
      const cleanUserId = String(userId).replace(/ObjectId\(['"](.+)['"]\)/, '$1').trim();
      
      const response = await chatService.sendMessage(conversation._id, {
        content: "",
        type: MessageType.FILE,
        sender: cleanUserId,
        file: {
          uri: fileUri,
          type: "application/octet-stream",
          name: fileUri.split('/').pop()
        }
      });

      removeTempMessage(tempId);
      
      if (response?.success) {
        // Emit socket event
        socket.emit('sendMessage', {
          message: response.data,
          conversationId: conversation._id,
          sender: cleanUserId
        });
      }
    } catch (error) {
      console.error('Error sending file:', error);
      markMessageAsError(tempId);
      Alert.alert('Error', 'Failed to send file. Please try again.');
    }
  };

  const handleSendLocation = async () => {
    Alert.alert('Coming Soon', 'Location sharing will be available soon!');
  };

  // Auto scroll to bottom when new messages arrive
  const flatListRef = React.useRef(null);
  
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      console.log('Scrolling to new message');
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderMessage = ({ item }) => {
    // Create a stable key using message properties
    const messageKey = item._id || `temp-${item.conversation}-${item.createdAt}-${item.sender}`;
    return (
      <ChatMessage
        key={messageKey}
        message={item}
        userId={userId}
        onOpenDocument={(url) => {
          if (url) {
            Linking.openURL(url).catch((err) => {
              console.error('Error opening document:', err);
              Alert.alert('Error', 'Cannot open this document');
            });
          }
        }}
      />
    );
  };

  // Combine messages and temp messages
  const combinedMessages = [...tempMessages, ...messages].sort((a, b) => 
    new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ChatHeader
        navigation={navigation}
        displayName={conversation.name}
        avatarUrl={conversation.avatar}
        isOnline={isOnline}
        onVideoCall={() => Alert.alert('Coming Soon', 'Video call will be available soon!')}
        onVoiceCall={() => Alert.alert('Coming Soon', 'Voice call will be available soon!')}
        onMoreOptions={() => setShowOptions(true)}
      />

      <FlatList
        ref={flatListRef}
        style={styles.messageList}
        data={combinedMessages}
        renderItem={renderMessage}
        keyExtractor={item => item._id || `temp-${item.conversation}-${item.createdAt}-${item.sender}`}
        inverted={false}
        onEndReached={() => {}}
        onEndReachedThreshold={0.5}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={false}
        refreshing={isLoadingMessages}
        onRefresh={() => fetchMessages(conversation._id)}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10
        }}
        contentContainerStyle={styles.messageListContent}
      />

      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={handleSendMessage}
        isSending={isSendingMessage}
        handleOptionPress={() => setShowOptions(true)}
      />

      <ChatOptions
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        onCamera={() => Alert.alert('Coming Soon', 'Camera will be available soon!')}
        onGallery={handleSendImage}
        onLocation={handleSendLocation}
        onDocument={handleSendFile}
      />
    </KeyboardAvoidingView>
  );
};

export default ChatDetailScreen;
