import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const AddFriendScreen = ({ navigation }) => {
    const [friendId, setFriendId] = useState("");

    const handleAddFriend = () => {
        console.log("Sending friend request to:", friendId);
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
                    <Icon name="magnify" size={28} color="#135CAF" />
                </TouchableOpacity>
            </View>

            {/* Search Button */}
            <TouchableOpacity style={styles.button} onPress={handleAddFriend}>
                <Text style={styles.buttonText}>Search</Text>
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
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

export default AddFriendScreen;
