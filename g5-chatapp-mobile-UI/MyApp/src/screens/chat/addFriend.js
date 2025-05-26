import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    FlatList,
    Image
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { contactService } from "../../services/contact.service";
import { searchUsers } from "../../services/user/userService";
import { API_URL } from "../../config/constants";

const AddFriendScreen = ({ navigation }) => {
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [language, setLanguage] = useState("vi"); // Default to Vietnamese

    const languageData = {
        en: {
            addFriendTitle: "Add Friend",
            searchPlaceholder: "Search by email or name",
            errorTitle: "Error",
            enterEmailOrNameToSearch: "Please enter email or name to search",
            searchUserError: "Error searching for user",
            successTitle: "Success",
            friendRequestSent: "Friend request sent successfully",
            okButton: "OK",
            failedToSendRequest: "Failed to send friend request",
            somethingWentWrong: "Something went wrong",
        },
        vi: {
            addFriendTitle: "Thêm bạn bè",
            searchPlaceholder: "Tìm kiếm bằng email hoặc tên",
            errorTitle: "Lỗi",
            enterEmailOrNameToSearch: "Vui lòng nhập email hoặc tên để tìm kiếm",
            searchUserError: "Lỗi tìm kiếm người dùng",
            successTitle: "Thành công",
            friendRequestSent: "Yêu cầu kết bạn đã được gửi thành công",
            okButton: "OK",
            failedToSendRequest: "Không thể gửi yêu cầu kết bạn",
            somethingWentWrong: "Đã có lỗi xảy ra",
        },
    };

    const getText = (key) => languageData[language][key] || languageData['en'][key];

    const handleSearch = async () => {
        if (!searchText.trim()) {
            Alert.alert(getText("errorTitle"), getText("enterEmailOrNameToSearch"));
            return;
        }

        setIsSearching(true);
        try {
            const response = await searchUsers(searchText);
            if (response.ok) {
                setSearchResults(response.data || []);
            } else {
                Alert.alert(getText("errorTitle"), response.message || getText("searchUserError"));
            }
        } catch (error) {
            console.log('Search error:', error);
            Alert.alert(getText("errorTitle"), getText("searchUserError"));
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddFriend = async (userId) => {
        setIsLoading(true);
        try {
            const response = await contactService.createContact(userId);
            if (response.success) {
                Alert.alert(
                    getText("successTitle"), 
                    getText("friendRequestSent"),
                    [
                        {
                            text: getText("okButton"),
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            } else {
                const errorMessage = Array.isArray(response.message) 
                    ? response.message[0] 
                    : (response.message || getText("failedToSendRequest"));
                Alert.alert(getText("errorTitle"), errorMessage);
            }
        } catch (error) {
            console.log('Error details:', error);
            const errorMessage = error.message;
            if (Array.isArray(errorMessage)) {
                Alert.alert(getText("errorTitle"), errorMessage[0] || getText("somethingWentWrong"));
            } else {
                Alert.alert(getText("errorTitle"), errorMessage || getText("somethingWentWrong"));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderUserItem = ({ item }) => (
        <View style={styles.userItem}>
            <View style={styles.userInfo}>
                <Image 
                    source={
                        item.avatar 
                            ? { uri: `${API_URL}/uploads/${item.avatar}` }
                            : require("../../../assets/chat/avatar.png")
                    }
                    style={styles.avatar}
                    defaultSource={require("../../../assets/chat/avatar.png")}
                />
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                </View>
            </View>
            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleAddFriend(item._id)}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Icon name="account-plus" size={24} color="#fff" />
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="chevron-left" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>{getText("addFriendTitle")}</Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={getText("searchPlaceholder")}
                    placeholderTextColor="#aaa"
                    value={searchText}
                    onChangeText={setSearchText}
                />
                <TouchableOpacity onPress={handleSearch} disabled={isSearching}>
                    {isSearching ? (
                        <ActivityIndicator size="small" color="#135CAF" />
                    ) : (
                        <Icon name="magnify" size={28} color="#135CAF" />
                    )}
                </TouchableOpacity>
            </View>

            {/* Search Results */}
            <FlatList
                data={searchResults}
                renderItem={renderUserItem}
                keyExtractor={item => item._id}
                style={styles.resultsList}
                contentContainerStyle={styles.resultsContent}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff", 
    },
    header: {
        flexDirection: "row",
        backgroundColor: "#135CAF",
        paddingVertical: 15,
        paddingHorizontal: 15,
        alignItems: "center",
    },
    backButton: {
        marginRight: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        flex: 1,
        textAlign: "center",
        marginRight: 30, 
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        marginTop: 15,
        marginBottom: 10,
        marginHorizontal: 15,
        backgroundColor: "#f9f9f9",
    },
    input: {
        flex: 1,
        height: 40,
        color: "#000",
        fontSize: 16,
        paddingHorizontal: 10,
    },
    resultsList: {
        flex: 1,
    },
    resultsContent: {
        paddingHorizontal: 15,
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: "#666",
    },
    addButton: {
        backgroundColor: "#135CAF",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },
});

export default AddFriendScreen;
