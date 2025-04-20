import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
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
  Animated,
  KeyboardAvoidingView,
  Image,
  ImageBackground,
} from "react-native";
import WebView from "react-native-webview";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Location from "expo-location";
import AntDesign from "@expo/vector-icons/AntDesign";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSocket } from "../../services/socket";
import { format } from "date-fns";
import ChatOptions from "../chat/components/ChatOptions";
import { chatService } from "../../services/chat.service";
import useAuthStore from "../../store/useAuthStore";
import { Video } from "expo-av";
import { Audio } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_URL } from "../../config/constants";

import {
  Provider as PaperProvider,
  Surface,
  Card,
  Avatar,
  Text,
  Button,
  IconButton,
  FAB,
  Modal as PaperModal,
  Portal,
  ProgressBar,
  Divider,
  List,
  Badge,
} from "react-native-paper";

const customTheme = {
  colors: {
    primary: "#0099ff",
    background: "transparent",
    surface: "#ffffff",
    text: "#333",
    secondary: "#666",
    error: "#e74c3c",
  },
};


const AudioMessage = ({ file, isMyMessage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const soundRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initAudio = async () => {
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound: newSound, status } = await Audio.Sound.createAsync(
          { uri: file.url },
          {
            shouldPlay: false,
            isLooping: false,
            progressUpdateIntervalMillis: 100,
          },
          onPlaybackStatusUpdate
        );

        if (isMounted) {
          soundRef.current = newSound;
          if (status.isLoaded) {
            setDuration(status.durationMillis);
            setPosition(status.positionMillis);
            setError(null);
          } else {
            setError("Failed to load audio");
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Audio initialization error:", err);
        if (isMounted) {
          setError("Could not load audio");
          setIsLoading(false);
        }
      }
    };

    initAudio();

    return () => {
      isMounted = false;
      const cleanup = async () => {
        try {
          if (soundRef.current) {
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }
        } catch (err) {
          console.error("Cleanup error:", err);
        }
      };
      cleanup();
    };
  }, [file.url]);

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);
      setDuration(status.durationMillis);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const handlePlayPause = async () => {
    try {
      const sound = soundRef.current;
      if (!sound) {
        setError("Audio not ready");
        return;
      }

      const status = await sound.getStatusAsync();
      if (!status.isLoaded) {
        setError("Audio not ready");
        return;
      }

      if (status.isPlaying) {
        await sound.setStatusAsync({ shouldPlay: false });
      } else {
        if (!sound._loaded) {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: file.url },
            { shouldPlay: true },
            onPlaybackStatusUpdate
          );
          soundRef.current = newSound;
        } else {
          await sound.setStatusAsync({
            shouldPlay: true,
            positionMillis: position,
            isLooping: false,
            volume: 1.0,
            rate: 1.0,
          });
        }
      }
    } catch (err) {
      console.error("Playback error:", err);
      setError("Playback failed");
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: file.url },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        soundRef.current = newSound;
      } catch (recoveryErr) {
        console.error("Recovery failed:", recoveryErr);
        setError("Could not recover playback");
      }
    }
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds) return "0:00";
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View
      style={{
        marginVertical: 4,
        backgroundColor: isMyMessage ? "#0099ff" : "#e4e4e4",
        width: 220,
        borderRadius: 12,
        padding: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <IconButton
          icon={isLoading ? "loading" : isPlaying ? "pause" : "play"}
          size={20}
          iconColor={isMyMessage ? "#fff" : "#666"}
          onPress={handlePlayPause}
          disabled={isLoading}
        />
        <View style={{ flex: 1 }}>
          <ProgressBar
            progress={progress}
            color={isMyMessage ? "#fff" : "#135CAF"}
            style={{ height: 2, marginBottom: 4 }}
          />
          <Text
            variant="bodySmall"
            style={{ color: isMyMessage ? "#fff" : "#666", fontSize: 12 }}
          >
            {error
              ? error
              : `${formatTime(position)} / ${formatTime(duration)}`}
          </Text>
        </View>
      </View>
    </View>
  );
};

// AudioRecordingModal Component
const AudioRecordingModal = ({ visible, onClose, onSend }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedUri, setRecordedUri] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please grant microphone permission to record audio."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording", error);
      Alert.alert("Error", "Could not start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      clearInterval(timerRef.current);
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
    } catch (error) {
      console.error("Failed to stop recording", error);
      Alert.alert("Error", "Could not save the recording. Please try again.");
    }
  };

  const handleSend = async () => {
    if (recordedUri) {
      const audioMessage = {
        files: [
          {
            uri: recordedUri,
            type: "audio/m4a",
            name: `audio-${Date.now()}.m4a`,
          },
        ],
        type: "AUDIO",
      };
      await onSend(audioMessage);
      onClose();
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Portal>
      <PaperModal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
          margin: 0,
          position: "absolute",
          bottom: 0,
          width: "100%",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text variant="titleLarge">Ghi âm tin nhắn</Text>
          <IconButton icon="close" onPress={onClose} />
        </View>
        <View style={{ alignItems: "center", paddingVertical: 20 }}>
          <Text variant="displayMedium">
            {formatDuration(recordingDuration)}
          </Text>
          {!recordedUri ? (
            <FAB
              icon={isRecording ? "stop" : "microphone"}
              style={{
                marginTop: 20,
                backgroundColor: isRecording ? "#ff4444" : "#fff",
                borderWidth: 2,
                borderColor: "#ff4444",
              }}
              color={isRecording ? "#fff" : "#ff4444"}
              onPress={isRecording ? stopRecording : startRecording}
            />
          ) : (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                width: "100%",
                marginTop: 20,
              }}
            >
              <Button
                mode="outlined"
                onPress={() => {
                  setRecordedUri(null);
                  setRecordingDuration(0);
                }}
                icon="refresh"
              >
                Ghi lại
              </Button>
              <Button
                mode="contained"
                onPress={handleSend}
                icon="send"
                buttonColor="#0099ff"
              >
                Gửi
              </Button>
            </View>
          )}
        </View>
      </PaperModal>
    </Portal>
  );
};

// ChatDetailScreen Component
const ChatDetailScreen = ({ navigation, route }) => {
  const { conversation } = route.params || {};
  const insets = useSafeAreaInsets();

  const [showOptions, setShowOptions] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [tempMessages, setTempMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const flatListRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [authenticated, setAuthenticated] = useState("");
  const video = useRef(null);
  const [showAudioRecording, setShowAudioRecording] = useState(false);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }
    );
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleReturn = () => {
    navigation.navigate("Home_Chat");
  };

  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (!conversation || !conversation._id) {
          alert("Error: Invalid conversation data. Please try again.");
          navigation.goBack();
          return;
        }

        setLoading(true);

        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const currentUserData = JSON.parse(userData);
          const response = await fetch(`${API_URL}/auth/get-my-profile`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentUserData.token}`,
            },
          });
          const result = await response.json();
          if (result.data) {
            const userData = result.data;
            setCurrentUser({
              _id: userData._id || currentUserData._id,
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              email: userData.email || "",
              gender: userData.gender || "Not set",
              role: Array.isArray(userData.role)
                ? userData.role
                : [userData.role].filter(Boolean),
              avatar: userData.avatar || null,
              dob: userData.dob || null,
            });
          }

          if (conversation) {
            try {
              // Handle conversation data based on type (group or individual)
              if (conversation.isGroup) {
                // If it's a group conversation, use group data directly
                setOtherUser(null);
              } else if (conversation.name) {
                // Individual conversation with set name
                setOtherUser({
                  _id: conversation._id,
                  firstName: conversation.name.split(" ").slice(0, -1).join(" "),
                  lastName: conversation.name.split(" ").slice(-1)[0],
                  avatar: conversation.avatar,
                });
              } else if (conversation.user) {
                // Individual conversation with user data
                setOtherUser(conversation.user);
              } else if (conversation.members && conversation.members.length > 0) {
                // Try to find the other user from members list
                try {
                  const otherMember = conversation.members.find(
                    (member) => member._id !== currentUserData._id
                  );
                  if (otherMember) {
                    setOtherUser(otherMember);
                  } else {
                    // If we can't find members, try to get conversation details
                    const conversationsResponse = await chatService.getMyConversations();
                    if (conversationsResponse.success && conversationsResponse.data) {
                      const currentConv = conversationsResponse.data.find(
                        conv => conv._id === conversation._id
                      );
                      
                      if (currentConv) {
                        if (currentConv.isGroup) {
                          // Group conversation
                          setOtherUser(null);
                        } else if (currentConv.members && currentConv.members.length > 0) {
                          // Find the other member in individual chat
                          const otherMember = currentConv.members.find(
                            member => member._id !== currentUserData._id
                          );
                          if (otherMember) {
                            setOtherUser(otherMember);
                          }
                        }
                      }
                    }
                  }
                } catch (error) {
                  console.error("Error setting other user from members:", error);
                }
              } else {
                // Fallback: If we can't determine the other user, try to fetch conversation details
                try {
                  const conversationsResponse = await chatService.getMyConversations();
                  if (conversationsResponse.success && conversationsResponse.data) {
                    const currentConv = conversationsResponse.data.find(
                      conv => conv._id === conversation._id
                    );
                    
                    if (currentConv) {
                      if (currentConv.isGroup) {
                        // Group conversation
                        setOtherUser(null);
                      } else if (currentConv.members && currentConv.members.length > 0) {
                        // Find the other member in individual chat
                        const otherMember = currentConv.members.find(
                          member => member._id !== currentUserData._id
                        );
                        if (otherMember) {
                          setOtherUser(otherMember);
                        }
                      }
                    }
                  }
                } catch (error) {
                  console.error("Error fetching conversation details:", error);
                }
              }
            } catch (error) {
              console.error("Error processing conversation data:", error);
            }
          }

          const socketInstance = getSocket();
          if (socketInstance) {
            setSocket(socketInstance);
            setIsOnline(socketInstance.connected);

            socketInstance.emit("join", {
              conversationId: conversation._id,
              userId: currentUserData._id,
            });
            socketInstance.emit("joinConversation", {
              conversationId: conversation._id,
              userId: currentUserData._id,
            });

            // For individual chats, setup user status events
            if (!conversation.isGroup) {
              socketInstance.on("userStatusUpdate", (data) => {
                if (otherUser && data.userId === otherUser._id) {
                  setIsOnline(data.isOnline);
                }
              });
              
              socketInstance.on("activeUsers", (data) => {
                if (otherUser && data.activeUsers && data.activeUsers.includes(otherUser._id)) {
                  setIsOnline(true);
                }
              });
            }

            const handleNewMessage = (data) => {
              const messageData = data.message || data;
              const messageConvId =
                messageData.conversation?._id || messageData.conversation;

              if (messageConvId === conversation._id) {
                setMessages((prevMessages) => {
                  const messageExists = prevMessages.some(
                    (msg) => msg._id === messageData._id
                  );
                  if (!messageExists) {
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

            socketInstance.off("messageReceived");
            socketInstance.off("newMessage");
            socketInstance.off("receiveMessage");
            socketInstance.off("receiveMessageGroup");

            socketInstance.on("newMessage", handleNewMessage);
            socketInstance.on("messageReceived", handleNewMessage);
            socketInstance.on("receiveMessage", handleNewMessage);
            socketInstance.on("receiveMessageGroup", handleNewMessage);

            socketInstance.on("connect", () => {
              setIsOnline(true);
              socketInstance.emit("join", {
                conversationId: conversation._id,
                userId: currentUserData._id,
              });
              socketInstance.emit("joinConversation", {
                conversationId: conversation._id,
                userId: currentUserData._id,
              });
            });

            socketInstance.on("disconnect", () => {
              setIsOnline(false);
            });
          }

          await fetchMessages();
          const userId = await AsyncStorage.getItem("userId");
          setAuthenticated(userId);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      const socketInstance = getSocket();
      if (socketInstance && conversation?._id && currentUser?._id) {
        socketInstance.emit("leave", {
          conversationId: conversation._id,
          userId: currentUser._id,
        });
        socketInstance.emit("leaveConversation", {
          conversationId: conversation._id,
          userId: currentUser._id,
        });

        socketInstance.off("messageReceived");
        socketInstance.off("newMessage");
        socketInstance.off("receiveMessage");
        socketInstance.off("receiveMessageGroup");
        socketInstance.off("connect");
        socketInstance.off("disconnect");
      }
    };
  }, [conversation]);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      if (!conversation?._id) {
        return;
      }

      const response = await chatService.getMessages(conversation._id);
      if (response && response.data) {
        let messagesData = response.data;

        if (messagesData.data && Array.isArray(messagesData.data)) {
          messagesData = messagesData.data;
        }
        const validMessages = messagesData.filter((msg) => {
          if (!msg || !msg.sender || !msg._id) {
            return false;
          }
          return true;
        });

        const sortedMessages = validMessages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        setMessages(sortedMessages);

        requestAnimationFrame(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const combinedMessages = useMemo(() => {
    const allMessages = [...messages];
    tempMessages.forEach((tempMsg) => {
      if (!allMessages.find((msg) => msg._id === tempMsg._id)) {
        allMessages.push(tempMsg);
      }
    });
    return allMessages.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [messages, tempMessages]);

  const addTempMessage = (message) => {
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempMessage = {
      ...message,
      _id: tempId,
    };
    setTempMessages((prev) => [...prev, tempMessage]);
  };

  const removeTempMessage = (messageId) => {
    setTempMessages((prev) => prev.filter((msg) => msg._id !== messageId));
  };

  const handleLocation = () => {
    setShowOptions(false);
    navigation.navigate("Location", {
      conversation: conversation,
    });
  };

  useEffect(() => {
    if (route.params?.locationMessage) {
      const locationData = route.params.locationMessage;
      navigation.setParams({ locationMessage: undefined });

      if (locationData.isLocation) {
        sendMessage({
          ...locationData,
          type: "TEXT",
        });
      }
    }
  }, [route.params?.locationMessage]);

  const sendMessage = async (messageData = null) => {
    const isLocationMessage =
      messageData?.isLocation &&
      messageData.content &&
      /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(messageData.content);

    if (
      (!newMessage.trim() &&
        !messageData?.files?.length &&
        !messageData?.content &&
        !isLocationMessage) ||
      !socket ||
      !currentUser ||
      !conversation?._id
    ) {
      return;
    }

    const content = messageData?.content || newMessage.trim();
    const files = messageData?.files || [];

    let messageType = "TEXT";
    if (files.length > 0) {
      const mimetype = files[0]?.type;
      if (mimetype.startsWith("image/") || mimetype === "image") {
        messageType = "IMAGE";
      } else if (mimetype.startsWith("video/") || mimetype === "video") {
        messageType = "VIDEO";
      } else if (mimetype.startsWith("audio/") || mimetype === "audio") {
        messageType = "AUDIO";
      } else {
        messageType = "FILE";
      }
    }

    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const tempMessage = {
      _id: tempId,
      content,
      sender: {
        _id: currentUser._id,
        avatar: currentUser.avatar,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
      },
      conversation: conversation._id,
      createdAt: new Date().toISOString(),
      status: "sending",
      type: messageType,
      address: messageData?.address,
      isLocation: messageData?.isLocation,
      files: files.map((file) => ({
        fileName: file.name || file.fileName || file.uri.split("/").pop(),
        url: file.uri,
      })),
    };

    setTempMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      let response;
      const messagePayload = {
        content,
        type: messageType,
        sender: currentUser._id,
        address: messageData?.address,
        isLocation: messageData?.isLocation,
      };

      if (files.length > 0) {
        const preparedFiles = files.map((file) => ({
          uri: file.uri,
          type:
            file.type && file.type.includes("/")
              ? file.type
              : (() => {
                  const fileName =
                    file.name ||
                    file.fileName ||
                    file.uri?.split("/").pop() ||
                    "";
                  const ext = fileName.split(".").pop()?.toLowerCase();

                  switch (ext) {
                    case "jpg":
                    case "jpeg":
                      return "image/jpeg";
                    case "png":
                      return "image/png";
                    case "gif":
                      return "image/gif";
                    case "mp4":
                      return "video/mp4";
                    case "mp3":
                      return "audio/mpeg";
                    case "pdf":
                      return "application/pdf";
                    default:
                      return "application/octet-stream";
                  }
                })(),
          name: file.name || file.fileName || file.uri.split("/").pop(),
        }));

        response = await chatService.sendMessageWithFiles(
          conversation._id,
          messagePayload,
          preparedFiles
        );
      } else {
        response = await chatService.sendMessageWithFile(
          conversation._id,
          messagePayload
        );
      }

      if (response.success) {
        setTempMessages((prev) => prev.filter((msg) => msg._id !== tempId));

        const newMessage = {
          ...response.data,
          sender: {
            _id: currentUser._id,
            avatar: currentUser.avatar,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
          },
        };

        socket.emit("sendMessageToServer", {
          message: newMessage,
          conversationId: conversation._id,
          senderId: currentUser._id,
        });

        socket.emit("sendMessage", {
          message: newMessage,
          conversationId: conversation._id,
          senderId: currentUser._id,
        });
      } else {
        throw new Error(response.error || "Không thể gửi tin nhắn");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setTempMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
    }
  };

  const handleSubmitEditing = () => {
    if (newMessage.trim()) {
      sendMessage();
    }
  };

  const handlePressSend = () => {
    if (newMessage.trim()) {
      sendMessage();
    }
  };

  const handlePressLike = () => {
    sendMessage({ content: "👍" });
  };

  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert(
          "Xin lỗi, chúng tôi cần quyền truy cập camera để thực hiện điều này!"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        const preparedFile = {
          uri: asset.uri,
          type: asset.type || "image/jpeg",
          name: asset.fileName || `photo-${Date.now()}.jpg`,
          size: asset.fileSize || asset.size || 0,
        };

        await sendMessage({ files: [preparedFile] });
      }
    } catch (err) {
      console.error("Error using camera:", err);
      alert("Không thể mở camera. Vui lòng thử lại.");
    }
  };

  const handleGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert(
          "Xin lỗi, chúng tôi cần quyền truy cập thư viện ảnh để thực hiện điều này!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsMultipleSelection: true,
        selectionLimit: 10,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const preparedFiles = result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.type || "image/jpeg",
          name: asset.fileName || `image-${Date.now()}-${Math.random()}.jpg`,
          size: asset.fileSize || asset.size || 0,
        }));

        await sendMessage({ files: preparedFiles });
      }
    } catch (error) {
      console.error("Error picking images:", error);
      alert("Có lỗi khi truy cập thư viện ảnh. Vui lòng thử lại.");
    }
  };

  const handleDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (
        result.assets &&
        Array.isArray(result.assets) &&
        result.assets.length > 0
      ) {
        const file = result.assets[0];

        if (!file.uri || !file.mimeType) {
          throw new Error("Invalid file selected");
        }

        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
          alert("File size must be less than 10MB");
          return;
        }

        const validFile = {
          uri: file.uri,
          type: file.mimeType,
          name: file.name,
          size: file.size,
        };

        await sendMessage({ files: [validFile] });
      }
    } catch (error) {
      console.error("Error picking documents:", error);
      alert(error.message || "Error selecting documents");
    }
  };

  const handleVideo = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const videoAsset = result.assets[0];

        const videoMessage = {
          files: [
            {
              uri: videoAsset.uri,
              type: "video/mp4",
              name: `video-${Date.now()}.mp4`,
            },
          ],
          type: "VIDEO",
        };

        await sendMessage(videoMessage);
      }
    } catch (error) {
      console.error("Error picking video:", error);
      alert("Could not select video. Please try again.");
    }
  };

  const renderMessageContent = (item) => {
    if (!item || !item.sender) {
      return null;
    }

    const isMyMessage = currentUser && item.sender._id === currentUser._id;
    const isTemp = item._id && item._id.startsWith("temp-");

    const isLocationMessage =
      (item.content && /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(item.content)) ||
      item.isLocation;

    if (isLocationMessage) {
      const [latitude, longitude] = item.content
        ? item.content.split(",").map(Number)
        : [0, 0];

      return (
        <View
          style={{
            width: 200,
            backgroundColor: isMyMessage ? "#0099ff" : "#e4e4e4",
            borderRadius: 12,
            overflow: "hidden",
          }}
          onPress={() =>
            navigation.navigate("Location", {
              conversation: conversation,
              initialLocation: { latitude, longitude },
            })
          }
        >
          <Image
            source={{
              uri: `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=200x150&markers=color:red|${latitude},${longitude}&key=YOUR_API_KEY`,
            }}
            style={{ width: "100%", height: 120 }}
          />
          <View
            style={{ flexDirection: "row", alignItems: "center", padding: 8 }}
          >
            <Avatar.Icon
              size={24}
              icon="map-marker"
              style={{
                backgroundColor: isMyMessage
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(102,102,102,0.1)",
                marginRight: 8,
              }}
            />
            <Text
              variant="bodySmall"
              style={{
                color: isMyMessage ? "#fff" : "#333",
                fontSize: 14,
                flex: 1,
              }}
              numberOfLines={2}
            >
              {item.address || "Đã chia sẻ vị trí"}
            </Text>
          </View>
        </View>
      );
    }

    switch (item.type) {
      case "IMAGE":
        if (!item.files || item.files.length === 0) {
          return null;
        }

        if (item.files.length > 1) {
          const numColumns = 2;
          const imageSize = 110; // Adjusted for better fit
          const spacing = 4;

          // Determine layout based on number of images
          const layout =
            item.files.length === 2
              ? { columns: 2, rows: 1 }
              : { columns: 2, rows: Math.ceil(item.files.length / 2) };

          return (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                width: layout.columns * (imageSize + spacing) + spacing,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {item.files.map((file, index) => (
                <TouchableOpacity
                  key={file._id || index}
                  style={{
                    width: imageSize,
                    height: imageSize,
                    margin: spacing / 2,
                  }}
                  onPress={() =>
                    navigation.navigate("ImageViewer", { uri: file.url })
                  }
                >
                  <Image
                    source={{ uri: file.url }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 8,
                    }}
                  />
                  {item.files.length > 4 && index === 3 && (
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 24 }}>
                        +{item.files.length - 4}
                      </Text>
                    </View>
                  )}
                  {isTemp && item.status === "sending" && (
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 8,
                      }}
                    >
                      <ActivityIndicator color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          );
        }

        return (
          <TouchableOpacity
            style={{
              width: 200,
              height: 200,
              borderRadius: 12,
              overflow: "hidden",
            }}
            onPress={() =>
              navigation.navigate("ImageViewer", { uri: item.files[0].url })
            }
          >
            <Image
              source={{ uri: item.files[0].url }}
              style={{ width: "100%", height: "100%" }}
            />
            {isTemp && item.status === "sending" && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        );
      case "VIDEO":
        return (
          <TouchableOpacity
            style={{
              width: 280,
              height: 200,
              borderRadius: 12,
              overflow: "hidden",
            }}
            onPress={() =>
              navigation.navigate("VideoPlayer", { uri: item.files[0]?.url })
            }
          >
            <Video
              source={{ uri: item.files[0]?.url }}
              style={{ width: "100%", height: "100%" }}
              useNativeControls
              resizeMode="cover"
              shouldPlay={false}
            />
            <IconButton
              icon="play"
              size={24}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: [{ translateX: -12 }, { translateY: -12 }],
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
              iconColor="#fff"
            />
            {isTemp && item.status === "sending" && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        );
      case "AUDIO":
        return <AudioMessage file={item.files[0]} isMyMessage={isMyMessage} />;
      case "FILE":
        const file = item.files && item.files[0];
        const fileName =
          file?.fileName || file?.url?.split("/").pop() || "Unknown File";
        const fileUrl = file?.url || "";
        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
          fileUrl
        )}&embedded=true`;

        // Debugging log to confirm fileName
        // console.log(`Rendering file message - fileName: ${fileName}`);

        return (
          <TouchableOpacity
            style={{
              marginVertical: 4,
              backgroundColor: isMyMessage ? "#0099ff" : "#e4e4e4",
              borderRadius: 12,
              padding: 8,
              flexDirection: "row",
              alignItems: "center",
              maxWidth: 280,
              minWidth: 200,
            }}
            onPress={() => Linking.openURL(viewerUrl)}
          >
            <Avatar.Icon
              size={28}
              icon={getFileIcon(fileName)}
              style={{
                backgroundColor: isMyMessage
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(102,102,102,0.1)",
                marginRight: 10,
              }}
            />
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text
                variant="bodyMedium"
                style={{
                  color: isMyMessage ? "#fff" : "#333",
                  fontSize: 15,
                  fontWeight: "500",
                  lineHeight: 20,
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {decodeURIComponent(fileName)}
              </Text>
            </View>
            {isTemp && item.status === "sending" && (
              <ActivityIndicator
                size="small"
                color={isMyMessage ? "#fff" : "#666"}
                style={{ marginLeft: 10 }}
              />
            )}
          </TouchableOpacity>
        );
      default:
        if (item.isRevoked) {
          return (
            <Text
              variant="bodySmall"
              style={{ color: "#888", fontStyle: "italic", fontSize: 14 }}
            >
              Tin nhắn đã được thu hồi
            </Text>
          );
        }

        if (item.deletedFor && item.deletedFor.includes(authenticated)) {
          return null;
        }

        return (
          <Text
            variant="bodyMedium"
            style={{ color: isMyMessage ? "#fff" : "#333", fontSize: 16 }}
          >
            {item.content || ""}
          </Text>
        );
    }
  };

  const renderMessage = ({ item, index }) => {
    if (!item || !item.sender) {
      return null;
    }

    const isMyMessage = currentUser && item.sender._id === currentUser._id;
    const isTemp = item._id && item._id.startsWith("temp-");
    const messageAvatar = isMyMessage ? currentUser.avatar : item.sender.avatar;
    const defaultAvatar = require("../../../assets/chat/avatar.png");

    if (item.deletedFor?.includes(authenticated)) {
      return null;
    }

    // Determine if avatar should be shown (only for the last message in a sequence)
    let showAvatar = false;
    const isLastMessage =
      index === combinedMessages.length - 1 ||
      combinedMessages[index + 1]?.sender?._id !== item.sender._id ||
      new Date(combinedMessages[index + 1]?.createdAt) -
        new Date(item.createdAt) >
        60000;

    if (isLastMessage) {
      showAvatar = true;
    }

    return (
      <View
        style={{
          flexDirection: "row",
          marginVertical: 2,
          marginHorizontal: 8,
          alignItems: "flex-end",
          justifyContent: isMyMessage ? "flex-end" : "flex-start",
        }}
      >
        {!isMyMessage && (
          <View style={{ width: 28, height: 28, marginRight: 8 }}>
            {showAvatar && (
              <Avatar.Image
                size={28}
                source={messageAvatar ? { uri: messageAvatar } : defaultAvatar}
              />
            )}
            {!isMyMessage && showAvatar && isOnline && (
              <View
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#00ff00",
                  borderWidth: 1,
                  borderColor: "#fff",
                }}
              />
            )}
          </View>
        )}
        <View
          style={{
            maxWidth: "75%",
          }}
        >
          <TouchableOpacity
          style={{
            backgroundColor: isMyMessage ? "#0099ff" : "#e4e4e4",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderBottomLeftRadius: isMyMessage ? 16 : showAvatar ? 4 : 16,
            borderBottomRightRadius: 16,
            padding: item.type === "TEXT" ? 10 : 0,
            overflow: "hidden",
            alignSelf: isMyMessage ? "flex-end" : "flex-start",
            marginLeft: isMyMessage ? 50 : 0, 
          }}
            onLongPress={() => {
              if (!isTemp) {
                setSelectedMessage(item);
                setShowMessageOptions(true);
              }
            }}
          >
            {renderMessageContent(item)}
            {item.type === "TEXT" && !item.isRevoked && (
              <Text
                variant="labelSmall"
                style={{
                  color: isMyMessage ? "rgba(255,255,255,0.7)" : "#666",
                  fontSize: 10,
                  marginTop: 4,
                  textAlign: "right",
                }}
              >
                {item.createdAt
                  ? format(new Date(item.createdAt), "HH:mm")
                  : ""}
                {isTemp && item.status === "sending" && (
                  <ActivityIndicator
                    size="small"
                    color={isMyMessage ? "rgba(255,255,255,0.7)" : "#666"}
                    style={{ marginLeft: 4, display: "inline" }}
                  />
                )}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        {isMyMessage && (
          <View style={{ width: 28, height: 28, marginLeft: 8 }}>
            {showAvatar && (
              <Avatar.Image
                size={28}
                source={messageAvatar ? { uri: messageAvatar } : defaultAvatar}
              />
            )}
          </View>
        )}
      </View>
    );
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return "file-document-outline";
    const ext = fileName.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return "file-pdf-box"; // Updated to valid Material Community Icon
      case "doc":
      case "docx":
        return "file-word";
      case "xls":
      case "xlsx":
        return "file-excel";
      case "zip":
      case "rar":
        return "file-archive";
      default:
        return "file-document-outline";
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchMessages();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleMessagePin = async (message) => {
    try {
      if (pinnedMessage?._id === message._id) {
        setPinnedMessage(null);
      } else {
        setPinnedMessage(message);
      }
      setShowMessageOptions(false);
    } catch (error) {
      console.error("Error pinning/unpinning message:", error);
      alert("Không thể ghim/bỏ ghim tin nhắn. Vui lòng thử lại.");
    }
  };

  const PinnedMessageBar = () => {
    if (!pinnedMessage) return null;

    const renderPinnedContent = () => {
      switch (pinnedMessage.type) {
        case "IMAGE":
          return (
            <Avatar.Image
              size={24}
              source={{ uri: pinnedMessage.files[0]?.url }}
              style={{ marginRight: 8 }}
            />
          );
        case "FILE":
          return (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Avatar.Icon
                size={16}
                icon={getFileIcon(pinnedMessage.files[0]?.fileName)}
                style={{ backgroundColor: "#e4e4e4" }}
              />
              <Text
                variant="bodySmall"
                style={{ marginLeft: 8, color: "#666", fontSize: 14 }}
                numberOfLines={1}
              >
                {pinnedMessage.files[0]?.fileName || "File"}
              </Text>
            </View>
          );
        default:
          return (
            <Text
              variant="bodySmall"
              style={{ color: "#666", fontSize: 14 }}
              numberOfLines={1}
            >
              {pinnedMessage.content}
            </Text>
          );
      }
    };

    return (
      <Surface
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 8,
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: 12,
          marginHorizontal: 12,
          marginVertical: 4,
          elevation: 1,
        }}
      >
        <Avatar.Icon size={16} icon="pin" style={{ marginRight: 8 }} />
        <View style={{ flex: 1 }}>{renderPinnedContent()}</View>
        <IconButton
          icon="close"
          size={20}
          onPress={() => handleMessagePin(pinnedMessage)}
        />
      </Surface>
    );
  };

  const handleMessageForward = async (message) => {
    try {
      setSelectedMessage(message);
      const response = await chatService.getMyConversations();
      if (response.data) {
        const availableConversations = response.data
          .filter((conv) => conv._id !== conversation._id)
          .map((conv) => {
            let name = conv.name;
            let avatar = conv.avatar;

            if ((!name || !avatar) && conv.members && conv.members.length > 0) {
              const otherMember = conv.members.find(
                (m) => m._id !== currentUser._id
              );
              if (otherMember) {
                name = `${otherMember.firstName} ${otherMember.lastName}`;
                avatar = otherMember.avatar;
              }
            }

            return {
              _id: conv._id,
              name: name || "Người dùng",
              avatar: avatar,
            };
          })
          .filter((conv) => conv.name !== "Người dùng");

        setFriends(availableConversations);
        setShowForwardModal(true);
        setShowMessageOptions(false);
      }
    } catch (error) {
      console.error("Error preparing forward:", error);
      alert("Không thể tải danh sách bạn bè. Vui lòng thử lại.");
    }
  };

  const handleSendForward = async () => {
    try {
      if (selectedFriends.length === 0) {
        alert("Vui lòng chọn người nhận");
        return;
      }

      if (!selectedMessage || !selectedMessage._id) {
        alert("Không thể chuyển tiếp tin nhắn. Vui lòng thử lại.");
        return;
      }

      if (!currentUser || !currentUser._id) {
        alert("Vui lòng đăng nhập lại.");
        return;
      }

      const forwardData = {
        originalMessageId: selectedMessage._id,
        conversationIds: selectedFriends.map((f) => f._id),
        sender: currentUser._id,
        type: selectedMessage.type || "TEXT",
        content: selectedMessage.content,
        files: selectedMessage.files || [],
      };

      const response = await chatService.forwardMessage(forwardData);
      if (response.success) {
        setShowForwardModal(false);
        setSelectedFriends([]);
        alert("Đã chuyển tiếp tin nhắn thành công");
      } else {
        throw new Error(response.error || "Không thể chuyển tiếp tin nhắn");
      }
    } catch (error) {
      console.error("Error forwarding message:", error);
      alert(
        error.message || "Không thể chuyển tiếp tin nhắn. Vui lòng thử lại."
      );
    } finally {
      setShowForwardModal(false);
      setSelectedFriends([]);
    }
  };

  const handleMessageDelete = async (message) => {
    try {
      if (!message || !message._id) {
        throw new Error("Invalid message");
      }

      const response = await chatService.revokeMessageBoth(
        message._id,
        conversation._id
      );

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === message._id ? { ...msg, isRevoked: true } : msg
        )
      );

      socket.on("revokeMessage", (deletedMessage) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === deletedMessage._id ? deletedMessage : msg
          )
        );
      });

      setShowMessageOptions(false);
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Không thể xóa tin nhắn. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("revokeMessage", (deletedMessage) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === deletedMessage._id ? deletedMessage : msg
          )
        );
      });

      return () => {
        socket.off("revokeMessage");
      };
    }
  }, [socket]);

  const handleDeleteForMe = async (message) => {
    try {
      if (!message || !message._id) {
        throw new Error("Invalid message");
      }

      const response = await chatService.deleteMessageForMe(message._id);

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === message._id
            ? { ...msg, deletedFor: response.data.deletedFor }
            : msg
        )
      );

      socket.on("deleteMessage", (deletedMessage) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === deletedMessage._id ? deletedMessage : msg
          )
        );
      });

      setShowMessageOptions(false);
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Không thể xóa tin nhắn. Vui lòng thử lại.");
    }
  };

  const toggleSelectFriend = (friend) => {
    setSelectedFriends((prev) => {
      const isSelected = prev.some((f) => f._id === friend._id);
      if (isSelected) {
        return prev.filter((f) => f._id !== friend._id);
      } else {
        return [...prev, friend];
      }
    });
  };

  const ForwardModal = () => {
    if (!showForwardModal) return null;

    return (
      <Portal>
        <PaperModal
          visible={showForwardModal}
          onDismiss={() => {
            setShowForwardModal(false);
            setSelectedFriends([]);
          }}
          contentContainerStyle={{
            backgroundColor: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "80%",
            minHeight: "50%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 16,
            }}
          >
            <Text variant="titleLarge">Chuyển tiếp tin nhắn</Text>
            <IconButton
              icon="close"
              onPress={() => {
                setShowForwardModal(false);
                setSelectedFriends([]);
              }}
            />
          </View>
          {friends.length > 0 ? (
            <FlatList
              data={friends}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => (
                <List.Item
                  title={item.name || "Người dùng"}
                  left={() => (
                    <Avatar.Image
                      size={40}
                      source={
                        item.avatar
                          ? { uri: item.avatar }
                          : require("../../../assets/chat/avatar.png")
                      }
                    />
                  )}
                  right={() =>
                    selectedFriends.some((f) => f._id === item._id) && (
                      <Avatar.Icon
                        size={24}
                        icon="check-circle"
                        style={{ backgroundColor: "#0099ff" }}
                      />
                    )
                  }
                  onPress={() => toggleSelectFriend(item)}
                  style={{
                    backgroundColor: selectedFriends.some(
                      (f) => f._id === item._id
                    )
                      ? "#f0f8ff"
                      : "transparent",
                  }}
                />
              )}
            />
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text variant="bodyMedium">Không có cuộc trò chuyện nào</Text>
            </View>
          )}
          <Button
            mode="contained"
            onPress={handleSendForward}
            disabled={selectedFriends.length === 0}
            style={{ margin: 16 }}
          >
            Chuyển tiếp ({selectedFriends.length})
          </Button>
        </PaperModal>
      </Portal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <Surface
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 8,
            backgroundColor: "#135CAF",
            elevation: 0,
          }}
        >
          <IconButton
            icon="chevron-left"
            iconColor="#fff"
            onPress={handleReturn}
          />
          <Text variant="titleMedium" style={{ color: "#fff" }}>
            Loading...
          </Text>
        </Surface>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#0099ff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <PaperProvider theme={customTheme}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 0 : 0}
        >
          <Surface
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 8,
              backgroundColor: "#135CAF",
              elevation: 0,
            }}
          >
            <IconButton
              icon="chevron-left"
              iconColor="#fff"
              size={24}
              onPress={handleReturn}
            />
            <TouchableOpacity
              onPress={() => {
                if (conversation) {
                  navigation.navigate("UserInfo", {
                    conversation: {
                      _id: conversation._id,
                      name: conversation.name || (otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Chat"),
                      members: conversation.members || [],
                      avatar: conversation.avatar || (otherUser ? otherUser.avatar : null),
                      isGroup: conversation.isGroup || false,
                      isOnline: isOnline,
                      user: otherUser,
                    },
                  });
                }
              }}
            >
              <View style={{ position: "relative" }}>
                <Avatar.Image
                  size={36}
                  source={
                    conversation?.isGroup
                      ? (conversation.avatar
                          ? { uri: conversation.avatar }
                          : require("../../../assets/chat/avatar.png"))
                      : (otherUser?.avatar
                          ? { uri: otherUser.avatar }
                          : require("../../../assets/chat/avatar.png"))
                  }
                  style={{ marginHorizontal: 8 }}
                />
                {!conversation?.isGroup && isOnline && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 8,
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "#00ff00",
                      borderWidth: 1,
                      borderColor: "#fff",
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => {
                if (conversation) {
                  navigation.navigate("UserInfo", {
                    conversation: {
                      _id: conversation._id,
                      name: conversation.name || (otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Chat"),
                      members: conversation.members || [],
                      avatar: conversation.avatar || (otherUser ? otherUser.avatar : null),
                      isGroup: conversation.isGroup || false,
                      isOnline: isOnline,
                      user: otherUser,
                    },
                  });
                }
              }}
            >
              <Text
                variant="titleMedium"
                style={{ color: "#fff", fontSize: 18 }}
              >
                {conversation?.isGroup
                  ? conversation.name || "Group Chat"
                  : (otherUser
                      ? otherUser.name || `${otherUser.firstName} ${otherUser.lastName}`
                      : "Chat")}
              </Text>
              <Text variant="bodySmall" style={{ color: "#fff", fontSize: 12 }}>
                {conversation?.isGroup 
                  ? (conversation.members ? `${conversation.members.length} members` : "Group chat")
                  : (isOnline ? "Online" : "Offline")}
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row" }}>
              {!conversation?.isGroup && (
                <>
                  <IconButton
                    icon="phone"
                    iconColor="#fff"
                    size={24}
                    onPress={() => Alert.alert("Audio call")}
                  />
                  <IconButton
                    icon="video"
                    iconColor="#fff"
                    size={24}
                    onPress={() => Alert.alert("Video call")}
                  />
                </>
              )}
              <IconButton
                icon="dots-vertical"
                iconColor="#fff"
                size={24}
                onPress={() => {
                  if (conversation) {
                    navigation.navigate("UserInfo", {
                      conversation: {
                        _id: conversation._id,
                        name: conversation.name || (otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Chat"),
                        members: conversation.members || [],
                        avatar: conversation.avatar || (otherUser ? otherUser.avatar : null),
                        isGroup: conversation.isGroup || false,
                        isOnline: isOnline,
                        user: otherUser,
                      },
                    });
                  }
                }}
              />
            </View>
          </Surface>

          <PinnedMessageBar />

          <ImageBackground
            source={{
              uri: "https://i.pinimg.com/474x/d1/df/71/d1df71180f6604a205baa38b4dd231b4.jpg",
            }}
            style={{ flex: 1 }}
            resizeMode="cover"
          >
            <FlatList
              data={combinedMessages}
              renderItem={renderMessage}
              keyExtractor={(item) => item._id}
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingTop: pinnedMessage ? 40 : 8,
                paddingBottom: 80,
              }}
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
          </ImageBackground>

          <Surface
            style={{
              flexDirection: "row",
              alignItems: "center",
              alignSelf: "center",
              width: "100%",
              position: "absolute",
              bottom: 0,
              backgroundColor: "#fff",
              borderTopWidth: 1,
              borderTopColor: "#e4e4e4",
              paddingHorizontal: 4,
              paddingVertical: 6,
              borderRadiusTopLeft: 20,
              borderRadiusTopRight: 20,
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          >
            <IconButton
              icon="plus-circle"
              iconColor="#0099ff"
              size={26}
              style={{ marginRight: 4 }}
              onPress={() => setShowOptions(true)}
            />
            <TextInput
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                backgroundColor: "#f5f5f5",
                borderRadius: 20,
                fontSize: 16,
                color: "#333",
              }}
              placeholder="Type a message..."
              placeholderTextColor="#888"
              value={newMessage}
              onChangeText={(text) => setNewMessage(text)}
              onSubmitEditing={handleSubmitEditing}
              onFocus={scrollToBottom}
            />
            {newMessage.trim().length > 0 ? (
              <IconButton
                icon="send"
                iconColor="#fff"
                size={26}
                style={{
                  backgroundColor: "#0099ff",
                  borderRadius: 20,
                  marginLeft: 8,
                }}
                onPress={handlePressSend}
              />
            ) : (
              <IconButton
                icon="thumb-up"
                iconColor="#0099ff"
                size={26}
                style={{ marginLeft: 8 }}
                onPress={handlePressLike}
              />
            )}
          </Surface>
        </KeyboardAvoidingView>

        <ChatOptions
          visible={showOptions}
          onClose={() => setShowOptions(false)}
          onCamera={handleCamera}
          onGallery={handleGallery}
          onLocation={handleLocation}
          onDocument={handleDocument}
          onVideo={handleVideo}
          onAudio={() => {
            setShowOptions(false);
            setShowAudioRecording(true);
          }}
        />

        <AudioRecordingModal
          visible={showAudioRecording}
          onClose={() => setShowAudioRecording(false)}
          onSend={sendMessage}
        />

        <Portal>
          <PaperModal
            visible={showMessageOptions}
            onDismiss={() => setShowMessageOptions(false)}
            contentContainerStyle={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 16,
              margin: 16,
            }}
          >
            <List.Item
              title="Ghim tin nhắn"
              left={() => <List.Icon icon="pin" />}
              onPress={() => handleMessagePin(selectedMessage)}
            />
            <List.Item
              title="Chuyển tiếp"
              left={() => <List.Icon icon="arrow-right" />}
              onPress={() => handleMessageForward(selectedMessage)}
            />
            <List.Item
              title="Thu hồi tin nhắn ở phía bạn"
              left={() => <List.Icon icon="trash-can" color="#e74c3c" />}
              titleStyle={{ color: "#e74c3c" }}
              onPress={() => handleDeleteForMe(selectedMessage)}
            />
            <List.Item
              title="Xóa tin nhắn"
              left={() => <List.Icon icon="trash-can" color="#e74c3c" />}
              titleStyle={{ color: "#e74c3c" }}
              onPress={() => handleMessageDelete(selectedMessage)}
            />
          </PaperModal>
        </Portal>

        <ForwardModal />
      </SafeAreaView>
    </PaperProvider>
  );
};

export default ChatDetailScreen;
