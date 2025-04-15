import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { styles } from '../styles/ChatDetailStyles';
import { MessageType } from '../constants';

const ChatMessage = ({ message, userId, onOpenDocument }) => {
  if (!message) return null;

  const getSenderId = (sender) => {
    if (typeof sender === 'string') return sender;
    if (typeof sender === 'object' && sender._id) {
      return sender._id.toString().replace(/ObjectId\(['"](.+)['"]\)/, '$1');
    }
    return null;
  };

  const getSenderName = (sender) => {
    if (typeof sender === 'object') {
      const fullName = [sender.firstName, sender.lastName].filter(Boolean).join(' ');
      return fullName || 'Unknown';
    }
    return 'Unknown';
  };

  const openURL = async (url) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Can't open URL", url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
      Alert.alert("Error", "Something went wrong while opening the link.");
    }
  };

  const senderId = getSenderId(message.sender);
  const isMyMessage = senderId && userId && String(senderId) === String(userId);
  const isError = message.isError;

  const messageContent = () => {
    switch (message.type) {
      case MessageType.IMAGE: {
        const imageUrl = message.files?.[0]?.url || message.content;
        return (
          <TouchableOpacity onPress={() => openURL(imageUrl)}>
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: 200,
                height: 200,
                borderRadius: 10,
                marginVertical: 5,
              }}
            />
          </TouchableOpacity>
        );
      }

      case MessageType.FILE: {
        const file = message.files?.[0];
        const fileUrl = file?.url || message.content;
        const fileName = file?.fileName || 'Unknown File';
        return (
          <TouchableOpacity onPress={() => onOpenDocument(fileUrl)}>
            <Text style={[styles.messageText, !isMyMessage && { color: 'black' }]}>
              📎 {fileName}
            </Text>
          </TouchableOpacity>
        );
      }

      case MessageType.LOCATION: {
        try {
          const location = JSON.parse(message.content);
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
          return (
            <TouchableOpacity onPress={() => openURL(mapUrl)}>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={20} color={isMyMessage ? "white" : "black"} />
                <Text style={[styles.messageText, !isMyMessage && { color: 'black', marginLeft: 4 }]}>
                  Shared Location
                </Text>
              </View>
            </TouchableOpacity>
          );
        } catch (error) {
          console.error("Invalid location data:", error);
          return <Text style={styles.messageText}>Invalid location data</Text>;
        }
      }

      case MessageType.TEXT:
      default:
        return (
          <Text style={[styles.messageText, !isMyMessage && { color: 'black' }]}>
            {message.content}
          </Text>
        );
    }
  };

  return (
    <View style={[
      styles.messageContainer,
      isMyMessage ? styles.userMessage : styles.friendMessage,
      isError && styles.errorMessage
    ]}>
      {!isMyMessage && message.sender && (
        <Text style={styles.senderName}>
          {getSenderName(message.sender)}
        </Text>
      )}
      {messageContent()}
      <Text style={[styles.messageTime, !isMyMessage && { color: 'gray' }]}>
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      {isError && (
        <View style={styles.errorIndicator}>
          <Ionicons name="alert-circle" size={16} color="red" />
        </View>
      )}
    </View>
  );
};

export default ChatMessage;
