import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons, Feather, AntDesign } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { styles } from '../styles/ChatDetailStyles';

const ChatHeader = ({ 
  navigation, 
  displayName = 'Unknown', 
  avatarUrl, 
  isOnline, 
  onVideoCall, 
  onVoiceCall, 
  onMoreOptions 
}) => {
  return (
    <View style={styles.header}>
      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
        <Icon name="chevron-left" size={28} color="white" />
      </TouchableOpacity>

      {/* Avatar */}
      <Image 
        source={avatarUrl ? { uri: avatarUrl } : require('../../../../assets/chat/avatar.png')}
        style={styles.avatar}
        defaultSource={require('../../../../assets/chat/avatar.png')}
      />

      {/* Name + Online status */}
      <View style={{ flex: 1, marginLeft: 8 }}>
        <Text style={styles.friendName} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={[styles.statusUser, { color: isOnline ? "#90ee90" : "#ccc" }]}>
          {isOnline ? "Online" : "Offline"}
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actionIcons}>
        <TouchableOpacity style={styles.iconButton} onPress={onVideoCall}>
          <AntDesign name="videocamera" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onVoiceCall}>
          <Ionicons name="call-outline" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onMoreOptions}>
          <Feather name="more-horizontal" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatHeader;
