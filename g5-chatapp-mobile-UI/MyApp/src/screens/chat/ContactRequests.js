import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { contactService } from "../../services/contact.service";

const ContactRequestsScreen = ({ navigation }) => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPendingRequests = async () => {
        try {
            const response = await contactService.getMyPendingContacts();
            if (response.success) {
                setPendingRequests(response.data);
            }
        } catch (error) {
            console.log('Error fetching requests:', error);
            Alert.alert('Error', 'Failed to load contact requests');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAccept = async (contactId) => {
        try {
            const response = await contactService.acceptContact(contactId);
            if (response.success) {
                Alert.alert('Success', 'Contact request accepted');
                // Refresh the list
                fetchPendingRequests();
            }
        } catch (error) {
            console.log('Error accepting request:', error);
            Alert.alert('Error', 'Failed to accept contact request');
        }
    };

    const handleReject = async (contactId) => {
        try {
            const response = await contactService.rejectContact(contactId);
            if (response.success) {
                Alert.alert('Success', 'Contact request rejected');
                // Refresh the list
                fetchPendingRequests();
            }
        } catch (error) {
            console.log('Error rejecting request:', error);
            Alert.alert('Error', 'Failed to reject contact request');
        }
    };

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.requestItem}>
            <View style={styles.userInfo}>
                <Icon name="account-circle" size={40} color="#135CAF" />
                <View style={styles.textContainer}>
                    <Text style={styles.userName}>{item.sender?.firstName} {item.sender?.lastName}</Text>
                    <Text style={styles.userEmail}>{item.sender?.email}</Text>
                </View>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity 
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAccept(item._id)}
                >
                    <Icon name="check" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(item._id)}
                >
                    <Icon name="close" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="chevron-left" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Contact Requests</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#135CAF" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="chevron-left" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Contact Requests</Text>
            </View>
            
            <FlatList
                data={pendingRequests}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                refreshing={refreshing}
                onRefresh={() => {
                    setRefreshing(true);
                    fetchPendingRequests();
                }}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Icon name="account-multiple" size={50} color="#ccc" />
                        <Text style={styles.emptyText}>No pending contact requests</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        backgroundColor: '#135CAF',
        paddingVertical: 15,
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    backButton: {
        marginRight: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        marginRight: 30,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    requestItem: {
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    textContainer: {
        marginLeft: 10,
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});

export default ContactRequestsScreen; 