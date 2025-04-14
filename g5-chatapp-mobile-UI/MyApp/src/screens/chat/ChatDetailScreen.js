import React, { useState, useEffect, useRef, useMemo } from "react";
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
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons"; // Cài bằng: npm install @expo/vector-icons
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing"; // mở tệp
import * as Location from "expo-location";
import AntDesign from "@expo/vector-icons/AntDesign";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSocket } from "../../services/socket";
import axiosInstance from "../../config/axiosInstance";
import { format } from "date-fns";
import ChatOptions from "../chat/components/ChatOptions";

const ChatDetailScreen = ({ navigation, route }) => {
  const { conversation } = route.params;
  const [showOptions, setShowOptions] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [tempMessages, setTempMessages] = useState([]); // Tin nhắn tạm thời
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const flatListRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Hàm xử lý quay lại
  const handleReturn = () => {
    navigation.navigate("Home_Chat");
  };

  // Initialize chat and fetch data
  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log("Initializing chat with conversation:", conversation);
        setLoading(true);

        // Lấy data người dùng hiện tại từ AsyncStorage
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const currentUserData = JSON.parse(userData);
          setCurrentUser(currentUserData);
          console.log("Current user:", currentUserData);

          // Thiết lập thông tin người dùng khác từ cuộc trò chuyện
          if (conversation) {
            if (conversation.name) {
              setOtherUser({
                _id: conversation._id,
                firstName: conversation.name.split(" ").slice(0, -1).join(" "),
                lastName: conversation.name.split(" ").slice(-1)[0],
                avatar: conversation.avatar,
              });
            } else if (conversation.user) {
              setOtherUser(conversation.user);
            }
          }

          // Lấy instance socket đã có sẵn
          const socketInstance = getSocket();
          console.log("Got existing socket:", socketInstance ? "yes" : "no");

          if (socketInstance) {
            console.log(
              "Socket connection status:",
              socketInstance.connected ? "connected" : "disconnected"
            );

            // Set socket state
            setSocket(socketInstance);
            setIsOnline(socketInstance.connected);

            // Join conversation room
            console.log("Joining conversation room:", conversation._id);
            socketInstance.emit("join", {
              conversationId: conversation._id,
              userId: currentUserData._id,
            });

            // Set up message listeners
            const handleNewMessage = (data) => {
              console.log("New message received:", data);

              const messageData = data.message || data;
              const messageConvId =
                messageData.conversation?._id || messageData.conversation;

              console.log("Message conversation:", messageConvId);
              console.log("Current conversation:", conversation._id);

              if (messageConvId === conversation._id) {
                setMessages((prevMessages) => {
                  const messageExists = prevMessages.some(
                    (msg) => msg._id === messageData._id
                  );
                  if (!messageExists) {
                    console.log("Adding new message to state");
                    const updatedMessages = [...prevMessages, messageData].sort(
                      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                    );

                    requestAnimationFrame(() => {
                      if (flatListRef.current) {
                        flatListRef.current.scrollToEnd({ animated: true });
                      }
                    });

                    return updatedMessages;
                  }
                  return prevMessages;
                });
              }
            };

            // Remove any existing listeners
            socketInstance.off("messageReceived");
            socketInstance.off("newMessage");

            // Add new listeners
            socketInstance.on("messageReceived", handleNewMessage);
            socketInstance.on("newMessage", handleNewMessage);

            // Set up connect/disconnect handlers
            socketInstance.on("connect", () => {
              console.log("Socket reconnected in chat detail");
              setIsOnline(true);
              socketInstance.emit("join", {
                conversationId: conversation._id,
                userId: currentUserData._id,
              });
            });

            socketInstance.on("disconnect", () => {
              console.log("Socket disconnected in chat detail");
              setIsOnline(false);
            });
          } else {
            console.error("No socket connection available");
          }

          // Fetch initial messages
          await fetchMessages();
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup function
    return () => {
      const socketInstance = getSocket();
      if (socketInstance && conversation?._id && currentUser?._id) {
        console.log("Leaving conversation room:", conversation._id);
        socketInstance.emit("leave", {
          conversationId: conversation._id,
          userId: currentUser._id,
        });

        // Remove only the listeners for this conversation
        socketInstance.off("messageReceived");
        socketInstance.off("newMessage");
        socketInstance.off("connect");
        socketInstance.off("disconnect");
      }
    };
  }, [conversation]);

  // Add useEffect for messages changes
  useEffect(() => {
    console.log("Messages changed, checking if scroll needed");
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      if (!conversation?._id) {
        console.log("No conversation ID available");
        return;
      }

      console.log("Fetching messages for conversation:", conversation._id);
      const response = await axiosInstance.get(`/message/${conversation._id}`);
      console.log("Messages response:", response.data);

      if (response.data && response.data.data) {
        let messagesData = response.data.data;

        // Kiểm tra xem messages có nằm trong data.data không
        if (messagesData.data && Array.isArray(messagesData.data)) {
          messagesData = messagesData.data;
        }

        // Validate message format
        const validMessages = messagesData.filter((msg) => {
          if (!msg || !msg.sender || !msg._id) {
            console.log("Invalid message format:", msg);
            return false;
          }
          return true;
        });

        // Sắp xếp tin nhắn từ cũ đến mới
        const sortedMessages = validMessages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        console.log("Valid messages count:", validMessages.length);
        setMessages(sortedMessages);

        // Scroll to bottom after fetching new messages
        requestAnimationFrame(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        });
      } else {
        console.log("Invalid response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Combine messages and temp messages
  const combinedMessages = useMemo(() => {
    const allMessages = [...messages];

    // Add temp messages that don't exist in regular messages
    tempMessages.forEach((tempMsg) => {
      if (!allMessages.find((msg) => msg._id === tempMsg._id)) {
        allMessages.push(tempMsg);
      }
    });

    // Sắp xếp tin nhắn từ cũ đến mới
    return allMessages.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [messages, tempMessages]);

  const addTempMessage = (message) => {
    console.log("Adding temp message:", message);
    setTempMessages((prev) => [...prev, message]);
  };

  const removeTempMessage = (messageId) => {
    console.log("Removing temp message with ID:", messageId);
    setTempMessages((prev) => {
      const updatedMessages = prev.filter((msg) => msg._id !== messageId);
      console.log("Updated temp messages:", updatedMessages);
      return updatedMessages;
    });
  };

  const updateTempMessageStatus = (messageId, status) => {
    setTempMessages((prev) =>
      prev.map((msg) => (msg._id === messageId ? { ...msg, status } : msg))
    );
  };

  const sendMessage = async (messageData = null) => {
    // Kiểm tra điều kiện trước khi gửi
    if (
      (!newMessage.trim() && !messageData) ||
      !socket ||
      !currentUser ||
      !conversation?._id
    ) {
      return;
    }

    let tempMessage;
    const currentContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    console.log("Sending message with temp ID-----:", tempId);

    try {
      if (messageData) {
        // Handle media message
        tempMessage = {
          _id: tempId,
          ...messageData,
          sender: currentUser,
          conversation: conversation._id,
          createdAt: new Date().toISOString(),
          status: "sending",
        };
      } else {
        // Handle text message
        setNewMessage(""); // Clear input first
        Keyboard.dismiss();

        tempMessage = {
          _id: tempId,
          content: currentContent,
          sender: currentUser,
          conversation: conversation._id,
          createdAt: new Date().toISOString(),
          status: "sending",
        };
      }

      // Add temporary message to state
      setTempMessages((prev) => [...prev, tempMessage]); // Chỉnh sửa để thêm vào tempMessages

      // Send to API
      const response = await axiosInstance.post(
        `/message/send-message/${conversation._id}`,
        messageData || { content: tempMessage.content }
      );

      console.log("Message send response:", response.data);
      // Xóa tin nhắn tạm sau khi gửi thành công
      console.log("Removing temp message after send---------:", tempId);
      removeTempMessage(tempId); // Gọi hàm xóa tin nhắn tạm
      // Log để kiểm tra
      console.log("Temporary message removed:", tempId);
      if (response.data && response.data.data) {
        const newMessage = response.data.data;

        // Xóa tin nhắn tạm và thêm tin nhắn thực
        setMessages((prevMessages) =>
          prevMessages
            .filter((msg) => msg._id !== tempId)
            .concat({
              ...newMessage,
              sender: currentUser, // Đảm bảo sender được thiết lập đúng
            })
        );

        // Emit socket event
        socket.emit("sendMessage", {
          message: newMessage,
          conversationId: conversation._id,
          senderId: currentUser._id,
        });

        // Scroll to bottom
        requestAnimationFrame(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      console.log("Error details:", error.response?.data);

      // Update message to error state
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === tempId ? { ...msg, status: "error" } : msg
        )
      );
    }
  };

  // Thêm hàm xử lý submit riêng cho TextInput
  const handleSubmitEditing = () => {
    if (newMessage.trim()) {
      sendMessage();
    }
  };

  // Thêm hàm xử lý press send button
  const handlePressSend = () => {
    if (newMessage.trim()) {
      sendMessage();
    }
  };

  const retryMessage = async (tempMessage) => {
    try {
      updateTempMessageStatus(tempMessage._id, "sending");

      const messageData = {
        content: tempMessage.content, // Đổi từ message thành content
      };

      // Send through socket for real-time
      socket.emit("sendMessage", {
        conversationId: conversation._id,
        content: tempMessage.content, // Đổi từ message thành content
      });

      // Send to API
      const response = await axiosInstance.post(
        `/message/send-message/${conversation._id}`,
        messageData
      );

      if (response.data) {
        // Remove temp message and add real message
        removeTempMessage(tempMessage._id);
        setMessages((prev) => [...prev, response.data]);
      }
    } catch (error) {
      console.error("Error retrying message:", error);
      console.log("Error details:", error.response?.data);
      updateTempMessageStatus(tempMessage._id, "error");
    }
  };

  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera permissions to make this work!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled) {
        await handleMediaUpload(result.assets[0], "image");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      alert("Error taking photo");
    }
    setShowOptions(false);
  };

  const handleGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need gallery permissions to make this work!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 10,
      });

      if (!result.canceled) {
        setIsUploading(true);
        try {
          // Process each selected asset
          const uploadPromises = result.assets.map(async (asset) => {
            // Determine type based on file extension
            const type =
              asset.type ||
              (asset.uri.match(/\.(jpg|jpeg|png|gif)$/i)
                ? "image"
                : asset.uri.match(/\.(mp4|mov|avi)$/i)
                ? "video"
                : "file");

            return handleMediaUpload(asset, type);
          });

          await Promise.all(uploadPromises);
        } catch (error) {
          console.error("Error processing media:", error);
          alert("Error processing media files");
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Error picking media:", error);
      alert("Error accessing media library");
      setIsUploading(false);
    }
    setShowOptions(false);
  };

  const handleDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (
        result.type === "success" ||
        (Array.isArray(result.assets) && result.assets.length > 0)
      ) {
        setIsUploading(true);
        try {
          const files = Array.isArray(result.assets) ? result.assets : [result];
          const uploadPromises = files.map((file) =>
            handleMediaUpload(file, "file")
          );
          await Promise.all(uploadPromises);
        } catch (error) {
          console.error("Error processing documents:", error);
          alert("Error processing documents");
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Error picking documents:", error);
      alert("Error selecting documents");
      setIsUploading(false);
    }
    setShowOptions(false);
  };

  const handleLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Create location message
      const locationMessage = {
        type: "location",
        content: `${latitude},${longitude}`,
        preview: `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`,
      };

      await sendMessage(locationMessage);
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Error getting location");
    }
    setShowOptions(false);
  };

  const handleMediaUpload = async (file, type) => {
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(file.uri);

      // Check file size (limit to 25MB)
      if (fileInfo.size > 25 * 1024 * 1024) {
        throw new Error("File size exceeds 25MB limit");
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        type:
          file.mimeType ||
          `${type}/${file.uri.split(".").pop()}` ||
          "application/octet-stream",
        name: file.name || `${type}-${Date.now()}.${file.uri.split(".").pop()}`,
      });

      // Create temporary message
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        type,
        content: file.uri,
        sender: currentUser,
        conversation: conversation._id,
        createdAt: new Date().toISOString(),
        status: "sending",
        fileName: file.name,
        fileSize: fileInfo.size,
        mimeType: file.mimeType,
      };

      // Add temporary message
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, tempMessage].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        // Scroll to bottom
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);

        return updatedMessages;
      });

      // Upload file
      const response = await axiosInstance.post("/message/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload response:", response.data);

      if (response.data && response.data.data) {
        // Remove temporary message
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== tempMessage._id)
        );

        // Send message with file URL
        const messageData = {
          type,
          content: response.data.data.url,
          fileName: file.name,
          fileSize: fileInfo.size,
          mimeType: file.mimeType || `${type}/${file.uri.split(".").pop()}`,
          conversationId: conversation._id,
        };

        // If it's a video, add thumbnail
        if (type === "video" && response.data.data.thumbnail) {
          messageData.thumbnail = response.data.data.thumbnail;
        }

        // Send to API
        const messageResponse = await axiosInstance.post(
          `/message/send-message/${conversation._id}`,
          messageData
        );

        if (messageResponse.data && messageResponse.data.data) {
          const newMessage = messageResponse.data.data;

          // Add new message to state
          setMessages((prevMessages) => {
            return [...prevMessages, newMessage].sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
          });

          // Emit socket event
          socket.emit("sendMessage", {
            message: newMessage,
            conversationId: conversation._id,
            senderId: currentUser._id,
          });
        }
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      console.log("Error details:", error.response?.data);

      // Update temporary message to show error
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === tempMessage._id ? { ...msg, status: "error" } : msg
        )
      );

      alert(error.message || "Error uploading media. Please try again.");
    }
  };

  const renderMessage = ({ item }) => {
    if (!item || !item.sender) {
      console.log("Invalid message item:", item);
      return null;
    }

    const isMyMessage = currentUser && item.sender._id === currentUser._id;
    const isTemp = item._id.startsWith("temp-");

    const renderMessageContent = () => {
      switch (item.type) {
        case "image":
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ImageViewer", { uri: item.content })
              }
              style={styles.mediaContainer}
            >
              <Image
                source={{ uri: item.content }}
                style={styles.messageImage}
                resizeMode="cover"
              />
              {isTemp && item.status === "sending" && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        case "video":
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("VideoPlayer", { uri: item.content })
              }
              style={styles.mediaContainer}
            >
              <Image
                source={{ uri: item.thumbnail || item.content }}
                style={styles.videoThumbnail}
              />
              <View style={styles.playButton}>
                <Ionicons name="play" size={24} color="white" />
              </View>
              {isTemp && item.status === "sending" && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        case "file":
          return (
            <TouchableOpacity
              style={styles.fileContainer}
              onPress={() => Linking.openURL(item.content)}
            >
              <Ionicons
                name={getFileIcon(item.fileName)}
                size={24}
                color={isMyMessage ? "white" : "#666"}
              />
              <View style={styles.fileInfo}>
                <Text
                  style={[
                    styles.fileName,
                    isMyMessage && styles.userMessageText,
                  ]}
                  numberOfLines={1}
                >
                  {item.fileName || "File"}
                </Text>
                <Text
                  style={[
                    styles.fileSize,
                    isMyMessage && styles.userMessageText,
                  ]}
                >
                  {formatFileSize(item.fileSize)}
                </Text>
              </View>
              {isTemp && item.status === "sending" && (
                <ActivityIndicator
                  size="small"
                  color={isMyMessage ? "#fff" : "#666"}
                />
              )}
            </TouchableOpacity>
          );
        case "location":
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("MapViewer", {
                  latitude: parseFloat(item.content.split(",")[0]),
                  longitude: parseFloat(item.content.split(",")[1]),
                })
              }
            >
              <Image
                source={{ uri: item.preview }}
                style={styles.locationPreview}
              />
            </TouchableOpacity>
          );
        default:
          return (
            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.userMessageText : styles.friendMessageText,
              ]}
            >
              {item.content || ""}
            </Text>
          );
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isMyMessage ? styles.userMessage : styles.friendMessage,
        ]}
        onLongPress={() => {
          if (isTemp && item.status === "error") {
            retryMessage(item);
          }
        }}
      >
        {!isMyMessage && (
          <Image
            source={
              item.sender.avatar
                ? { uri: item.sender.avatar }
                : require("../../../assets/chat/man.png")
            }
            style={styles.messageAvatar}
          />
        )}
        <View style={styles.messageContent}>
          {renderMessageContent()}
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {item.createdAt ? format(new Date(item.createdAt), "HH:mm") : ""}
            </Text>
            {isTemp && (
              <View style={styles.messageStatus}>
                {item.status === "sending" && (
                  <ActivityIndicator size="small" color="#999" />
                )}
                {item.status === "error" && (
                  <TouchableOpacity onPress={() => retryMessage(item)}>
                    <Ionicons name="reload" size={16} color="red" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Utility functions
  const getFileIcon = (fileName) => {
    if (!fileName) return "document-outline";
    const ext = fileName.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return "document-text-outline";
      case "doc":
      case "docx":
        return "document-text-outline";
      case "xls":
      case "xlsx":
        return "document-text-outline";
      case "zip":
      case "rar":
        return "archive-outline";
      default:
        return "document-outline";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Add pull to refresh functionality
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchMessages();
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleReturn}>
            <Icon name="chevron-left" size={30} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.friendName}>Loading...</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0099ff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleReturn}>
          <Icon name="chevron-left" size={30} color="white" />
        </TouchableOpacity>
        <Image
          source={
            otherUser?.avatar
              ? { uri: otherUser.avatar }
              : require("../../../assets/chat/man.png")
          }
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.friendName}>
            {otherUser
              ? otherUser.name || `${otherUser.firstName} ${otherUser.lastName}`
              : "Chat"}
          </Text>
          <Text style={styles.statusUser}>
            {isOnline ? "Online" : "Offline"}
          </Text>
        </View>
        <View style={styles.actionIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <AntDesign name="videocamera" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="call-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Feather
              name="more-horizontal"
              size={24}
              color="white"
              onPress={() => {
                if (otherUser) {
                  navigation.navigate("UserInfoScreen", { user: otherUser });
                }
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={combinedMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        style={styles.messageList}
        inverted={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onContentSizeChange={() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }}
        onLayout={() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }}
        ref={flatListRef}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setShowOptions(true)}>
          <View style={styles.addButton}>
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
          onChangeText={(text) => setNewMessage(text)}
          onSubmitEditing={handleSubmitEditing}
        />
        <TouchableOpacity onPress={handlePressSend}>
          <Ionicons name="send" size={28} color="#0099ff" />
        </TouchableOpacity>
      </View>

      <ChatOptions
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        onCamera={handleCamera}
        onGallery={handleGallery}
        onLocation={handleLocation}
        onDocument={handleDocument}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#135CAF",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  statusUser: {
    fontSize: 12,
    color: "white",
  },
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
  },
  messageList: {
    flex: 1,
    padding: 15,
    backgroundColor: "#FFFFFF",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 4,
    maxWidth: "80%",
  },
  messageContent: {
    padding: 10,
    borderRadius: 15,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0099ff",
  },
  friendMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e4e4e4",
  },
  userMessageText: {
    color: "white",
  },
  friendMessageText: {
    color: "black",
  },
  messageTime: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  addButton: {
    position: "relative",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  videoContainer: {
    width: 200,
    height: 200,
    borderRadius: 10,
    position: "relative",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  fileName: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  locationPreview: {
    width: 200,
    height: 150,
    borderRadius: 10,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  messageStatus: {
    marginLeft: 4,
  },
  mediaContainer: {
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  fileInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  fileSize: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
});

export default ChatDetailScreen;
