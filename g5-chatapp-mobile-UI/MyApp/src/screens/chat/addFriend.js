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

    const handleSearch = async () => {
        if (!searchText.trim()) {
            Alert.alert("Error", "Please enter an email or name to search");
            return;
        }

        setIsSearching(true);
        try {
            const response = await searchUsers(searchText);
            if (response.ok) {
                setSearchResults(response.data || []);
            } else {
                Alert.alert("Error", response.message || "Failed to search users");
            }
        } catch (error) {
            console.log('Search error:', error);
            Alert.alert("Error", "Failed to search users");
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
                    "Success", 
                    "Friend request sent successfully",
                    [
                        {
                            text: "OK",
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            } else {
                const errorMessage = Array.isArray(response.message) 
                    ? response.message[0] 
                    : (response.message || "Failed to send friend request");
                Alert.alert("Error", errorMessage);
            }
        } catch (error) {
            console.log('Error details:', error);
            const errorMessage = error.message;
            if (Array.isArray(errorMessage)) {
                Alert.alert("Error", errorMessage[0] || "Something went wrong");
            } else {
                Alert.alert("Error", errorMessage || "Something went wrong");
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
                <Text style={styles.title}>Add Friend</Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Search by email or name"
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
