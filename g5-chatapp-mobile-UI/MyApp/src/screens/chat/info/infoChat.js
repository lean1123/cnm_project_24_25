import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import styles from "./styles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService } from "../../../services/chat.service";

const UserInfoScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [mediaMessages, setMediaMessages] = useState({
    images: [],
    videos: [],
    files: []
  });
  
  const conversation = route.params?.conversation;
  const otherUser = conversation?.user || {};

  useEffect(() => {
    const initialize = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }

        if (conversation?._id) {
          const response = await chatService.getMessages(conversation._id);
          if (response?.data) {
            const messages = Array.isArray(response.data) ? response.data : response.data.data;
            
            const images = [];
            const videos = [];
            const files = [];

            messages.forEach(message => {
              if (message.files && message.files.length > 0) {
                message.files.forEach(file => {
                  const fileType = file.type || file.fileName?.split('.').pop()?.toLowerCase();
                  
                  if (message.type === 'IMAGE' || /\.(jpg|jpeg|png|gif)$/i.test(file.fileName)) {
                    images.push(file);
                  } else if (message.type === 'VIDEO' || /\.(mp4|mov|avi)$/i.test(file.fileName)) {
                    videos.push(file);
                  } else {
                    files.push(file);
                  }
                });
              }
            });

            setMediaMessages({ images, videos, files });
          }
        }
      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setLoading(false);
      }
    };

  const processUserInfo = (conversation) => {
    if (!conversation) return;
    
    let userData = {
      avatar: require("../../../../assets/chat/avatar.png"),
      name: "Unknown",
      phone: "N/A",
      commonGroups: [],
      sharedMedia: [],
      sharedFiles: [],
      sharedLinks: [],
    };
    
    // Nếu là cuộc trò chuyện nhóm
    if (conversation.isGroup) {
      userData.name = conversation.name || "Unknown Group";
      userData.avatar = conversation.avatar 
        ? { uri: conversation.avatar } 
        : require("../../../../assets/chat/avatar.png");
    } 
    // Nếu là cuộc trò chuyện 1-1
    else if (conversation.members) {
      // Tìm thông tin người dùng khác
      const otherUser = conversation.members.find(member => member._id !== userId);
      
      if (otherUser) {
        userData = {
          ...userData,
          name: `${otherUser.firstName} ${otherUser.lastName}`,
          phone: otherUser.phone || "N/A",
          avatar: otherUser.avatar 
            ? { uri: otherUser.avatar } 
            : require("../../../../assets/chat/avatar.png"),
          isOnline: otherUser.isOnline || false,
          email: otherUser.email,
        };
      }
    }
    
    setUserInfo(userData);
    setLoading(false);
  };

    initialize();
  }, [conversation]);

  const renderMediaGrid = ({ item }) => {
    const isVideo = item.type === 'video' || /\.(mp4|mov|avi)$/i.test(item.fileName);
    
    return (
      <TouchableOpacity 
        style={styles.mediaItem}
        onPress={() => {
          if (isVideo) {
            navigation.navigate("VideoPlayer", { uri: item.url });
          } else {
            navigation.navigate("ImageViewer", { uri: item.url });
          }
        }}
      >
        <Image 
          source={{ uri: item.url }} 
          style={styles.mediaThumbnail}
        />
        {isVideo && (
          <View style={styles.videoOverlay}>
            <Icon name="play" size={20} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFileItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.fileItem}
      onPress={() => {
        // Handle file opening
      }}
    >
      <Icon name="file" size={24} color="#666" />
      <Text style={styles.fileName} numberOfLines={1}>
        {item.fileName || 'Unnamed file'}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      <View style={styles.avatarSection}>
        <Image 
          source={
            otherUser.avatar 
              ? { uri: otherUser.avatar }
              : require("../../../../assets/chat/man.png")
          } 
          style={styles.avatarLarge} 
        />
        <Text style={styles.name}>
          {otherUser.firstName} {otherUser.lastName}
        </Text>
        {otherUser.isOnline && (
          <Text style={styles.onlineStatus}>Đang hoạt động</Text>
        )}
      </View>

      {mediaMessages.images.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ảnh đã chia sẻ</Text>
          <FlatList
            data={mediaMessages.images}
            renderItem={renderMediaGrid}
            keyExtractor={(item, index) => `image-${index}`}
            numColumns={3}
            scrollEnabled={false}
          />
        </View>
      )}

      {mediaMessages.videos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Video đã chia sẻ</Text>
          <FlatList
            data={mediaMessages.videos}
            renderItem={renderMediaGrid}
            keyExtractor={(item, index) => `video-${index}`}
            numColumns={3}
            scrollEnabled={false}
          />
        </View>
      )}

      {mediaMessages.files.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>File đã chia sẻ</Text>
        </View>
      )}
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#135CAF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={18} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Info Chat</Text>
      </View>

      <FlatList
        data={mediaMessages.files}
        renderItem={renderFileItem}
        keyExtractor={(item, index) => `file-${index}`}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.contentContainer}
      />
    </SafeAreaView>
  );
};

const additionalStyles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexGrow: 1,
  },
  section: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  mediaItem: {
    flex: 1/3,
    aspectRatio: 1,
    margin: 1,
    position: 'relative',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  fileName: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  onlineStatus: {
    color: '#4CAF50',
    marginTop: 5,
    fontSize: 14,
  },
};

Object.assign(styles, additionalStyles);

export default UserInfoScreen;
