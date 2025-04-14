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

  useChatSocket({
    conversation,
    userId,
    onNewMessage: (message) => {
      if (message.conversation === conversation._id) {
        addMessage(message);
      }
    },
    setIsOnline
  });

  useEffect(() => {
    fetchMessages();
  }, [conversation._id]);

  const handleSendMessage = async () => {
    const content = newMessage.trim();
    if (!content || !userId) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const tempMessage = {
      _id: tempId,
      content,
      type: MessageType.TEXT,
      sender: userId,
      createdAt: new Date().toISOString(),
      conversation: conversation._id,
      isTemp: true,
    };

    setNewMessage('');
    addTempMessage(tempMessage);
    setIsSending(true);

    try {
      // Đảm bảo chỉ gửi ID string
      const cleanUserId = String(userId).replace(/ObjectId\(['"](.+)['"]\)/, '$1').trim();
      console.log("Sending message with user ID:", cleanUserId);

      const response = await chatService.sendMessage(conversation._id, {
        content,
        type: MessageType.TEXT,
        sender: cleanUserId
      });

      removeTempMessage(tempId);
      
      // Nếu response có _id, đây là message object hợp lệ
      if (response && response._id) {
        console.log("Adding new message:", response);
        addMessage(response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      markMessageAsError(tempId);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendImage = async (imageUri) => {
    if (!imageUri || !userId) return;

    const tempId = `img-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      content: imageUri,
      type: MessageType.IMAGE,
      sender: userId,
      createdAt: new Date().toISOString(),
      conversation: conversation._id,
      isTemp: true
    };

    addTempMessage(tempMessage);
    setIsSending(true);

    try {
      const response = await chatService.sendMessage(conversation._id, {
        content: "",
        type: MessageType.IMAGE,
        sender: userId, // Đã là clean ID
        file: {
          uri: imageUri,
          type: "image/jpeg",
          name: "image.jpg"
        }
      });

      removeTempMessage(tempId);
      
      if (response?._id) {
        addMessage(response);
      } else if (response?.data?._id) {
        addMessage(response.data);
      } else {
        throw new Error('Invalid message response');
      }
    } catch (error) {
      console.error('Error sending image:', error);
      markMessageAsError(tempId);
      Alert.alert('Error', 'Failed to send image. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendFile = async (fileUri) => {
    if (!fileUri || !userId) return;

    const tempId = `file-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      content: fileUri,
      type: MessageType.FILE,
      sender: userId,
      createdAt: new Date().toISOString(),
      conversation: conversation._id,
      isTemp: true
    };

    addTempMessage(tempMessage);
    setIsSending(true);

    try {
      const response = await chatService.sendMessage(conversation._id, {
        content: "",
        type: MessageType.FILE,
        sender: userId, // Đã là clean ID
        file: {
          uri: fileUri,
          type: "application/octet-stream",
          name: fileUri.split('/').pop()
        }
      });

      removeTempMessage(tempId);
      
      if (response?._id) {
        addMessage(response);
      } else if (response?.data?._id) {
        addMessage(response.data);
      } else {
        throw new Error('Invalid message response');
      }
    } catch (error) {
      console.error('Error sending file:', error);
      markMessageAsError(tempId);
      Alert.alert('Error', 'Failed to send file. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendLocation = async () => {
    // Implement location sharing functionality
    Alert.alert('Coming Soon', 'Location sharing will be available soon!');
  };

  const renderMessage = ({ item }) => (
    <ChatMessage
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

  // Sắp xếp tin nhắn mới nhất ở dưới
  const combinedMessages = [
    ...tempMessages.filter(
      (tempMsg) => !messages.find((msg) => msg._id === tempMsg._id)
    ),
    ...messages
  ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Sắp xếp theo thời gian tăng dần

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
        style={styles.messageList}
        data={combinedMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        inverted={false} // Không đảo ngược danh sách
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.5}
        initialNumToRender={15}
        refreshing={loading}
        onRefresh={fetchMessages}
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
