import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { styles } from '../styles/ChatDetailStyles';
import { MessageType } from '../constants';
import { decryptMessage } from '../../../utils/securityMessage';

const ChatMessage = ({ message, userId, conversationId, onOpenDocument, onReply }) => {
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

  const renderRepliedMessage = () => {
    if (!message.replyTo) return null;

    const repliedSenderName = getSenderName(message.replyTo.sender);
    let repliedContentPreview = message.replyTo.content;
    
    // Decrypt the replied message content if it exists and is not a location message
    if (repliedContentPreview && conversationId) {
      const isLocationReply = /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(repliedContentPreview);
      repliedContentPreview = isLocationReply ? repliedContentPreview : decryptMessage(repliedContentPreview, conversationId);
    }
    
    if (repliedContentPreview && repliedContentPreview.length > 40) {
      repliedContentPreview = `${repliedContentPreview.slice(0, 40)}...`;
    }

    let repliedFileTypePreview = null;
    if (message.replyTo.type === MessageType.IMAGE) {
      repliedFileTypePreview = "Hình ảnh";
    }
    // Add other file types as needed (VIDEO, FILE, AUDIO)

    return (
      <View style={styles.repliedMessageContainer}>
        <Text style={styles.repliedSenderName}>{repliedSenderName}</Text>
        {repliedContentPreview && <Text style={styles.repliedContentPreview}>{repliedContentPreview}</Text>}
        {repliedFileTypePreview && <Text style={styles.repliedContentPreview}>{repliedFileTypePreview}</Text>}
      </View>
    );
  };

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
    <TouchableOpacity onLongPress={() => onReply && onReply(message)} delayLongPress={200}>
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.userMessage : styles.friendMessage,
        isError && styles.errorMessage
      ]}>
        {renderRepliedMessage()}
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
    </TouchableOpacity>
  );
};

export default ChatMessage;
