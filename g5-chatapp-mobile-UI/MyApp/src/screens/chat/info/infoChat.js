import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Alert,
  Switch,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService } from "../../../services/chat.service";
import { API_URL } from "../../../config/constants";
import { contactService } from "../../../services/contact.service";

const UserInfoScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [mediaMessages, setMediaMessages] = useState({
    images: [],
    videos: [],
    files: []
  });
  const [groupMembers, setGroupMembers] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showMemberActions, setShowMemberActions] = useState(null);
  
  const conversation = route.params?.conversation;
  const isGroup = conversation?.isGroup || false;
  const otherUser = isGroup ? null : conversation?.user;

  // Check if current user is admin
  const checkIsAdmin = () => {
    if (!currentUser || !groupMembers) return false;
    const currentMember = groupMembers.find(member => 
      member.user._id === currentUser._id
    );
    return currentMember?.role === 'ADMIN';
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }

        if (isGroup && conversation?._id) {
          await refreshGroupMembers();
        }

        if (conversation?._id) {
          const response = await chatService.getMessages(conversation._id);
          if (response?.data) {
            const messages = Array.isArray(response.data) ? response.data : response.data.data;
            
            const images = [];
            const videos = [];
            const files = [];

            messages.forEach(message => {
              if (message.files && message.files.length > 0) {
                message.files.forEach(file => {
                  const fileType = file.type || file.fileName?.split('.').pop()?.toLowerCase();
                  
                  if (message.type === 'IMAGE' || /\.(jpg|jpeg|png|gif)$/i.test(file.fileName)) {
                    images.push(file);
                  } else if (message.type === 'VIDEO' || /\.(mp4|mov|avi)$/i.test(file.fileName)) {
                    videos.push(file);
                  } else {
                    files.push(file);
                  }
                });
              }
            });

            setMediaMessages({ images, videos, files });
          }
        }

        // Fetch user's contacts using contactService
        const contactsResponse = await contactService.getMyContacts();
        if (contactsResponse.success) {
          setSearchResults(contactsResponse.data);
        }
      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [conversation]);

  const refreshGroupMembers = async () => {
    try {
      const conversationDetails = await chatService.getMyConversations();
      if (conversationDetails?.success && conversationDetails?.data) {
        const currentConv = conversationDetails.data.find(
          conv => conv._id === conversation._id
        );
        if (currentConv && currentConv.members) {
          setGroupMembers(currentConv.members || []);
        }
      }
    } catch (error) {
      console.error("Error fetching group members:", error);
    }
  };

  const handleSearchUsers = async (query) => {
    try {
      const response = await chatService.searchUsers(query);
      if (response?.success) {
        // Filter out existing members
        const existingMemberIds = groupMembers.map(member => member.user._id);
        const filteredResults = response.data.filter(
          user => !existingMemberIds.includes(user._id)
        );
        setSearchResults(filteredResults);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleShowAddMemberModal = async () => {
    try {
      setLoading(true);
      const contactsResponse = await contactService.getMyContacts();
      if (contactsResponse.success) {
        setSearchResults(contactsResponse.data);
      } else {
        Alert.alert("Error", "Failed to fetch contacts");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      Alert.alert("Error", error.message || "Failed to fetch contacts");
    } finally {
      setLoading(false);
      setShowAddMemberModal(true);
    }
  };

  const handleAddMembers = async () => {
    try {
      setLoading(true);
      const memberIds = selectedMembers.map(member => member._id);
      const response = await chatService.addMembersToGroup(conversation._id, memberIds);
      if (response.success) {
        await refreshGroupMembers();
        setShowAddMemberModal(false);
        setSelectedMembers([]);
        setSearchQuery('');
      } else {
        Alert.alert("Error", response.error || "Failed to add members");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to add members");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      setLoading(true);
      await chatService.removeMemberFromGroup(conversation._id, memberId);
      await refreshGroupMembers();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to remove member");
    } finally {
      setLoading(false);
      setShowMemberActions(null);
    }
  };

  const handleChangeRole = async (memberId) => {
    try {
      setLoading(true);
      const response = await chatService.changeRoleMember(conversation._id, memberId);
      if (response.success) {
        await refreshGroupMembers();
      } else {
        Alert.alert("Error", response.error || "Failed to change member role");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to change member role");
    } finally {
      setLoading(false);
      setShowMemberActions(null);
    }
  };

  const handleLeaveGroup = async () => {
    Alert.alert(
      "Leave Group",
      "Are you sure you want to leave this group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await chatService.removeMemberFromGroup(conversation._id, currentUser._id);
              navigation.goBack();
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to leave group");
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDissolveGroup = async () => {
    Alert.alert(
      "Dissolve Group",
      "Are you sure you want to dissolve this group? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Dissolve",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await chatService.dissolveGroup(conversation._id);
              navigation.navigate("Home_Chat");
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to dissolve group");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderMediaGrid = ({ item }) => {
    const isVideo = item.type === 'video' || /\.(mp4|mov|avi)$/i.test(item.fileName);
    
    return (
      <TouchableOpacity 
        style={styles.mediaItem}
        onPress={() => {
          if (isVideo) {
            navigation.navigate("VideoPlayer", { uri: item.url });
          } else {
            navigation.navigate("ImageViewer", { uri: item.url });
          }
        }}
      >
        <Image 
          source={{ uri: item.url }} 
          style={styles.mediaThumbnail}
        />
        {isVideo && (
          <View style={styles.videoOverlay}>
            <Icon name="play" size={18} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFileItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.fileItem}
      onPress={() => {
        // Handle file opening
      }}
    >
      <Icon name="file" size={22} color="#0099ff" />
      <Text style={styles.fileName} numberOfLines={2}>
        {item.fileName || 'Unnamed file'}
      </Text>
    </TouchableOpacity>
  );

  const renderMemberItem = ({ item }) => {
    const user = item.user || {};
    const isAdmin = item.role === 'ADMIN';
    const isSelf = user._id === currentUser?._id;
    
    return (
      <View style={styles.memberItem}>
        <View style={styles.memberInfo}>
          <Image 
            source={
              user.avatar 
                ? { uri: user.avatar.startsWith('http') ? user.avatar : `${API_URL}/uploads/${user.avatar}` }
                : require("../../../../assets/chat/avatar.png")
            } 
            style={styles.memberAvatar} 
          />
          <View>
            <Text style={styles.memberName}>
              {user.firstName} {user.lastName}
              {isSelf ? ' (You)' : ''}
            </Text>
            {isAdmin && (
              <Text style={styles.adminBadge}>Admin</Text>
            )}
          </View>
        </View>
        
        {!isSelf && checkIsAdmin() && (
          <TouchableOpacity 
            style={styles.memberAction}
            onPress={() => setShowMemberActions(user._id)}
          >
            <MaterialIcon name="dots-vertical" size={20} color="#666" />
          </TouchableOpacity>
        )}

        {showMemberActions === user._id && (
          <View style={styles.memberActionsMenu}>
            {!isAdmin && (
              <TouchableOpacity 
                style={styles.memberActionItem}
                onPress={() => handleChangeRole(user._id)}
              >
                <MaterialIcon name="shield-account" size={20} color="#135CAF" />
                <Text style={styles.memberActionText}>Make Owner</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.memberActionItem, styles.removeAction]}
              onPress={() => handleRemoveMember(user._id)}
            >
              <MaterialIcon name="account-remove" size={20} color="#e53935" />
              <Text style={[styles.memberActionText, styles.removeText]}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderGroupHeader = () => (
    <>
      <View style={styles.avatarSection}>
        <Image 
          source={
            conversation.avatar 
              ? { uri: conversation.avatar.startsWith('http') ? conversation.avatar : `${API_URL}/uploads/${conversation.avatar}` }
              : require("../../../../assets/chat/avatar.png")
          } 
          style={styles.avatarLarge} 
        />
        <Text style={styles.name}>{conversation.name || "Group Chat"}</Text>
        <Text style={styles.memberCount}>
          {groupMembers.length} members
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShowAddMemberModal}>
            <MaterialIcon name="account-plus" size={22} color="#fff" />
            <Text style={styles.actionText}>Add</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.leaveButton]}
            onPress={handleLeaveGroup}
          >
            <MaterialIcon name="exit-to-app" size={22} color="#fff" />
            <Text style={styles.actionText}>Leave</Text>
          </TouchableOpacity>

          {checkIsAdmin() && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.dissolveButton]}
              onPress={handleDissolveGroup}
            >
              <MaterialIcon name="delete" size={22} color="#fff" />
              <Text style={styles.actionText}>Dissolve</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Members</Text>
        <FlatList
          data={groupMembers}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item._id || item.user?._id}
          scrollEnabled={false}
        />
      </View>
      
      {mediaMessages.images.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shared Photos</Text>
          <FlatList
            data={mediaMessages.images.slice(0, 6)}
            renderItem={renderMediaGrid}
            keyExtractor={(item, index) => `image-${index}`}
            numColumns={3}
            scrollEnabled={false}
          />
          {mediaMessages.images.length > 6 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {mediaMessages.videos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shared Videos</Text>
          <FlatList
            data={mediaMessages.videos.slice(0, 6)}
            renderItem={renderMediaGrid}
            keyExtractor={(item, index) => `video-${index}`}
            numColumns={3}
            scrollEnabled={false}
          />
          {mediaMessages.videos.length > 6 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {mediaMessages.files.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shared Files</Text>
          <FlatList
            data={mediaMessages.files.slice(0, 3)}
            renderItem={renderFileItem}
            keyExtractor={(item, index) => `file-${index}`}
            scrollEnabled={false}
          />
          {mediaMessages.files.length > 3 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );

  const renderIndividualHeader = () => (
    <>
      <View style={styles.avatarSection}>
        <Image 
          source={
            otherUser?.avatar 
              ? { uri: otherUser.avatar.startsWith('http') ? otherUser.avatar : `${API_URL}/uploads/${otherUser.avatar}` }
              : require("../../../../assets/chat/avatar.png")
          } 
          style={styles.avatarLarge} 
        />
        <Text style={styles.name}>
          {otherUser?.firstName} {otherUser?.lastName}
        </Text>
        {otherUser?.isOnline ? (
          <Text style={styles.onlineStatus}>Active now</Text>
        ) : (
          <Text style={styles.offlineStatus}>Offline</Text>
        )}
        
        <View style={styles.userInfoSection}>
          <View style={styles.infoRow}>
            <MaterialIcon name="email-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{otherUser?.email || "No email"}</Text>
          </View>
          
          {otherUser?.phone && (
            <View style={styles.infoRow}>
              <MaterialIcon name="phone-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{otherUser.phone}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcon name="phone" size={22} color="#fff" />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcon name="video" size={22} color="#fff" />
            <Text style={styles.actionText}>Video</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.blockButton]}
            onPress={() => {
              Alert.alert(
                "Block User",
                "Are you sure you want to block this user?",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Block", 
                    style: "destructive",
                    onPress: () => {
                      // Handle block user logic
                      navigation.goBack();
                    }
                  }
                ]
              );
            }}
          >
            <MaterialIcon name="block-helper" size={22} color="#fff" />
            <Text style={styles.actionText}>Block</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.privacySection}>
        <View style={styles.privacyOption}>
          <View style={styles.privacyOptionInfo}>
            <MaterialIcon name="bell-outline" size={24} color="#333" />
            <Text style={styles.privacyOptionText}>Mute notifications</Text>
          </View>
          <Switch 
            value={false}
            onValueChange={() => {}}
            trackColor={{ false: "#d3d3d3", true: "#135CAF" }}
            thumbColor="#fff"
          />
        </View>
      </View>
      
      {mediaMessages.images.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shared Photos</Text>
          <FlatList
            data={mediaMessages.images.slice(0, 6)}
            renderItem={renderMediaGrid}
            keyExtractor={(item, index) => `image-${index}`}
            numColumns={3}
            scrollEnabled={false}
          />
          {mediaMessages.images.length > 6 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {mediaMessages.videos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shared Videos</Text>
          <FlatList
            data={mediaMessages.videos.slice(0, 6)}
            renderItem={renderMediaGrid}
            keyExtractor={(item, index) => `video-${index}`}
            numColumns={3}
            scrollEnabled={false}
          />
          {mediaMessages.videos.length > 6 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {mediaMessages.files.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shared Files</Text>
          <FlatList
            data={mediaMessages.files.slice(0, 3)}
            renderItem={renderFileItem}
            keyExtractor={(item, index) => `file-${index}`}
            scrollEnabled={false}
          />
          {mediaMessages.files.length > 3 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );

  const renderAddMemberModal = () => (
    <Modal
      visible={showAddMemberModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Members</Text>
            <TouchableOpacity 
              onPress={() => {
                setShowAddMemberModal(false);
                setSelectedMembers([]);
                setSearchQuery('');
              }}
            >
              <MaterialIcon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {selectedMembers.length > 0 && (
            <View style={styles.selectedMembers}>
              <FlatList
                horizontal
                data={selectedMembers}
                renderItem={({ item }) => (
                  <View style={styles.selectedMemberChip}>
                    <Text style={styles.selectedMemberName}>
                      {item.firstName} {item.lastName}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSelectedMembers(prev => 
                        prev.filter(member => member._id !== item._id)
                      )}
                    >
                      <MaterialIcon name="close-circle" size={18} color="#666" />
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={item => item._id}
              />
            </View>
          )}

          <FlatList
            data={searchResults}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.searchResultItem}
                onPress={() => {
                  if (!selectedMembers.find(member => member._id === item._id)) {
                    setSelectedMembers(prev => [...prev, item]);
                  }
                }}
              >
                <Image 
                  source={
                    item.avatar 
                      ? { uri: item.avatar.startsWith('http') ? item.avatar : `${API_URL}/uploads/${item.avatar}` }
                      : require("../../../../assets/chat/avatar.png")
                  }
                  style={styles.searchResultAvatar}
                />
                <Text style={styles.searchResultName}>
                  {item.firstName} {item.lastName}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item._id}
          />

          {selectedMembers.length > 0 && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddMembers}
            >
              <Text style={styles.addButtonText}>Add Selected Members</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0099ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isGroup ? "Group Info" : "Contact Info"}
        </Text>
        <View style={{ width: 20 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {isGroup ? renderGroupHeader() : renderIndividualHeader()}
      </ScrollView>

      {renderAddMemberModal()}
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#135CAF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  avatarSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e4',
    marginBottom: 8,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  onlineStatus: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 12,
  },
  offlineStatus: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#135CAF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  blockButton: {
    backgroundColor: '#e53935',
  },
  leaveButton: {
    backgroundColor: '#e53935',
  },
  actionText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 12,
    fontWeight: '500',
  },
  userInfoSection: {
    width: '100%',
    marginTop: 15,
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  privacySection: {
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 15,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  privacyOptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
    borderRadius: 8,
    marginHorizontal: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  mediaItem: {
    flex: 1/3,
    aspectRatio: 1,
    margin: 2,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fileName: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  viewAllButton: {
    alignSelf: 'center',
    marginTop: 12,
    padding: 8,
  },
  viewAllText: {
    color: '#135CAF',
    fontWeight: '600',
    fontSize: 14,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  adminBadge: {
    fontSize: 12,
    color: '#135CAF',
    fontWeight: '500',
  },
  memberAction: {
    padding: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  selectedMembers: {
    marginBottom: 16,
  },
  selectedMemberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedMemberName: {
    marginRight: 4,
    color: '#135CAF',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  searchResultName: {
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#135CAF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  memberActionsMenu: {
    position: 'absolute',
    right: 40,
    top: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  memberActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
  },
  memberActionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  removeAction: {
    marginTop: 4,
  },
  removeText: {
    color: '#e53935',
  },
  dissolveButton: {
    backgroundColor: '#e53935',
  },
};

export default UserInfoScreen;