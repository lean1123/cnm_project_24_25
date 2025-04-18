import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import styles from "./styles";
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_COLORS = [
  { name: 'Default', value: '#ffffff' },
  { name: 'Light Blue', value: '#e3f2fd' },
  { name: 'Mint Green', value: '#e8f5e9' },
  { name: 'Lavender', value: '#f3e5f5' },
  { name: 'Peach', value: '#fbe9e7' },
  { name: 'Light Gray', value: '#f5f5f5' },
];

const UserInfoScreen = ({ navigation, route }) => {
  const [muted, setMuted] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [callAlerts, setCallAlerts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(BACKGROUND_COLORS[0].value);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  
  const conversation = route.params?.conversation;
  
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user._id || user.id);
        }
      } catch (error) {
        console.error('Error getting userData:', error);
      }
    };
    getUserId();
    
    if (conversation) {
      processUserInfo(conversation);
    }
  }, [conversation]);

  useEffect(() => {
    const loadChatBackground = async () => {
      try {
        const chatBackgrounds = await AsyncStorage.getItem('chatBackgrounds') || '{}';
        const backgrounds = JSON.parse(chatBackgrounds);
        const savedColor = backgrounds[conversation._id];
        if (savedColor) {
          setBackgroundColor(savedColor);
        }
      } catch (error) {
        console.error('Error loading chat background:', error);
      }
    };
    
    loadChatBackground();
  }, [conversation._id]);

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

  //   hanlde gim tin nhăn
  const hanldeSearchMessage = () => {
    Alert.alert("Tìm kiếm tin nhắn", "Chức năng này chưa được triển khai.");
  };

  const handleUserInfo = () => {
    Alert.alert("Thông tin người dùng", "Chức năng này chưa được triển khai.");
  };

  const handleChangeBackground = () => {
    setShowColorPicker(true);
  };

  const handleSelectColor = async (color) => {
    try {
      setSelectedColor(color);
      // Lưu màu nền cho cuộc trò chuyện này
      const chatBackgrounds = await AsyncStorage.getItem('chatBackgrounds') || '{}';
      const backgrounds = JSON.parse(chatBackgrounds);
      backgrounds[conversation._id] = color;
      await AsyncStorage.setItem('chatBackgrounds', JSON.stringify(backgrounds));
      
      setShowColorPicker(false);
      Alert.alert("Thành công", "Đã thay đổi màu nền cuộc trò chuyện");
    } catch (error) {
      console.error('Error saving background color:', error);
      Alert.alert("Lỗi", "Không thể thay đổi màu nền");
    }
  };

  const handleToggleNotifications = () => {
    Alert.alert("Tắt thông báo", "Chức năng này chưa được triển khai.");
  };

  const ColorPickerModal = () => (
    <Modal
      visible={showColorPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowColorPicker(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.colorPickerContent}>
          <Text style={styles.modalTitle}>Chọn màu nền</Text>
          <View style={styles.colorGrid}>
            {BACKGROUND_COLORS.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorOption,
                  { backgroundColor: color.value },
                  selectedColor === color.value && styles.selectedColor
                ]}
                onPress={() => handleSelectColor(color.value)}
              >
                {selectedColor === color.value && (
                  <Icon name="check" size={20} color="#000" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowColorPicker(false)}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#135CAF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tùy chọn</Text>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.avatarSection}>
          <Image source={userInfo.avatar} style={styles.avatarLarge} />
          <Text style={styles.name}>{userInfo.name}</Text>
          <Text style={styles.phone}>{userInfo.phone}</Text>
          {userInfo.isOnline && <Text style={styles.onlineStatus}>Đang hoạt động</Text>}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={hanldeSearchMessage}
          >
            <Icon name="search" size={18} />
            <Text style={styles.textAction}>Tìm tin nhắn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleUserInfo}
          >
            <Icon name="user" size={18} />
            <Text style={styles.textAction}>Trang cá nhân</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleChangeBackground}
          >
            <Icon name="palette" size={18} />
            <Text style={styles.textAction}>Đổi màu nền</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleToggleNotifications}
          >
            <Icon name="bell-slash" size={18} />
            <Text style={styles.textAction}>Tắt thông báo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.optionsSection}>
          <TouchableOpacity style={styles.optionRow}>
            <Text>Đổi tên gọi nhớ</Text>
          </TouchableOpacity>
          <View style={styles.optionRow}>
            <Text>Đánh dấu bạn thân</Text>
            <Switch value={pinned} onValueChange={setPinned} />
          </View>
          <TouchableOpacity style={styles.optionRow}>
            <Text>Nhật ký chung</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ảnh, file, link</Text>
          <ScrollView horizontal>
            {userInfo.sharedMedia.length > 0 ? (
              userInfo.sharedMedia.map((media, index) => (
                <Image key={index} source={media} style={styles.mediaThumbnail} />
              ))
            ) : (
              <Text style={{ padding: 10 }}>Không có ảnh, file hoặc link nào</Text>
            )}
          </ScrollView>
        </View>

        <View style={styles.optionsSection}>
          <TouchableOpacity style={styles.optionRow}>
            <Text>Tạo nhóm với {userInfo.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionRow}>
            <Text>Thêm {userInfo.name} vào nhóm</Text>
          </TouchableOpacity>
          <View style={styles.optionRow}>
            <Text>Ghim trò chuyện</Text>
            <Switch value={muted} onValueChange={setMuted} />
          </View>
          <View style={styles.optionRow}>
            <Text>Ẩn trò chuyện</Text>
            <Switch value={hidden} onValueChange={setHidden} />
          </View>
          <View style={styles.optionRow}>
            <Text>Báo cuộc gọi đến</Text>
            <Switch value={callAlerts} onValueChange={setCallAlerts} />
          </View>
        </View>
      </ScrollView>
      <ColorPickerModal />
    </SafeAreaView>
  );
};

// Thêm styles mới
const additionalStyles = {
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  colorPickerContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  colorOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#000',
  },
  cancelButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#135CAF',
    fontWeight: 'bold',
  },
  onlineStatus: {
    color: '#4CAF50',
    marginTop: 5,
    fontSize: 14,
  },
};

// Merge styles
Object.assign(styles, additionalStyles);

export default UserInfoScreen;
