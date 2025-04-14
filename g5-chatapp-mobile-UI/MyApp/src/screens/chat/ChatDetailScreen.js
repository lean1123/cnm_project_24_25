import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
  Modal,
  Keyboard,
  Linking,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, Feather } from "@expo/vector-icons"; // Cài bằng: npm install @expo/vector-icons
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing"; // mở tệp
import * as Location from "expo-location";
import AntDesign from "@expo/vector-icons/AntDesign";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { chatService } from "../../services/chat.service";
import { io } from "socket.io-client";
import { API_URL } from "../../config/constants";

const ChatDetailScreen = ({ navigation, route }) => {
  const conversation = route.params?.conversation;
  const [showOptions, setShowOptions] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const socket = useRef(null);
  const [userId, setUserId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);

  // Get the display name for the conversation
  const getDisplayName = () => {
    if (!conversation) return 'Unknown';
    if (conversation?.name) return conversation.name;
    if (!conversation?.isGroup && Array.isArray(conversation?.members)) {
      // For non-group chats, find the other member
      const otherMember = conversation.members.find(member => member?.userId !== userId);
      return otherMember?.fullName || 'Unknown';
    }
    return 'Unknown';
  };

  // Get the avatar URL for the conversation
  const getAvatarUrl = () => {
    if (!conversation) return require("../../../assets/chat/man.png");
    if (conversation?.avatar) return { uri: conversation.avatar };
    if (!conversation?.isGroup && Array.isArray(conversation?.members)) {
      const otherMember = conversation.members.find(member => member?.userId !== userId);
      return otherMember?.avatar ? { uri: otherMember.avatar } : require("../../../assets/chat/man.png");
    }
    return require("../../../assets/chat/man.png");
  };

  useEffect(() => {
    const getUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setUserId(id);
        }
      } catch (error) {
        console.error('Error getting userId:', error);
      }
    };
    getUserId();
  }, []);

  // Reset messages and page when entering the screen
  useEffect(() => {
    if (conversation?._id) {
      setMessages([]);
      setPage(1);
      setHasMore(true);
      fetchMessages();
    }
  }, [conversation?._id]);

  useEffect(() => {
    if (!conversation?._id || !userId) return;

    setupSocket();

    // Thêm interval để kiểm tra tin nhắn mới định kỳ
    const messageCheckInterval = setInterval(() => {
      if (socket.current?.connected) {
        fetchMessages();
      }
    }, 5000); // Kiểm tra mỗi 5 giây

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
      clearInterval(messageCheckInterval);
    };
  }, [userId, conversation?._id]);

  const setupSocket = () => {
    if (!conversation?._id) return;
    
    if (socket.current) {
      socket.current.disconnect();
    }

    socket.current = io(API_URL, {
      transports: ["websocket"],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  
    socket.current.on("connect", () => {
      socket.current.emit("joinConversation", conversation._id);
      
      // Thêm sự kiện lắng nghe tin nhắn mới khi kết nối
      socket.current.emit("getNewMessages", conversation._id);
    });
  
    socket.current.on("newMessage", (message) => {
      // Check if message is for current conversation
      if (message?.conversation === conversation._id || message?.conversationId === conversation._id) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(m => m._id === message._id);
          if (!exists) {
            // Format the message to match our message structure
            const formattedMessage = {
              _id: message._id,
              content: message.content,
              type: message.type || "TEXT",
              sender: message.sender,
              createdAt: message.createdAt || new Date().toISOString(),
              conversation: message.conversation || message.conversationId
            };
            
            // Scroll to top when new message arrives
            setTimeout(() => {
              flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }, 100);
            
            return [formattedMessage, ...prev];
          }
          return prev;
        });
      }
    });

    // Thêm sự kiện lắng nghe tin nhắn mới từ server
    socket.current.on("message", (message) => {
      if (message?.conversation === conversation._id || message?.conversationId === conversation._id) {
        setMessages(prev => {
          const exists = prev.some(m => m._id === message._id);
          if (!exists) {
            const formattedMessage = {
              _id: message._id,
              content: message.content,
              type: message.type || "TEXT",
              sender: message.sender,
              createdAt: message.createdAt || new Date().toISOString(),
              conversation: message.conversation || message.conversationId
            };
            
            setTimeout(() => {
              flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }, 100);
            
            return [formattedMessage, ...prev];
          }
          return prev;
        });
      }
    });

    // Thêm sự kiện lắng nghe tin nhắn mới từ server
    socket.current.on("messages", (messages) => {
      if (Array.isArray(messages)) {
        const newMessages = messages.filter(msg => 
          (msg?.conversation === conversation._id || msg?.conversationId === conversation._id) &&
          !messages.some(m => m._id === msg._id)
        );
        
        if (newMessages.length > 0) {
          setMessages(prev => {
            const formattedMessages = newMessages.map(msg => ({
              _id: msg._id,
              content: msg.content,
              type: msg.type || "TEXT",
              sender: msg.sender,
              createdAt: msg.createdAt || new Date().toISOString(),
              conversation: msg.conversation || msg.conversationId
            }));
            
            setTimeout(() => {
              flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }, 100);
            
            return [...formattedMessages, ...prev];
          });
        }
      }
    });

    socket.current.on("messageReceived", (messageId) => {
      // Update message status if needed
    });
  
    socket.current.on("error", (error) => {
      console.error("Socket error:", error);
      // Try to reconnect on error after a delay
      setTimeout(() => {
        setupSocket();
      }, 3000);
    });

    socket.current.on("disconnect", (reason) => {
      if (reason === "io server disconnect" || reason === "io client disconnect") {
        // Don't reconnect for intentional disconnects
        return;
      }
      // Try to reconnect for other disconnect reasons
      setTimeout(() => {
        setupSocket();
      }, 3000);
    });

    socket.current.on("reconnect", (attemptNumber) => {
      if (conversation?._id) {
        socket.current.emit("joinConversation", conversation._id);
        socket.current.emit("getNewMessages", conversation._id);
        fetchMessages();
      }
    });

    // Ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (socket.current?.connected) {
        socket.current.emit("ping");
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  };

  const fetchMessages = async () => {
    if (!conversation?._id) return;
    
    try {
      setLoading(true);
      const response = await chatService.getMessagesByConversation(conversation._id, 1, 50);

      if (response?.success) {
        const newMessages = response.data?.data || [];
        setMessages(newMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setHasMore(response.data?.currentPage < response.data?.totalPages);
      } else {
        console.error("Failed to fetch messages:", response);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || loading || !conversation?._id) return;
    
    try {
      const nextPage = page + 1;
      const response = await chatService.getMessagesByConversation(conversation._id, nextPage, 50);

      if (response?.success) {
        const newMessages = response.data?.data || [];
        setMessages(prev => {
          const combined = [...prev, ...newMessages];
          return combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
        setPage(nextPage);
        setHasMore(response.data?.currentPage < response.data?.totalPages);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "" || isSending) return;

    try {
      setIsSending(true);
      const messageData = {
        content: newMessage.trim(),
        type: "TEXT",
      };

      const response = await chatService.sendMessage(conversation._id, messageData);
      
      if (response?.success) {
        setNewMessage("");
        Keyboard.dismiss();
        
        // Add message immediately to local state
        const sentMessage = {
          _id: response.data?._id || Date.now().toString(),
          content: newMessage.trim(),
          type: "TEXT",
          sender: {
            userId: userId,
            fullName: conversation.members.find(m => m.userId === userId)?.fullName || "Me"
          },
          createdAt: new Date().toISOString(),
          conversation: conversation._id
        };
        
        setMessages(prev => [sentMessage, ...prev]);

        // Emit the message through socket immediately
        if (socket.current?.connected) {
          socket.current.emit("newMessage", {
            ...sentMessage,
            conversationId: conversation._id,
            sender: {
              userId: userId,
              fullName: conversation.members.find(m => m.userId === userId)?.fullName || "Me"
            }
          });
          
          // Thêm sự kiện emit message để đảm bảo server nhận được
          socket.current.emit("message", {
            ...sentMessage,
            conversationId: conversation._id,
            sender: {
              userId: userId,
              fullName: conversation.members.find(m => m.userId === userId)?.fullName || "Me"
            }
          });
        } else {
          setupSocket();
        }
      } else {
        Alert.alert("Error", "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const sendImage = async (imageUri) => {
    if (isSending) return;
    
    try {
      setIsSending(true);
      const messageData = {
        content: "Image",
        type: "image",
      };

      const file = {
        uri: imageUri,
        type: "image/jpeg",
        name: "image.jpg",
      };

      // Send image to server
      const response = await chatService.sendMessage(conversation._id, messageData, [file]);
      
      if (!response?.success) {
        Alert.alert("Error", "Failed to send image. Please try again.");
      }
    } catch (error) {
      console.error("Error sending image:", error);
      Alert.alert("Error", "Failed to send image. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const sendFile = async (fileUri) => {
    if (isSending) return;
    
    try {
      setIsSending(true);
      const messageData = {
        content: "File",
        type: "file",
      };

      const file = {
        uri: fileUri,
        type: "application/octet-stream",
        name: "file",
      };

      // Send file to server
      const response = await chatService.sendMessage(conversation._id, messageData, [file]);
      
      if (!response?.success) {
        Alert.alert("Error", "Failed to send file. Please try again.");
      }
    } catch (error) {
      console.error("Error sending file:", error);
      Alert.alert("Error", "Failed to send file. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    if (!item) return null;
    
    const isMyMessage = item?.sender?.userId === userId;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.userMessage : styles.friendMessage,
        ]}
      >
        {!isMyMessage && (
          <Text style={styles.senderName}>
            {item?.sender?.fullName || "Unknown"}
          </Text>
        )}
        {(item.type === "text" || item.type === "TEXT") && (
          <Text style={[
            styles.messageText,
            !isMyMessage && { color: 'black' }
          ]}>
            {item.content}
          </Text>
        )}
        {(item.type === "image" || item.type === "IMAGE") && (
          <TouchableOpacity onPress={() => Linking.openURL(item.content)}>
            <Image
              source={{ uri: item.content }}
              style={{
                width: 200,
                height: 200,
                borderRadius: 10,
              }}
            />
          </TouchableOpacity>
        )}
        {(item.type === "file" || item.type === "FILE") && (
          <TouchableOpacity onPress={() => openDocument(item.content)}>
            <Text style={[
              styles.messageText,
              !isMyMessage && { color: 'black' }
            ]}>
              {item.content}
            </Text>
          </TouchableOpacity>
        )}
        <Text style={[
          styles.messageTime,
          !isMyMessage && { color: 'gray' }
        ]}>
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  //mở modal option
  const handleOptionPress = () => {
    setShowOptions(true);
  };

  const closeModal = () => {
    setShowOptions(false);
  };
  // ham mo cameracamera
  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      await sendImage(result.assets[0].uri);
    }
    closeModal();
  };

  // ham truy cap vao thu vien anh
  const openGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      await sendImage(result.assets[0].uri);
    }
    closeModal();
  };

  const openDocument = async (fileUri) => {
    try {
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Không thể mở tệp:", error);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log("Người dùng đã huỷ");
        return;
      }

      await sendFile(result.assets[0].uri);
      closeModal();
    } catch (error) {
      console.error("Lỗi chọn tệp:", error);
    }
  };

  const sentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      console.log("Permission to access location was denied");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const messageData = {
      content: JSON.stringify({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }),
      type: "location",
    };

    await chatService.sendMessage(conversation._id, messageData);
    closeModal();
  };

  const pickLocation = () => {
    navigation.navigate("LocationScreen");
  };

  {/* Handle when click button 3dot */}
  const hanldeMoreOption = () => {
    navigation.navigate("UserInfo", {
      friend: conversation,
    });
  }
  {/* Handle when click button call */}
  const handleCall = () => {
    navigation.navigate("Call", {
      friend: conversation,
    });
  }
  {/* Handle when click button call video */}
  const handleCallVideo = () => {
    navigation.navigate("Call", {
      friend: conversation,
    });
  }

  // Update FlatList to show loading indicator when loading more messages
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#135CAF" />
      </View>
    );
  };

  // Add cleanup function to component unmount
  useEffect(() => {
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, []);

  return conversation ? (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={30} color="white" />
        </TouchableOpacity>
        <Image 
          source={getAvatarUrl()} 
          style={styles.avatar} 
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.friendName}>{getDisplayName()}</Text>
          <Text style={styles.statusUser}>Online</Text>
        </View>
        <View style={styles.actionIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <AntDesign name="videocamera" size={24} color="white" onPress={handleCallVideo}/>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="call-outline" size={24} color="white" onPress={handleCall}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Feather
              name="more-horizontal"
              size={24}
              color="white"
              onPress={() => hanldeMoreOption()}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* Header */}
      {/* Message List */}
      {loading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#135CAF" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          style={styles.messageList}
          inverted
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshing={loading}
          onRefresh={fetchMessages}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10
          }}
        />
      )}

      {/* Input Box */}
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleOptionPress} disabled={isSending}>
          <View
            style={{
              position: "relative",
              width: 32,
              height: 32,
              alignItems: "center",
              justifyContent: "center",
              opacity: isSending ? 0.5 : 1,
            }}
          >
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
          onSubmitEditing={sendMessage}
          editable={!isSending}
        />
        <TouchableOpacity onPress={sendMessage} disabled={isSending}>
          {isSending ? (
            <ActivityIndicator size="small" color="#0099ff" />
          ) : (
            <Ionicons name="send" size={28} color="#0099ff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Modal Options */}
      <Modal visible={showOptions} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.optionsBox}>
            <View style={styles.optionRow}>
              <TouchableOpacity style={styles.option} onPress={openCamera}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#0099ff",
                    borderRadius: 50,
                    padding: 10,
                    backgroundColor: "#0099ff",
                  }}
                >
                  <Ionicons name="camera-outline" size={32} color="#ffffff" />
                </View>

                <Text style={styles.optionText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#0099ff",
                    borderRadius: 50,
                    padding: 10,
                    backgroundColor: "#0099ff",
                  }}
                >
                  <Ionicons name="mic-outline" size={32} color="#ffffff" />
                </View>
                <Text style={styles.optionText}>Record</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#0099ff",
                    borderRadius: 50,
                    padding: 10,
                    backgroundColor: "#0099ff",
                  }}
                >
                  <Ionicons name="person-outline" size={32} color="#ffffff" />
                </View>
                <Text style={styles.optionText}>Contact</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.optionRow}>
              <TouchableOpacity style={styles.option} onPress={openGallery}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#0099ff",
                    borderRadius: 50,
                    padding: 10,
                    backgroundColor: "#0099ff",
                  }}
                >
                  <Ionicons name="image-outline" size={32} color="#ffffff" />
                </View>
                <Text style={styles.optionText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option} onPress={sentLocation}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#0099ff",
                    borderRadius: 50,
                    padding: 10,
                    backgroundColor: "#0099ff",
                  }}
                >
                  <Ionicons name="location-outline" size={32} color="#ffffff" />
                </View>

                <Text style={styles.optionText}>My Location</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option} onPress={pickDocument}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#0099ff",
                    borderRadius: 50,
                    padding: 10,
                    backgroundColor: "#0099ff",
                  }}
                >
                  <Ionicons name="document-outline" size={32} color="#ffffff" />
                </View>

                <Text style={styles.optionText}>Document</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#135CAF",
    elevation: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 8,
  },
  friendName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "white",
  },
  statusUser: {
    color: "white",
    fontSize: 12,
  },
  actionIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    padding: 10,
  },
  messageList: { flex: 1, paddingHorizontal: 20, backgroundColor: "#FFFFFF " },
  messageContainer: {
    maxWidth: "75%",
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },
  userMessage: {
    backgroundColor: "#0099ff",
    alignSelf: "flex-end",
  },
  friendMessage: {
    backgroundColor: "#D3D3D3",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "white",
  },
  messageTime: {
    fontSize: 10,
    color: "white",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginHorizontal: 10,
    paddingVertical: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  optionsBox: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  option: {
    padding: 10,
    alignItems: "center",
    borderRadius: 10,
    justifyContent: "center",
    width: 100,
  },
  optionText: {
    marginTop: 5,
    color: "#0099ff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  closeButton: {
    alignItems: "center",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "white",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "red",
  },
  closeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});

export default ChatDetailScreen;
