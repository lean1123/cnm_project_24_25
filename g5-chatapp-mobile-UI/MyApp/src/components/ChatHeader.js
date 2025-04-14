import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ChatHeader = ({ 
  title, 
  avatar, 
  onBack, 
  onInfo,
  isOnline,
  lastSeen 
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>
      
      <View style={styles.avatarContainer}>
        <Image
          source={avatar ? { uri: avatar } : require("../../assets/chat/man.png")}
          style={styles.avatar}
        />
        {isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {lastSeen && !isOnline && (
          <Text style={styles.lastSeen}>Last seen {lastSeen}</Text>
        )}
      </View>
      
      <TouchableOpacity onPress={onInfo} style={styles.infoButton}>
        <Ionicons name="information-circle-outline" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 5,
  },
  avatarContainer: {
    marginLeft: 10,
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  lastSeen: {
    fontSize: 12,
    color: '#666',
  },
  infoButton: {
    padding: 5,
  },
});

export default ChatHeader; 