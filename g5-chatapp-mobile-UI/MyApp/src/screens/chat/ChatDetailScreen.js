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
import { useMessages } from './hooks/useMessages';
import { useChatSocket } from './hooks/useChatSocket';
import ChatHeader from './components/ChatHeader';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ChatOptions from './components/ChatOptions';
import { styles } from './styles/ChatDetailStyles';
import { useRoute, useNavigation } from '@react-navigation/native';
import { socket } from '../../config/socket';

const ChatDetailScreen = () => {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [userId, setUserId] = useState(null);

  const { conversation } = useRoute().params;
  const navigation = useNavigation();

  const {
    messages,
    loading,
    hasMore,
    tempMessages,
    fetchMessages,
    loadMoreMessages,
    addTempMessage,
    removeTempMessage,
    addMessage,
    markMessageAsError
  } = useMessages(conversation);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          // Chỉ lấy ID từ user object và làm sạch
          let id = parsedUser._id;
          if (typeof id === 'object' && id._id) {
            id = id._id;
          }
          // Loại bỏ ObjectId wrapper nếu có
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

  const handleSendMessage = async () => {
    const content = newMessage.trim();
    if (!content || !userId) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date().toISOString();
    
    // Tạo message object
    const messageData = {
      _id: tempId,
      content,
      type: MessageType.TEXT,
      sender: userId,
      conversation: conversation._id,
      createdAt: now,
      isTemp: true
    };

    // Reset input và thêm tin nhắn tạm thời ngay lập tức
    setNewMessage('');
    addTempMessage(messageData);
    
    try {
      const cleanUserId = String(userId).replace(/ObjectId\(['"](.+)['"]\)/, '$1').trim();
      console.log('Sending message:', { content, sender: cleanUserId, conversation: conversation._id });

      // Emit socket event trước khi gọi API
      socket.emit('send_message', {
        message: messageData,
        conversationId: conversation._id,
        sender: cleanUserId
      });

      // Gọi API để lưu tin nhắn
      const response = await chatService.sendMessage(conversation._id, {
        content,
        type: MessageType.TEXT,
        sender: cleanUserId
      });

      console.log('Server response:', response);

      if (response?.success) {
        // Create final message object if response doesn't include data
        const finalMessage = response.data || {
          _id: tempId,
          content,
          type: MessageType.TEXT,
          sender: cleanUserId,
          conversation: conversation._id,
          createdAt: now
        };

        console.log('Using message data:', finalMessage);
        
        // Xóa tin nhắn tạm và thêm tin nhắn thật
        removeTempMessage(tempId);
        addMessage(finalMessage);
      } else {
        console.error('Server returned error:', response);
        markMessageAsError(tempId);
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      markMessageAsError(tempId);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  // Xử lý tin nhắn mới từ socket
  const handleNewMessage = React.useCallback((data) => {
    console.log('New message received in ChatDetailScreen:', data);
    
    // Safely access message data
    const messageData = data?.message || data;
    if (!messageData || !messageData._id) {
      console.log('Invalid message data received:', data);
      return;
    }
    
    // Kiểm tra xem tin nhắn đã tồn tại chưa và thuộc về conversation hiện tại
    const messageExists = messages.some(msg => msg?._id === messageData._id) ||
                         tempMessages.some(msg => msg?._id === messageData._id);
    
    if (!messageExists && messageData.conversation === conversation._id) {
      console.log('Adding new message to conversation:', messageData);
      addMessage(messageData);

      // Cuộn xuống tin nhắn mới
      if (flatListRef.current) {
        setTimeout(() => {
          flatListRef.current.scrollToEnd({ animated: true });
        }, 100);
      }
    }
  }, [messages, tempMessages, addMessage, conversation._id]);

  // Sử dụng socket hook
  useChatSocket({
    conversation,
    userId,
    onNewMessage: handleNewMessage,
    setIsOnline
  });

  // Sắp xếp và kết hợp tin nhắn
  const combinedMessages = React.useMemo(() => {
    const validMessages = messages.filter(msg => msg && msg._id);
    const validTempMessages = tempMessages.filter(
      tempMsg => tempMsg && tempMsg._id && !validMessages.find(msg => msg?._id === tempMsg._id)
    );

    return [...validTempMessages, ...validMessages]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(msg => ({
        ...msg,
        key: msg._id || `temp-${msg.createdAt}`
      }));
  }, [messages, tempMessages]);

  // Tự động cuộn xuống khi có tin nhắn mới
  const flatListRef = React.useRef(null);
  
  useEffect(() => {
    if (flatListRef.current && combinedMessages.length > 0) {
      console.log('Scrolling to new message');
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [combinedMessages.length]);

  const renderMessage = ({ item }) => (
    <ChatMessage
      key={item._id || `temp-${item.createdAt}`}
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
      
      // Emit socket event trước
      socket.emit('send_message', {
        message: tempMessage,
        conversationId: conversation._id,
        sender: cleanUserId
      });

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
      
      if (response) {
        addMessage(response);
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
      
      // Emit socket event trước
      socket.emit('send_message', {
        message: tempMessage,
        conversationId: conversation._id,
        sender: cleanUserId
      });

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
      
      if (response) {
        addMessage(response);
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

  // Thêm useEffect để fetch messages khi conversation thay đổi
  useEffect(() => {
    fetchMessages();
  }, [conversation._id]);

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
        keyExtractor={item => item.key || item._id}
        inverted={false}
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.5}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={false}
        refreshing={loading}
        onRefresh={fetchMessages}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10
        }}
        contentContainerStyle={styles.messageListContent}
        extraData={[messages.length, tempMessages.length]}
      />

      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={handleSendMessage}
        isSending={isSending}
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
