import React from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, Text } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { styles } from '../styles/ChatDetailStyles';
import useChatStore from '../../../store/useChatStore';

const ChatInput = ({ 
  newMessage, 
  setNewMessage, 
  sendMessage, 
  isSending,
  handleOptionPress 
}) => {
  const { replyMessage, setReplyMessage } = useChatStore();
  console.log("[ChatInput] replyMessage from store:", replyMessage);

  const handleSend = () => {
    if (!newMessage.trim() && !replyMessage?.files?.length && !replyMessage?.content) return;
    if (isSending) return;
    sendMessage();
    Keyboard.dismiss();
  };

  const cancelReply = () => {
    setReplyMessage(null);
  };

  return (
    <View>
      {replyMessage && (
        <View style={styles.replyPreviewContainer}>
          <View style={styles.replyPreviewTextContainer}>
            <Text style={styles.replyPreviewTitle}>Replying to {replyMessage.sender?.firstName || 'User'}</Text>
            <Text numberOfLines={1} style={styles.replyPreviewContent}>
              {replyMessage.content || (replyMessage.files && replyMessage.files.length > 0 ? `File: ${replyMessage.files[0].fileName || 'Attachment'}` : 'Message')}
            </Text>
          </View>
          <TouchableOpacity onPress={cancelReply} style={styles.cancelReplyButton}>
            <Ionicons name="close-circle" size={24} color="#999" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleOptionPress} disabled={isSending}>
          <View style={{
            position: "relative",
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            opacity: isSending ? 0.5 : 1,
          }}>
            <Ionicons name="add-circle" size={32} color="#0099ff" />
            <Ionicons
              name="add"
              size={20}
              color="white"
              style={{ position: "absolute" }}
            />
          </View>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          onSubmitEditing={handleSend}
          editable={!isSending}
          returnKeyType="send"
          blurOnSubmit={false}
        />

        <TouchableOpacity onPress={handleSend} disabled={isSending || (!newMessage.trim() && !replyMessage)} >
          {isSending ? (
            <ActivityIndicator size="small" color="#0099ff" />
          ) : (
            <Ionicons name="send" size={28} color={(newMessage.trim() || replyMessage) ? "#0099ff" : "#ccc"} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatInput;
