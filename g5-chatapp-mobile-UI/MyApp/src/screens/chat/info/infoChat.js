import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import styles from "./styles";

const UserInfoScreen = ({ navigation, route }) => {
  const [muted, setMuted] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [callAlerts, setCallAlerts] = useState(true);

  const mockUser = {
    avatar: require("../../../../assets/chat/man.png"),
    name: "Nguyen Duc Nhat",
    phone: "(+84) 123 456 789",
    commonGroups: ["Nhóm bạn thân", "Công việc", "Dự án React Native"],
    sharedMedia: [
      require("../../../../assets/chat/OIP.jpg"),
      require("../../../../assets/chat/messenger.png"),
      require("../../../../assets/chat/man2.png"),
      require("../../../../assets/chat/OIP.jpg"),
      require("../../../../assets/chat/OIP.jpg"),
      require("../../../../assets/chat/man.png"),
    ],
    sharedFiles: [
      { name: "Báo cáo tài chính.pdf", size: "3.2MB" },
      { name: "Hợp đồng.docx", size: "1.8MB" },
    ],
    sharedLinks: [
      { title: "React Native Docs", url: "https://reactnative.dev/" },
      { title: "Figma UI Kit", url: "https://figma.com/community/file/123" },
    ],
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
          <Image source={mockUser.avatar} style={styles.avatarLarge} />
          <Text style={styles.name}>{mockUser.name}</Text>
          <Text style={styles.phone}>{mockUser.phone}</Text>
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
            {mockUser.sharedMedia.map((media, index) => (
              <Image key={index} source={media} style={styles.mediaThumbnail} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.optionsSection}>
          <TouchableOpacity style={styles.optionRow}>
            <Text>Tạo nhóm với {mockUser.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionRow}>
            <Text>Thêm {mockUser.name} vào nhóm</Text>
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
