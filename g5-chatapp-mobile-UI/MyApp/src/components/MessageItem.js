import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const MessageItem = ({ message, isOwnMessage, userId }) => {
  const getMessageTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return format(date, 'HH:mm', { locale: vi });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const getSenderName = () => {
    if (isOwnMessage) return 'Me';
    return message.sender?.fullName || 'Unknown';
  };

  return (
    <View style={[
      styles.messageContainer,
      isOwnMessage ? styles.ownMessage : styles.otherMessage
    ]}>
      {!isOwnMessage && (
        <View style={styles.avatarContainer}>
          <Image
            source={message.sender?.avatar ? { uri: message.sender.avatar } : require("../../assets/chat/man.png")}
            style={styles.avatar}
          />
        </View>
      )}
      <View style={[
        styles.messageContent,
        isOwnMessage ? styles.ownMessageContent : styles.otherMessageContent
      ]}>
        {!isOwnMessage && (
          <Text style={styles.senderName}>{getSenderName()}</Text>
        )}
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText
        ]}>
          {message.content}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={styles.timeText}>{getMessageTime(message.createdAt)}</Text>
          {isOwnMessage && (
            <Text style={styles.statusText}>
              {message.status === 'sent' ? '✓✓' : 
               message.status === 'sending' ? '✓' : 
               message.status === 'failed' ? '!' : '✓'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageContent: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
  },
  ownMessageContent: {
    backgroundColor: '#007AFF',
  },
  otherMessageContent: {
    backgroundColor: '#E9ECEF',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    color: '#666',
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
});

export default MessageItem; 