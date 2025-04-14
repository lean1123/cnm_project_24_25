import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { contactService } from "../../services/contact.service";

const AddFriendScreen = ({ navigation }) => {
    const [friendId, setFriendId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAddFriend = async () => {
        if (!friendId.trim()) {
            Alert.alert("Error", "Please enter a friend ID");
            return;
        }

        setIsLoading(true);
        try {
            const response = await contactService.createContact(friendId);
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
                    placeholder="Enter Friend's ID or Phone Number"
                    placeholderTextColor="#aaa"
                    value={friendId}
                    onChangeText={setFriendId}
                />
                <TouchableOpacity>
                    <Icon name="account-plus" size={28} color="#135CAF" />
                </TouchableOpacity>
            </View>

            {/* Add Friend Button */}
            <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleAddFriend}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Add Friend</Text>
                )}
            </TouchableOpacity>
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
        marginTop: 30, 
        marginBottom: 20,
        marginHorizontal: 20,
        backgroundColor: "#f9f9f9", 
    },
    input: {
        flex: 1,
        height: 40,
        color: "#000", 
        fontSize: 16,
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: "#135CAF",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 20,
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default AddFriendScreen;
