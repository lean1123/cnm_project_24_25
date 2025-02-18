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
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing"; // mở tệp
import * as Location from "expo-location";
import TextMessageComponent from "../../components/TextMessageComponent";
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
        const permissionResult =
            await ImagePicker.requestCameraPermissionsAsync();

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
                type: "image",
                uri: capturedImageUri,
                text: "📷 Image",
                time: new Date().toLocaleTimeString().slice(0, 5),
                sentByUser: true,
            };

            setMessages((prevMessages) => [...prevMessages, newImageMessage]);
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
            const selectedImageUri = result.assets[0].uri;

            const newImageMessage = {
                id: Date.now().toString(),
                type: "image",
                uri: selectedImageUri,
                text: "📷 Image",
                time: new Date().toLocaleTimeString().slice(0, 5),
                sentByUser: true,
            };

            setMessages((prevMessages) => [...prevMessages, newImageMessage]);
        }
        closeModal();
    };

    //
    const [messages, setMessages] = useState([
        {
            id: "1",
            type: "text",
            text: "This is your delivery driver from Speedy Chow. I'm just around the corner from your place. 😊",
            time: "10:10",
            sentByUser: false,
        },
        { id: "2", type: "text", text: "Hi!", time: "10:10", sentByUser: true },
    ]);

    const sendMessage = () => {
        if (newMessage.trim() === "") return;

        const newMessageObject = {
            id: Date.now().toString(),
            type: "text",
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

    // hàm chọn tài liệu mới
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*", // Chấp nhận tất cả các loại tệp
                copyToCacheDirectory: true, // Lưu vào cache tạm thời
            });

            if (result.canceled) {
                console.log("Người dùng đã huỷ");
                return;
            }

            const capturedFileUri = await saveFileLocally(result.assets[0]);

            console.log(`file đã chọn ${result.assets[0].name}`);

            const newFileMessage = {
                id: Date.now().toString(),
                type: "document",
                src: capturedFileUri,
                text: `${capturedFileUri}`,
                time: new Date().toLocaleTimeString().slice(0, 5),
                sentByUser: true,
            };
            setMessages((prevMessages) => [...prevMessages, newFileMessage]);
            setShowOptions(false); // Đóng modal
            return capturedFileUri; // Trả về tệp đã chọn
        } catch (error) {
            console.error("Lỗi chọn tệp:", error);
        }
    };

    const openDocument = async (fileUri) => {
        try {
            await Sharing.shareAsync(fileUri);
        } catch (error) {
            console.error("Không thể mở tệp:", error);
        }
    };

    // lưu file vừa upload vào cache
    const saveFileLocally = async (file) => {
        try {
            const localUri = FileSystem.documentDirectory + file.name;

            await FileSystem.copyAsync({
                from: file.uri,
                to: localUri,
            });

            console.log(`Tệp đã lưu tại: ${localUri}`);

            return localUri; // Trả về đường dẫn tệp đã lưu
        } catch (error) {
            console.error("Lỗi lưu tệp:", error);
        }
    };

    const renderMessage = ({ item }) => {
        switch (item.type) {
            case "text":
                return (
                    // Thêm return để trả về JSX
                    <View
                        style={[
                            styles.messageContainer,
                            item.sentByUser
                                ? styles.userMessage
                                : styles.friendMessage,
                        ]}
                    >
                        <Text>{item.text}</Text>
                        <Text style={styles.messageTime}>{item.time}</Text>
                    </View>
                );
            case "image":
                return (
                    <View
                        style={[
                            styles.messageContainer,
                            item.sentByUser
                                ? styles.userMessage
                                : styles.friendMessage,
                        ]}
                    >
                        <TouchableOpacity
                            onPress={() => Linking.openURL(item.uri)}
                        >
                            <Image
                                source={{ uri: item.uri }}
                                style={{
                                    width: 200,
                                    height: 200,
                                    borderRadius: 10,
                                }}
                            />
                        </TouchableOpacity>
                        <Text style={styles.messageTime}>{item.time}</Text>
                    </View>
                );
            case "document":
                return (
                    <View
                        style={[
                            styles.messageContainer,
                            item.sentByUser
                                ? styles.userMessage
                                : styles.friendMessage,
                        ]}
                    >
                        <TouchableOpacity
                            onPress={() => openDocument(item.src)}
                        >
                            <Text>{item.src}</Text>
                        </TouchableOpacity>
                        <Text style={styles.messageTime}>{item.time}</Text>
                    </View>
                );
            case "location":
                return <Text>This is a location</Text>;
            default:
                return <Text>Auu naauu</Text>; // Thêm return ở đây cho trường hợp mặc định
        }
    };

    // lưu file vừa upload vào cache
    const pickLocation = () => {
        // alert("Chức năng đang phát triển");
        // closeModal();
        navigation.navigate("LocationScreen");
    };

    // xin quyền truy cập vị trí
    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            alert("Permission to access location was denied");
        }
    };

    // lấy vị trí hiện tại của người dùng
    const getCurrentLocation = async () => {
        try {
            const location = await Location.getCurrentPositionAsync({});
            console.log(location.coords.latitude, location.coords.longitude);
            return location.coords;
        } catch (error) {
            console.log("Error getting location: ", error);
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
                        <Feather
                            name="more-horizontal"
                            size={20}
                            color="black"
                        />
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
            <Modal
                visible={showOptions}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.optionsBox}>
                        <View style={styles.optionRow}>
                            <TouchableOpacity
                                style={styles.option}
                                onPress={openCamera}
                            >
                                <Ionicons
                                    name="camera-outline"
                                    size={32}
                                    color="#0099ff"
                                />
                                <Text style={styles.optionText}>Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.option}>
                                <Ionicons
                                    name="mic-outline"
                                    size={32}
                                    color="#0099ff"
                                />
                                <Text style={styles.optionText}>Record</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.option}>
                                <Ionicons
                                    name="person-outline"
                                    size={32}
                                    color="#0099ff"
                                />
                                <Text style={styles.optionText}>Contact</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.optionRow}>
                            <TouchableOpacity
                                style={styles.option}
                                onPress={openGallery}
                            >
                                <Ionicons
                                    name="image-outline"
                                    size={32}
                                    color="#0099ff"
                                />
                                <Text style={styles.optionText}>Gallery</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.option}
                                onPress={pickLocation}
                            >
                                <Ionicons
                                    name="location-outline"
                                    size={32}
                                    color="#0099ff"
                                />
                                <Text style={styles.optionText}>
                                    My Location
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.option}
                                onPress={pickDocument}
                            >
                                <Ionicons
                                    name="document-outline"
                                    size={32}
                                    color="#0099ff"
                                />
                                <Text style={styles.optionText}>Document</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            onPress={closeModal}
                            style={styles.closeButton}
                        >
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
