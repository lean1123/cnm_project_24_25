import React from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { styles } from '../styles/ChatDetailStyles';

const ChatInput = ({ 
  newMessage, 
  setNewMessage, 
  sendMessage, 
  isSending,
  handleOptionPress 
}) => {

  const handleSend = () => {
    if (!newMessage.trim() || isSending) return;
    sendMessage();
    Keyboard.dismiss(); =
  };

  return (
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

      <TouchableOpacity onPress={handleSend} disabled={isSending}>
        {isSending ? (
          <ActivityIndicator size="small" color="#0099ff" />
        ) : (
          <Ionicons name="send" size={28} color={newMessage.trim() ? "#0099ff" : "#ccc"} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ChatInput;
