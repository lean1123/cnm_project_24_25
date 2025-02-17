import React, { useState } from "react";
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
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons"; // Cài bằng: npm install @expo/vector-icons
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

const ChatDetailScreen = ({ navigation, route }) => {
  const { friend } = route.params;
  const [showOptions, setShowOptions] = useState(false);
  const [newMessage, setNewMessage] = useState("");

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
      const capturedImageUri = result.assets[0].uri;

      const newImageMessage = {
        id: Date.now().toString(),
        uri: capturedImageUri,
        text: "📷 Image",
        time: new Date().toLocaleTimeString().slice(0, 5),
        sentByUser: true,
      };

      setMessages((prevMessages) => [...prevMessages, newImageMessage]);
    }
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
      const selectedImageUri = result.assets[0].uri;

      const newImageMessage = {
        id: Date.now().toString(),
        uri: selectedImageUri,
        text: "📷 Image",
        time: new Date().toLocaleTimeString().slice(0, 5),
        sentByUser: true,
      };

      setMessages((prevMessages) => [...prevMessages, newImageMessage]);
    }
  };

  //
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "This is your delivery driver from Speedy Chow. I'm just around the corner from your place. 😊",
      time: "10:10",
      sentByUser: false,
    },
    { id: "2", text: "Hi!", time: "10:10", sentByUser: true },
  ]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMessageObject = {
      id: Date.now().toString(),
      text: newMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sentByUser: true,
    };

    setMessages((prevMessages) => [...prevMessages, newMessageObject]);
    setNewMessage(""); // Xóa nội dung sau khi gửi
    Keyboard.dismiss(); // Ẩn bàn phím
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sentByUser ? styles.userMessage : styles.friendMessage,
      ]}
    >
      {item.uri ? (
        <TouchableOpacity onPress={() => Linking.openURL(item.uri)}>
          <Image
            source={{ uri: item.uri }}
            style={{ width: 200, height: 200, borderRadius: 10 }}
          />
        </TouchableOpacity>
      ) : (
        <Text style={styles.messageText}>{item.text}</Text>
      )}
      <Text style={styles.messageTime}>{item.time}</Text>
    </View>
  );

  // Hàm chọn tài liệu
  const openDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Chọn tất cả loại tệp
        copyToCacheDirectory: true,
      });

      // Kiểm tra nếu người dùng hủy
      if (result.type === "cancel") {
        return;
      }

      if (result.uri) {
        const newMessage = {
          id: Date.now().toString(),
          text: `📄 Document: ${result.name || "Untitled"}`,
          uri: result.uri,
          time: new Date().toLocaleTimeString().slice(0, 5),
          sentByUser: true,
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } else {
        alert("Không tìm thấy thông tin tài liệu.");
      }
    } catch (err) {
      console.error("Error selecting document:", err);
    }
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Image source={friend.avatar} style={styles.avatar} />
        <View>
          <Text style={styles.friendName}>{friend.name}</Text>
          <Text style={styles.phoneNumber}>+44 50 9285 3022</Text>
        </View>
        <View style={styles.actionIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="call-outline" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="more-horizontal" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Message List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
      />

      {/* Input Box */}
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleOptionPress}>
          <Ionicons name="add-outline" size={28} color="gray" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity onPress={sendMessage}>
          <Ionicons name="send" size={28} color="#0099ff" />
        </TouchableOpacity>
      </View>

      {/* Modal Options */}
      <Modal visible={showOptions} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.optionsBox}>
            <View style={styles.optionRow}>
              <TouchableOpacity style={styles.option} onPress={openCamera}>
                <Ionicons name="camera-outline" size={32} color="#0099ff" />
                <Text style={styles.optionText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option}>
                <Ionicons name="mic-outline" size={32} color="#0099ff" />
                <Text style={styles.optionText}>Record</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option}>
                <Ionicons name="person-outline" size={32} color="#0099ff" />
                <Text style={styles.optionText}>Contact</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.optionRow}>
              <TouchableOpacity style={styles.option} onPress={openGallery}>
                <Ionicons name="image-outline" size={32} color="#0099ff" />
                <Text style={styles.optionText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option}>
                <Ionicons name="location-outline" size={32} color="#0099ff" />
                <Text style={styles.optionText}>My Location</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option} onPress={openDocument}>
                <Ionicons name="document-outline" size={32} color="#0099ff" />
                <Text style={styles.optionText}>Document</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
    flex: 1,
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 1, // Giảm chiều cao phần đầu
    paddingHorizontal: 10,
    backgroundColor: "white",
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
    fontSize: 15,
  },
  phoneNumber: {
    color: "gray",
    fontSize: 11,
  },
  iconButton: {
    marginHorizontal: 3,
  },
  messageList: { flex: 1, paddingHorizontal: 10 },
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
    backgroundColor: "#e0e0e0",
    alignSelf: "flex-start",
  },
  messageText: { color: "white" },
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
    paddingVertical: 5,
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
    marginBottom: 20,
  },
  option: {
    alignItems: "center",
  },
  optionText: {
    marginTop: 5,
    color: "#0099ff",
    fontSize: 12,
  },
  closeButton: {
    alignItems: "center",
    marginTop: 10,
  },
  closeText: {
    color: "gray",
  },
});

export default ChatDetailScreen;
