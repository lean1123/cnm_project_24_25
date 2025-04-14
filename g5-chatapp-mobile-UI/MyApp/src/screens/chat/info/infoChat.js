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
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import styles from "./styles";
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserInfoScreen = ({ navigation, route }) => {
  const [muted, setMuted] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [callAlerts, setCallAlerts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  
  // Lấy thông tin người dùng từ route params
  const friend = route.params?.friend;
  
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
    
    // Xử lý thông tin người dùng từ conversation
    if (friend) {
      processUserInfo(friend);
    }
  }, [friend]);
  
  const processUserInfo = (conversation) => {
    if (!conversation) return;
    
    let userData = {
      avatar: require("../../../../assets/chat/man.png"),
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
        : require("../../../../assets/chat/man.png");
    } 
    // Nếu là cuộc trò chuyện 1-1
    else if (Array.isArray(conversation.members)) {
      // Tìm người dùng khác (không phải người dùng hiện tại)
      const otherMember = conversation.members.find(member => member?.userId !== userId);
      
      if (otherMember) {
        userData.name = otherMember.fullName || "Unknown";
        userData.phone = otherMember.phone || "N/A";
        userData.avatar = otherMember.avatar 
          ? { uri: otherMember.avatar } 
          : require("../../../../assets/chat/man.png");
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
    Alert.alert("Đổi hình nền", "Chức năng này chưa được triển khai.");
  };

  const handleToggleNotifications = () => {
    Alert.alert("Tắt thông báo", "Chức năng này chưa được triển khai.");
  };

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
            <Icon name="image" size={18} />
            <Text style={styles.textAction}>Đổi hình nền</Text>
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
    </SafeAreaView>
  );
};

export default UserInfoScreen;
