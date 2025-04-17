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
  Alert,
  Animated,
} from "react-native";
import WebView from 'react-native-webview';

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
import axiosInstance from "../../config/axiosInstance";
import { format } from "date-fns";
import ChatOptions from "../chat/components/ChatOptions";
import { chatService } from "../../services/chat.service";
import useAuthStore from "../../store/useAuthStore";
import { Video } from 'expo-av';
import { Audio } from 'expo-av';

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
        // First unload any existing sound
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        // Configure audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false
        });

        console.log('Creating sound object...');
        const { sound: newSound, status } = await Audio.Sound.createAsync(
          { uri: file.url },
          { 
            shouldPlay: false,
            isLooping: false,
            progressUpdateIntervalMillis: 100,
          },
          onPlaybackStatusUpdate
        );

        console.log('Sound created:', newSound);
        console.log('Initial status:', status);

        if (isMounted) {
          soundRef.current = newSound;
          if (status.isLoaded) {
            setDuration(status.durationMillis);
            setPosition(status.positionMillis);
            setError(null);
          } else {
            setError('Failed to load audio');
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Audio initialization error:', err);
        if (isMounted) {
          setError('Could not load audio');
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
            console.log('Unloading sound...');
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }
        } catch (err) {
          console.error('Cleanup error:', err);
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
      console.log('Current sound object:', sound);

      if (!sound) {
        console.error('No sound object available');
        setError('Audio not ready');
        return;
      }

      const status = await sound.getStatusAsync();
      console.log('Current status:', status);

      if (!status.isLoaded) {
        console.error('Sound not loaded');
        setError('Audio not ready');
        return;
      }

      console.log('Attempting to play/pause...');
      if (status.isPlaying) {
        await soundRef.current.setStatusAsync({ shouldPlay: false });
        console.log('Paused successfully');
      } else {
        if (!soundRef.current._loaded) {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: file.url },
            { shouldPlay: true },
            onPlaybackStatusUpdate
          );
          soundRef.current = newSound;
        } else {
          await soundRef.current.setStatusAsync({ 
            shouldPlay: true,
            positionMillis: position,
            isLooping: false,
            volume: 1.0,
            rate: 1.0,
          });
        }
        console.log('Playing successfully');
      }
    } catch (err) {
      console.error('Playback error:', err);
      setError('Playback failed');
      
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
        console.error('Recovery failed:', recoveryErr);
        setError('Could not recover playback');
      }
    }
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds) return '0:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={[
      styles.audioContainer,
      isMyMessage ? styles.userMessage : styles.friendMessage
    ]}>
      <TouchableOpacity 
        onPress={handlePlayPause}
        style={styles.audioPlayButton}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={isMyMessage ? "#fff" : "#666"} size="small" />
        ) : (
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={24} 
            color={isMyMessage ? "#fff" : "#666"} 
          />
        )}
      </TouchableOpacity>

      <View style={styles.audioContent}>
        <View style={styles.audioProgressBar}>
          <View 
            style={[
              styles.audioProgress,
              { width: `${progress}%` },
              isMyMessage ? { backgroundColor: '#fff' } : { backgroundColor: '#135CAF' }
            ]} 
          />
        </View>
        <Text style={[
          styles.audioDuration,
          isMyMessage ? styles.userMessageText : styles.friendMessageText
        ]}>
          {error ? error : `${formatTime(position)} / ${formatTime(duration)}`}
        </Text>
      </View>
    </View>
  );
};

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
        Alert.alert("Permission required", "Please grant microphone permission to record audio.");
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
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', 'Could not start recording. Please try again.');
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
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Could not save the recording. Please try again.');
    }
  };

  const handleSend = async () => {
    if (recordedUri) {
      const audioMessage = {
        files: [{
          uri: recordedUri,
          type: 'audio/m4a',
          name: `audio-${Date.now()}.m4a`
        }],
        type: 'AUDIO'
      };
      await onSend(audioMessage);
      onClose();
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.audioRecordingContainer}>
          <View style={styles.audioRecordingHeader}>
            <Text style={styles.audioRecordingTitle}>Ghi âm tin nhắn</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.audioRecordingContent}>
            <Text style={styles.recordingDuration}>
              {formatDuration(recordingDuration)}
            </Text>

            <View style={styles.recordingControls}>
              {!recordedUri ? (
                <TouchableOpacity
                  onPress={isRecording ? stopRecording : startRecording}
                  style={[
                    styles.recordButton,
                    isRecording && styles.recordingActive
                  ]}
                >
                  <Ionicons
                    name={isRecording ? "stop" : "mic"}
                    size={32}
                    color={isRecording ? "#fff" : "#ff4444"}
                  />
                </TouchableOpacity>
              ) : (
                <View style={styles.recordingActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setRecordedUri(null);
                      setRecordingDuration(0);
                    }}
                    style={styles.recordingActionButton}
                  >
                    <Ionicons name="refresh" size={24} color="#666" />
                    <Text style={styles.recordingActionText}>Ghi lại</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSend}
                    style={[styles.recordingActionButton, styles.sendButton]}
                  >
                    <Ionicons name="send" size={24} color="#fff" />
                    <Text style={[styles.recordingActionText, { color: '#fff' }]}>
                      Gửi
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ChatDetailScreen = ({ navigation, route }) => {
  console.log("ChatDetailScreen mounted with route params:", route.params);
  const { conversation } = route.params || {};
  console.log("Extracted conversation:", conversation);

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

  const [showAudioRecording, setShowAudioRecording] = useState(false);

  const handleReturn = () => {
    navigation.navigate("Home_Chat");
  };

  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log("Initializing chat with conversation:", conversation);
        
        if (!conversation || !conversation._id) {
          console.error("Invalid or missing conversation object:", conversation);
          alert("Error: Invalid conversation data. Please try again.");
          navigation.goBack();
          return;
        }

        setLoading(true);

        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const currentUserData = JSON.parse(userData);
          setCurrentUser(currentUserData);
          console.log("Current user:", currentUserData);

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

          const socketInstance = getSocket();
          console.log("Got existing socket:", socketInstance ? "yes" : "no");

          if (socketInstance) {
            console.log(
              "Socket connection status:",
              socketInstance.connected ? "connected" : "disconnected"
            );

            setSocket(socketInstance);
            setIsOnline(socketInstance.connected);

            console.log("Joining conversation room:", conversation._id);
            socketInstance.emit("join", {
              conversationId: conversation._id,
              userId: currentUserData._id,
            });

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

            socketInstance.off("messageReceived");
            socketInstance.off("newMessage");

            socketInstance.on("messageReceived", handleNewMessage);
            socketInstance.on("newMessage", handleNewMessage);

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
        console.log("Leaving conversation room:", conversation._id);
        socketInstance.emit("leave", {
          conversationId: conversation._id,
          userId: currentUser._id,
        });

        socketInstance.off("messageReceived");
        socketInstance.off("newMessage");
        socketInstance.off("connect");
        socketInstance.off("disconnect");
      }
    };
  }, [conversation]);

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
      const response = await chatService.getMessages(conversation._id);
      console.log("Messages response:", response);

      if (response && response.data) {
        let messagesData = response.data;

        if (messagesData.data && Array.isArray(messagesData.data)) {
          messagesData = messagesData.data;
        }
        const validMessages = messagesData.filter((msg) => {
          if (!msg || !msg.sender || !msg._id) {
            console.log("Invalid message format:", msg);
            return false;
          }
          return true;
        });

        const sortedMessages = validMessages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        console.log("Valid messages count:", validMessages.length);
        setMessages(sortedMessages);

        requestAnimationFrame(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        });
      } else {
        console.log("Invalid response format:", response);
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
    console.log("Removing temp message with ID:", messageId);
    setTempMessages((prev) => {
      const updatedMessages = prev.filter((msg) => msg._id !== messageId);
      console.log("Updated temp messages:", updatedMessages);
      return updatedMessages;
    });
  };

  const handleLocation = () => {
    setShowOptions(false);
    navigation.navigate("Location", {
      conversation: conversation
    });
  };

  // Add this useEffect to handle location messages
  useEffect(() => {
    if (route.params?.locationMessage) {
      console.log("Received location message:", route.params.locationMessage);
      const locationData = route.params.locationMessage;
      
      // Clear the params first to prevent duplicate sends
      navigation.setParams({ locationMessage: undefined });
      
      if (locationData.isLocation) {
        sendMessage({
          ...locationData,
          type: "TEXT" // Keep as TEXT type for location messages
        });
      }
    }
  }, [route.params?.locationMessage]);

  const sendMessage = async (messageData = null) => {
    console.log("SendMessage called with data:", messageData);

    // Special handling for location messages
    const isLocationMessage = messageData?.isLocation && messageData.content && /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(messageData.content);

    if (
      (!newMessage.trim() && !messageData?.files?.length && !messageData?.content && !isLocationMessage) ||
      !socket ||
      !currentUser ||
      !conversation?._id
    ) {
      console.log("Invalid data, aborting message send.");
      return;
    }

    const content = messageData?.content || newMessage.trim();
    const files = messageData?.files || [];

    let messageType = messageData?.type || "TEXT";
    if (files.length > 0 && !messageType) {
      messageType = "IMAGE";
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

    console.log("Creating temp message:", tempMessage);
    setTempMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      let response;
      const messagePayload = {
        content,
        type: messageType,
        sender: currentUser._id,
        address: messageData?.address,
        isLocation: messageData?.isLocation
      };

      if (files.length > 0) {
        const preparedFiles = files.map((file) => ({
          uri: file.uri,
          type: file.type || "image/jpeg",
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

      console.log("Send message response:", response);

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
        quality: 0.5,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        const preparedFile = {
          uri: asset.uri,
          type: asset.type || "image/jpeg",
          name: asset.fileName || `photo-${Date.now()}.jpg`,
          size: asset.fileSize || asset.size || 0,
        };

        console.log("Captured image for sending:", preparedFile);

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
        quality: 0.5,
        allowsMultipleSelection: true,
        selectionLimit: 10,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const preparedFiles = result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.type || "image/jpeg",
          name: asset.fileName || `image-${Date.now()}-${Math.random()}.jpg`,
          size: asset.fileSize || asset.size || 0,
        }));

        console.log("Prepared files for sending:", preparedFiles);
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
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (
        result.type === "success" ||
        (Array.isArray(result.assets) && result.assets.length > 0)
      ) {
        const files = Array.isArray(result.assets) ? result.assets : [result];
        await sendMessage({ files });
      }
    } catch (error) {
      console.error("Error picking documents:", error);
      alert("Error selecting documents");
    }
  };

  const handleVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
        console.log("Selected video:", videoAsset);

        // Create a video message
        const videoMessage = {
          files: [{
            uri: videoAsset.uri,
            type: 'video/mp4',
            name: `video-${Date.now()}.mp4`
          }],
          type: 'VIDEO'
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
      console.log("Invalid message item:", item);
      return null;
    }

    const isMyMessage = currentUser && item.sender._id === currentUser._id;
    const isTemp = item._id && item._id.startsWith("temp-");

    // Check if it's a location message either by content format or isLocation flag
    const isLocationMessage = (item.content && /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(item.content)) || item.isLocation;

    // If it's a location message, handle it
    if (isLocationMessage) {
      const [latitude, longitude] = item.content ? item.content.split(',').map(Number) : [0, 0];
      
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate("Location", {
            conversation: conversation,
            initialLocation: { latitude, longitude }
          })}
          style={[
            styles.locationMessageContainer,
            isMyMessage ? styles.userMessage : styles.friendMessage
          ]}
        >
          <View style={styles.mapPreviewContainer}>
            <WebView
              source={{ html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
                    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
                    <style>
                      html, body {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                      }
                      #map {
                        width: 100%;
                        height: 100%;
                        background: #f0f0f0;
                      }
                      .leaflet-control-container {
                        display: none;
                      }
                    </style>
                  </head>
                  <body>
                    <div id="map"></div>
                    <script>
                      try {
                        const map = L.map('map', {
                          zoomControl: false,
                          attributionControl: false,
                          dragging: false,
                          touchZoom: false,
                          scrollWheelZoom: false,
                          doubleClickZoom: false
                        }).setView([${latitude}, ${longitude}], 15);

                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                          maxZoom: 19,
                        }).addTo(map);

                        const marker = L.marker([${latitude}, ${longitude}]).addTo(map);
                      } catch (e) {
                        document.body.innerHTML = 'Error loading map: ' + e.message;
                      }
                    </script>
                  </body>
                </html>
              `}}
              style={styles.locationMapPreview}
              scrollEnabled={false}
              bounces={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              onError={(error) => console.error("Error loading map:", error)}
              androidHardwareAccelerationDisabled={true}
              onNavigationStateChange={(event) => {
                if (event.url !== 'about:blank') {
                  return false;
                }
              }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.mapOverlay}>
                  <ActivityIndicator size="small" color="#666" />
                </View>
              )}
            />
          </View>
          <View style={[
            styles.locationDetailsContainer,
            isMyMessage ? styles.userLocationDetails : styles.friendLocationDetails
          ]}>
            <View style={[
              styles.locationIconContainer,
              isMyMessage ? styles.userLocationIcon : styles.friendLocationIcon
            ]}>
              <Ionicons 
                name="location" 
                size={20} 
                color={isMyMessage ? "#fff" : "#666"} 
              />
            </View>
            <Text 
              style={[
                styles.locationAddressText,
                isMyMessage ? styles.userMessageText : styles.friendMessageText
              ]} 
              numberOfLines={2}
            >
              {item.address || "Đã chia sẻ vị trí"}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    switch (item.type) {
      case "IMAGE":
        if (!item.files || item.files.length === 0) {
          console.warn("No image files found");
          return null;
        }

        if (item.files.length > 1) {
          return (
            <View style={styles.imageGrid}>
              {item.files.map((file, index) => (
                <TouchableOpacity
                  key={file._id || index}
                  onPress={() =>
                    navigation.navigate("ImageViewer", { uri: file.url })
                  }
                  style={[
                    styles.gridImageContainer,
                    item.files.length === 3 &&
                      index === 2 &&
                      styles.gridImageLast,
                    item.files.length >= 4 &&
                      index === 3 &&
                      styles.gridImageLast,
                    item.files.length === 2 && { width: "50%" },
                    item.files.length === 3 && { width: "33.33%" },
                    item.files.length >= 4 && { width: "50%" },
                  ]}
                >
                  <Image
                    source={{ uri: file.url }}
                    style={styles.gridImage}
                    resizeMode="cover"
                  />
                  {item.files.length > 4 && index === 3 && (
                    <View style={styles.remainingCount}>
                      <Text style={styles.remainingCountText}>
                        +{item.files.length - 4}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          );
        }

        return (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ImageViewer", { uri: item.files[0].url })
            }
            style={styles.mediaContainer}
          >
            <Image
              source={{ uri: item.files[0].url }}
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
      case "VIDEO":
        return (
          <TouchableOpacity 
            style={styles.videoContainer}
            onPress={() => navigation.navigate("VideoPlayer", { uri: item.files[0]?.url })}
          >
            <Video
              source={{ uri: item.files[0]?.url }}
              style={styles.videoMessage}
              useNativeControls
              resizeMode="contain"
              shouldPlay={false}
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
      case "AUDIO":
        return (
          <AudioMessage 
            file={item.files[0]} 
            isMyMessage={currentUser && item.sender._id === currentUser._id} 
          />
        );
      case "FILE":
        const file = item.files && item.files[0];
        const fileName = file?.fileName || "File";
        const fileUrl = file?.url || "";

        if (!fileUrl) {
          console.warn("No file URL found");
          return null;
        }

        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
          fileUrl
        )}&embedded=true`;
        return (
          <TouchableOpacity
            style={styles.fileContainer}
            onPress={() => Linking.openURL(viewerUrl)}
          >
            <View style={styles.rowContainer}>
              <Ionicons
                name={getFileIcon(fileName)}
                size={27}
                color={isMyMessage ? "white" : "#666"}
              />
              <Text
                style={[styles.fileName, isMyMessage && styles.userMessageText]}
                numberOfLines={1}
              >
                {fileName || "Unnamed File"}
              </Text>
            </View>

            {isTemp && item.status === "sending" && (
              <ActivityIndicator
                size="small"
                color={isMyMessage ? "#fff" : "#666"}
                style={{ marginTop: 5 }}
              />
            )}
          </TouchableOpacity>
        );

      default:
        if (item.isRevoked) {
          return (
            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.userMessageText : styles.friendMessageText,
                { fontStyle: "italic", color: "#888" }, // ví dụ: style cho tin bị thu hồi
              ]}
            >
              Tin nhắn đã được thu hồi
            </Text>
          );
        }

        if (item.deletedFor && item.deletedFor.includes(authenticated)) {
          return <></>;
        }

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

  const renderMessage = ({ item }) => {
    if (!item || !item.sender) {
      console.log("Invalid message item:", item);
      return null;
    }

    // Ẩn tin nhắn nếu user hiện tại đã xóa
    if (item.deletedFor?.includes(authenticated)) {
      return null;
    }

    const isMyMessage = currentUser && item.sender._id === currentUser._id;
    const isTemp = item._id && item._id.startsWith("temp-");

    const messageAvatar = isMyMessage ? currentUser.avatar : item.sender.avatar;
    const defaultAvatar = require("../../../assets/chat/man.png");

    return (
      <View
        style={[
          styles.messageRow,
          isMyMessage ? styles.userMessageRow : styles.friendMessageRow,
        ]}
      >
        {!isMyMessage && (
          <Image
            source={messageAvatar ? { uri: messageAvatar } : defaultAvatar}
            style={styles.messageAvatar}
          />
        )}

        <TouchableOpacity
          style={[
            styles.messageContainer,
            isMyMessage ? styles.userMessage : styles.friendMessage,
          ]}
          onLongPress={() => {
            if (!isTemp) {
              setSelectedMessage(item);
              setShowMessageOptions(true);
            }
          }}
        >
          <View style={styles.messageContent}>
            {renderMessageContent(item)}

            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>
                {item.createdAt
                  ? format(new Date(item.createdAt), "HH:mm")
                  : ""}
              </Text>
              {isTemp && (
                <View style={styles.messageStatus}>
                  {item.status === "sending" && (
                    <ActivityIndicator size="small" color="#999" />
                  )}
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {isMyMessage && (
          <Image
            source={messageAvatar ? { uri: messageAvatar } : defaultAvatar}
            style={styles.messageAvatar}
          />
        )}
      </View>
    );
  };

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
            <Image
              source={{ uri: pinnedMessage.files[0]?.url }}
              style={styles.pinnedImage}
            />
          );
        case "FILE":
          return (
            <View style={styles.pinnedFileContainer}>
              <Ionicons
                name={getFileIcon(pinnedMessage.files[0]?.fileName)}
                size={16}
                color="#666"
              />
              <Text style={styles.pinnedFileName} numberOfLines={1}>
                {pinnedMessage.files[0]?.fileName || "File"}
              </Text>
            </View>
          );
        default:
          return (
            <Text style={styles.pinnedText} numberOfLines={1}>
              {pinnedMessage.content}
            </Text>
          );
      }
    };

    return (
      <View style={styles.pinnedMessageContainer}>
        <View style={styles.pinnedMessageContent}>
          <Ionicons
            name="pin"
            size={16}
            color="#666"
            style={styles.pinnedIcon}
          />
          {renderPinnedContent()}
        </View>
        <TouchableOpacity
          onPress={() => handleMessagePin(pinnedMessage)}
          style={styles.unpinButton}
        >
          <Ionicons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };

  const fetchFriends = async () => {
    try {
      const response = await chatService.getMyConversations();
      setFriends(response.data || []);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const handleMessageForward = async (message) => {
    try {
      console.log("Selected message for forwarding:", message);
      setSelectedMessage(message);

      const response = await chatService.getMyConversations();
      console.log("Conversations response:", response);

      if (response.data) {
        // Filter out current conversation and ensure conversation has required data
        const availableConversations = response.data
          .filter((conv) => conv._id !== conversation._id)
          .map((conv) => {
            let name = conv.name;
            let avatar = conv.avatar;

            // If no name/avatar, try to get from members
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

        console.log(
          "Available conversations for forwarding:",
          availableConversations
        );

        if (availableConversations.length === 0) {
          alert("Không có cuộc trò chuyện nào để chuyển tiếp");
          return;
        }

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
        console.error("No message selected for forwarding");
        alert("Không thể chuyển tiếp tin nhắn. Vui lòng thử lại.");
        return;
      }

      if (!currentUser || !currentUser._id) {
        console.error("No current user");
        alert("Vui lòng đăng nhập lại.");
        return;
      }

      // Format dữ liệu theo cấu trúc CSDL
      const forwardData = {
        originalMessageId: selectedMessage._id,
        conversationIds: selectedFriends.map((f) => f._id),
        sender: currentUser._id,
        type: selectedMessage.type || "TEXT",
        content: selectedMessage.content,
        files: selectedMessage.files || [],
      };

      console.log("Sending forward request with data:", forwardData);

      const response = await chatService.forwardMessage(forwardData);
      console.log("Forward response:", response);

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

      socket.emit("revokeMessage", {
        messageId: message._id,
        conversationId: conversation._id,
      });

      setShowMessageOptions(false);
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Không thể xóa tin nhắn. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("messageRevoked", (data) => {
        if (data.conversationId === conversation._id) {
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg._id !== data.messageId)
          );
        }
      });

      return () => {
        socket.off("messageRevoked");
      };
    }
  }, [socket, conversation]);

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

      socket.emit("revokeMessage", {
        messageId: message._id,
        conversationId: conversation._id,
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
      <Modal
        visible={true}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowForwardModal(false);
          setSelectedFriends([]);
        }}
      >
        <View style={styles.forwardModalContainer}>
          <View style={styles.forwardModalContent}>
            <View style={styles.forwardModalHeader}>
              <Text style={styles.forwardModalTitle}>Chuyển tiếp tin nhắn</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowForwardModal(false);
                  setSelectedFriends([]);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {friends.length > 0 ? (
              <FlatList
                data={friends}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.friendItem,
                      selectedFriends.some((f) => f._id === item._id) &&
                        styles.friendItemSelected,
                    ]}
                    onPress={() => toggleSelectFriend(item)}
                  >
                    <Image
                      source={
                        item.avatar
                          ? { uri: item.avatar }
                          : require("../../../assets/chat/man.png")
                      }
                      style={styles.friendAvatar}
                    />
                    <Text style={styles.friendName}>
                      {item.name || "Người dùng"}
                    </Text>
                    {selectedFriends.some((f) => f._id === item._id) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#0099ff"
                      />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.friendsList}
              />
            ) : (
              <View style={styles.noFriendsContainer}>
                <Text style={styles.noFriendsText}>
                  Không có cuộc trò chuyện nào
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.forwardButton,
                selectedFriends.length === 0 && styles.forwardButtonDisabled,
              ]}
              onPress={handleSendForward}
              disabled={selectedFriends.length === 0}
            >
              <Text style={styles.forwardButtonText}>
                Chuyển tiếp ({selectedFriends.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

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
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              if (otherUser && conversation) {
                navigation.navigate("UserInfo", {
                  conversation: {
                    _id: conversation._id,
                    name:
                      otherUser.name ||
                      `${otherUser.firstName} ${otherUser.lastName}`,
                    members: conversation.members || [],
                    avatar: otherUser.avatar,
                    isGroup: false,
                    isOnline: isOnline,
                    user: otherUser,
                  },
                });
              }
            }}
          >
            <Feather name="more-horizontal" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <PinnedMessageBar />

      <FlatList
        data={combinedMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        style={[styles.messageList, pinnedMessage && { marginTop: 50 }]}
        contentContainerStyle={pinnedMessage ? { paddingTop: 50 } : null}
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

        {newMessage.trim().length > 0 ? (
          <TouchableOpacity onPress={handlePressSend}>
            <Ionicons name="send" size={28} color="#0099ff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handlePressLike}>
            <Ionicons name="thumbs-up" size={28} color="#0099ff" />
          </TouchableOpacity>
        )}
      </View>

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

      <Modal
        visible={showMessageOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMessageOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMessageOptions(false)}
        >
          <View style={styles.messageOptionsContainer}>
            <TouchableOpacity
              style={styles.messageOptionItem}
              onPress={() => handleMessagePin(selectedMessage)}
            >
              <Ionicons name="pin" size={22} color="#333" />
              <Text style={styles.messageOptionText}>Ghim tin nhắn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageOptionItem}
              onPress={() => handleMessageForward(selectedMessage)}
            >
              <Ionicons name="arrow-redo" size={22} color="#333" />
              <Text style={styles.messageOptionText}>Chuyển tiếp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageOptionItem}
              onPress={() => handleDeleteForMe(selectedMessage)}
            >
              <Ionicons name="trash" size={22} color="#e74c3c" />
              <Text style={[styles.messageOptionText, { color: "#e74c3c" }]}>
                Thu hồi tin nhắn ở phía bạn
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageOptionItem}
              onPress={() => handleMessageDelete(selectedMessage)}
            >
              <Ionicons name="trash" size={22} color="#e74c3c" />
              <Text style={[styles.messageOptionText, { color: "#e74c3c" }]}>
                Xóa tin nhắn
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ForwardModal />
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
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userAvatar: {
    order: 2,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
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
  messageRow: {
    flexDirection: "row",
    marginVertical: 8,
    alignItems: "flex-end",
    paddingHorizontal: 8,
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  friendMessageRow: {
    justifyContent: "flex-start",
  },
  messageContainer: {
    maxWidth: "70%",
    marginHorizontal: 8,
    borderRadius: 15,
  },
  messageContent: {
    padding: 8,
    borderRadius: 15,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0099ff",
    marginLeft: "auto",
    borderWidth: 1,
    borderColor: "#0099ff",
  },
  friendMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e4e4e4",
    marginRight: "auto",
    borderWidth: 1,
    borderColor: "#e4e4e4",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: "white",
  },
  friendMessageText: {
    color: "#333",
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
    marginVertical: 5,
  },
  videoContainer: {
    width: 200,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    marginVertical: 5,
  },
  videoMessage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 1
  },
  fileContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "transparent",
    maxWidth: "100%",
    borderRadius: 8,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileName: {
    fontSize: 14,
    color: "#000",
    marginLeft: 10,
    flexShrink: 1,
    overflow: "hidden",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  messageOptionsContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  messageOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  messageOptionText: {
    fontSize: 16,
    marginLeft: 16,
    color: "#333",
  },
  pinnedMessageContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    zIndex: 999,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pinnedMessageContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  pinnedIcon: {
    marginRight: 8,
    transform: [{ rotate: "45deg" }],
  },
  pinnedText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  pinnedImage: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginRight: 8,
  },
  pinnedFileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pinnedFileName: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  unpinButton: {
    padding: 4,
  },
  forwardModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  forwardModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    minHeight: "50%",
  },
  forwardModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  forwardModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  closeButton: {
    padding: 8,
  },
  friendsList: {
    flex: 1,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  friendItemSelected: {
    backgroundColor: "#f0f8ff",
  },
  audioContainer: {
    minWidth: 150,
    maxWidth: 250,
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
  },
  audioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  audioInfo: {
    marginLeft: 10,
    flex: 1,
  },
  audioText: {
    fontSize: 14,
    color: '#333',
  },
  audioPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 10,
  },
  audioProgressBar: {
    height: 3,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    flex: 1,
    marginRight: 10,
  },
  audioProgress: {
    height: '100%',
    backgroundColor: '#0099ff',
    borderRadius: 2,
  },
  audioDuration: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    minWidth: 80,
    textAlign: 'right',
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    margin: -2,
  },
  gridImageContainer: {
    padding: 2,
  },
  gridImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  gridImageLast: {
    position: "relative",
  },
  remainingCount: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  remainingCountText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  forwardButton: {
    backgroundColor: "#0099ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  forwardButtonDisabled: {
    backgroundColor: "#ccc",
  },
  forwardButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  noFriendsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noFriendsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  audioRecordingContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  audioRecordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  audioRecordingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  audioRecordingContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  recordingDuration: {
    fontSize: 48,
    fontWeight: '200',
    color: '#000',
    marginBottom: 30,
  },
  recordingControls: {
    alignItems: 'center',
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  recordingActive: {
    backgroundColor: '#ff4444',
    borderColor: '#ff4444',
  },
  recordingActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 20,
  },
  recordingActionButton: {
    alignItems: 'center',
    padding: 10,
  },
  recordingActionText: {
    marginTop: 5,
    color: '#666',
  },
  sendButton: {
    backgroundColor: '#0099ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  locationMessageContainer: {
    width: 220,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  mapPreviewContainer: {
    height: 150,
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  locationMapPreview: {
    flex: 1,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userLocationIcon: {
    backgroundColor: 'rgba(0,153,255,0.1)',
    width: 32,
    height: 32,
  },
  friendLocationIcon: {
    backgroundColor: 'rgba(102,102,102,0.1)',
    width: 32,
    height: 32,
  },
  locationAddressText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  userLocationDetails: {
    backgroundColor: '#0099ff',
  },
  friendLocationDetails: {
    backgroundColor: '#e4e4e4',
  },
});

export default ChatDetailScreen;
