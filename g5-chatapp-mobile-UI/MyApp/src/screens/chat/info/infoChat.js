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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { chatService } from "../../../services/chat.service";
import { API_URL } from "../../../config/constants";
import { contactService } from "../../../services/contact.service";
import { 
  getSocket, 
  emitUpdateConversation,
  emitRemoveMemberFromGroup,
  emitDeleteConversation
} from "../../../services/socket";
import useAuthStore from "../../../store/useAuthStore";

const UserInfoScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [mediaMessages, setMediaMessages] = useState({
    images: [],
    videos: [],
    files: [],
  });
  const [groupMembers, setGroupMembers] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showMemberActions, setShowMemberActions] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [isMenuActionPressed, setIsMenuActionPressed] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  
  // Add new state variables for modals
  const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);
  const [showAssignAdminModal, setShowAssignAdminModal] = useState(false);
  const [showDissolveGroupModal, setShowDissolveGroupModal] = useState(false);
  const [showAdminSelectionModal, setShowAdminSelectionModal] = useState(false);
  const [potentialAdmins, setPotentialAdmins] = useState([]);
  
  // Lấy danh sách người dùng đang hoạt động từ useAuthStore
  const { activeUsers } = useAuthStore();
  
  const conversation = route.params?.conversation;
  
  // Validate conversation data at the start
  useEffect(() => {
    // Immediately validate the conversation data
    if (!conversation || !conversation._id) {
      console.error("[InfoChat] Invalid conversation data received:", conversation);
      Alert.alert(
        "Error", 
        "Invalid conversation data", 
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      return;
    } else {
      console.log("[InfoChat] Received valid conversation:", conversation._id);
    }
  }, [conversation, navigation]);
  
  const isGroup = conversation?.isGroup || false;
  const otherUser = isGroup ? null : conversation?.user;

  // Kiểm tra xem người dùng có đang online không
  const isUserOnline = userId => {
    if (!userId || !activeUsers || !activeUsers.length) return false;
    return activeUsers.includes(userId);
  };

  // Check if current user is admin
  const checkIsAdmin = () => {
    if (!currentUser || !groupMembers) return false;
    const currentMember = groupMembers.find(
      (member) => member.user._id === currentUser._id
    );
    return currentMember?.role === "ADMIN";
  };

  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      try {
        console.log("[InfoChat] Initializing with conversation:", conversation?._id);
        
        // Get user data
        const userData = await AsyncStorage.getItem("userData");
        if (userData && mounted) {
          const parsedUserData = JSON.parse(userData);
          console.log("[InfoChat] Current user:", parsedUserData?._id);
          setCurrentUser(parsedUserData);
        }

        if (isGroup && conversation?._id && mounted) {
          await refreshGroupMembers();
        }

        if (conversation?._id && mounted) {
          const response = await chatService.getMessages(conversation._id);
          if (response?.data && mounted) {
            // Process media files
            const messages = Array.isArray(response.data)
              ? response.data
              : response.data.data;

            const images = [];
            const videos = [];
            const files = [];

            messages.forEach((message) => {
              if (message.files && message.files.length > 0) {
                message.files.forEach((file) => {
                  const fileType =
                    file.type || file.fileName?.split(".").pop()?.toLowerCase();

                  if (
                    message.type === "IMAGE" ||
                    /\.(jpg|jpeg|png|gif)$/i.test(file.fileName)
                  ) {
                    images.push(file);
                  } else if (
                    message.type === "VIDEO" ||
                    /\.(mp4|mov|avi)$/i.test(file.fileName)
                  ) {
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

        // Set up socket event listeners
        const socket = getSocket();
        if (socket && conversation?._id && mounted) {
          console.log("[InfoChat] Setting up socket listeners for conversation:", conversation._id);
          
          // Clean up any existing listeners first to prevent duplicates
          socket.off('updateConversation');
          socket.off('removedGroupByAdmin');
          socket.off('dissolvedGroup');
          
          // Add new listeners
          socket.on('updateConversation', (data) => {
            if (!mounted) return;
            
            if (data.conversation?._id === conversation._id) {
              console.log('[InfoChat] Conversation updated, refreshing members');
              refreshGroupMembers();
            }
          });
          
          socket.on('removedGroupByAdmin', (data) => {
            if (!mounted) return;
            
            if (data.conversationId === conversation._id && 
                data.memberId === parsedUserData?._id) {
              console.log('[InfoChat] You were removed from the group');
              Alert.alert(
                "Removed from Group",
                "You have been removed from this group by an admin",
                [{ text: "OK", onPress: () => navigation.navigate("Home_Chat") }]
              );
            }
          });
          
          socket.on('dissolvedGroup', (data) => {
            if (!mounted) return;
            
            if (data.conversation?._id === conversation._id) {
              console.log('[InfoChat] Group has been dissolved');
              Alert.alert(
                "Group Dissolved",
                `This group has been dissolved by ${data.adminId === parsedUserData?._id ? 'you' : 'an admin'}`,
                [{ text: "OK", onPress: () => navigation.navigate("Home_Chat") }]
              );
            }
          });
        } else {
          console.log("[InfoChat] Socket not available or conversation ID missing");
        }
      } catch (error) {
        console.error("[InfoChat] Error initializing:", error);
      } finally {
        // Always set loading to false when initialization completes
        if (mounted) {
          console.log("[InfoChat] Initialization complete, setting loading to false");
          setLoading(false);
        }
      }
    };

    initialize();
    
    // Close any open member actions when scrolling
    const handleScroll = () => {
      if (showMemberActions) {
        setShowMemberActions(null);
      }
    };
    
    return () => {
      // Set mounted flag to false on cleanup
      mounted = false;
      
      // Clean up socket listeners
      const socket = getSocket();
      if (socket) {
        console.log("[InfoChat] Cleaning up socket listeners");
        socket.off('updateConversation');
        socket.off('removedGroupByAdmin');
        socket.off('dissolvedGroup');
      }
    };
  }, [conversation]);

  const refreshGroupMembers = async () => {
    try {
      console.log("[InfoChat] Refreshing group members");
      const conversationDetails = await chatService.getMyConversations();
      if (conversationDetails?.success && conversationDetails?.data) {
        const currentConv = conversationDetails.data.find(
          (conv) => conv._id === conversation._id
        );
        if (currentConv && currentConv.members) {
          setGroupMembers(currentConv.members || []);
          console.log("[InfoChat] Group members refreshed successfully:", currentConv.members.length);
        } else {
          console.log("[InfoChat] Could not find current conversation in response");
        }
      } else {
        console.log("[InfoChat] Failed to get conversation details:", conversationDetails?.error);
      }
    } catch (error) {
      console.error("[InfoChat] Error fetching group members:", error);
    }
  };

  const handleShowAddMemberModal = async () => {
    try {
      setLoading(true);
      const contactsResponse = await contactService.getMyContacts();
      if (contactsResponse.success) {
        console.log(
          "Contacts loaded successfully:",
          contactsResponse.data.length
        );

        // Log all contacts to see who's available
        contactsResponse.data.forEach((contact, index) => {
          // Extract the friend data - might be in user or contact field
          const contactPerson =
            contact.contact._id === currentUser?._id
              ? contact.user
              : contact.contact;
          console.log(
            `Contact ${index + 1}:`,
            contactPerson.firstName,
            contactPerson.lastName,
            `(ID: ${contactPerson._id})`
          );
        });

        // Log existing group members
        console.log(
          "Current group members:",
          groupMembers.map(
            (m) => `${m.user.firstName} ${m.user.lastName} (${m.user._id})`
          )
        );

        setSearchResults(contactsResponse.data);
        setSelectedMembers([]);
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
      if (selectedMembers.length === 0) {
        Alert.alert("Info", "Please select members to add");
        return;
      }

      setLoading(true);

      // Use the raw IDs without any processing - maintain the exact ObjectId format
      const memberIds = selectedMembers.map((member) => {
        console.log(
          `Processing member: ${member.firstName} ${member.lastName} with ID: ${member._id}`
        );
        return member._id;
      });

      console.log("Adding members with IDs:", memberIds);

      // Log the structure we're sending to the API with the field name newMemberIds
      console.log("Request payload:", { newMemberIds: memberIds });

      const response = await chatService.addMembersToGroup(
        conversation._id,
        memberIds
      );
      console.log("Add members response:", response);

      if (response.success) {
        await refreshGroupMembers();
        setShowAddMemberModal(false);
        setSelectedMembers([]);
        setSearchQuery("");
        Alert.alert("Success", "Members added successfully");
      } else {
        console.error("Server error:", response.error);
        Alert.alert("Error", response.error || "Failed to add members");
      }
    } catch (error) {
      console.error("Error adding members:", error);
      Alert.alert("Error", error.message || "Failed to add members");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      setIsProcessingAction(true);
      console.log(`[handleRemoveMember] Starting - memberId: ${memberId}, conversation: ${conversation._id}`);
      setLoading(true);
      
      if (!chatService.removeMember) {
        console.error("[handleRemoveMember] Error: chatService.removeMember function is not defined");
        throw new Error("The removeMember function is not available");
      }
      
      const response = await chatService.removeMember(
        conversation._id,
        memberId
      );
      
      console.log('[handleRemoveMember] Response:', response);
      
      if (response.success) {
        console.log("[handleRemoveMember] Member removed successfully");
        
        // Emit socket event to notify the removed member
        const adminRemoveMember = {
          memberId: memberId,
          conversationId: conversation._id
        };
        emitRemoveMemberFromGroup(adminRemoveMember);
        
        await refreshGroupMembers();
        Alert.alert("Success", "Member has been removed from the group");
      } else {
        console.error("[handleRemoveMember] Error in response:", response.error);
        Alert.alert("Error", response.error || "Failed to remove member");
      }
    } catch (error) {
      console.error("[handleRemoveMember] Exception:", error);
      Alert.alert("Error", error.message || "Failed to remove member");
    } finally {
      setLoading(false);
      setShowActionModal(false);
      setSelectedMember(null);
      setIsProcessingAction(false);
    }
  };

  const handleChangeRole = async (memberId) => {
    try {
      setIsProcessingAction(true);
      console.log(`[handleChangeRole] Starting - memberId: ${memberId}, conversation: ${conversation._id}`);
      setLoading(true);
      
      if (!chatService.changeRoleMember) {
        console.error("[handleChangeRole] Error: chatService.changeRoleMember function is not defined");
        throw new Error("The changeRoleMember function is not available");
      }
      
      const response = await chatService.changeRoleMember(
        conversation._id,
        memberId
      );
      
      console.log('[handleChangeRole] Response:', response);
      
      if (response.success) {
        console.log("[handleChangeRole] Role changed successfully");
        await refreshGroupMembers();
        Alert.alert("Success", "Member has been promoted to Owner");
      } else {
        console.error("[handleChangeRole] Error in response:", response.error);
        Alert.alert("Error", response.error || "Failed to change member role");
      }
    } catch (error) {
      console.error("[handleChangeRole] Exception:", error);
      Alert.alert("Error", error.message || "Failed to change member role");
    } finally {
      setLoading(false);
      setShowActionModal(false);
      setSelectedMember(null);
      setIsProcessingAction(false);
    }
  };

  const handleMakeAdmin = async (memberId) => {
    try {
      setIsProcessingAction(true);
      console.log(`[handleMakeAdmin] Starting - memberId: ${memberId}, conversation: ${conversation._id}`);
      setLoading(true);
      
      if (!chatService.changeAdmin) {
        console.error("[handleMakeAdmin] Error: chatService.changeAdmin function is not defined");
        throw new Error("The changeAdmin function is not available");
      }
      
      const response = await chatService.changeAdmin(
        conversation._id,
        memberId
      );
      
      console.log('[handleMakeAdmin] Response:', response);
      
      if (response.success) {
        console.log("[handleMakeAdmin] Admin role assigned successfully");
        await refreshGroupMembers();
        Alert.alert("Success", "Member has been assigned as admin");
      } else {
        console.error("[handleMakeAdmin] Error in response:", response.error);
        Alert.alert("Error", response.error || "Failed to assign admin role");
      }
    } catch (error) {
      console.error("[handleMakeAdmin] Exception:", error);
      Alert.alert("Error", error.message || "Failed to assign admin role");
    } finally {
      setLoading(false);
      setShowActionModal(false);
      setSelectedMember(null);
      setIsProcessingAction(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
 
      const isAdmin = checkIsAdmin();
      console.log("Current user is admin:", isAdmin);
  
      if (isAdmin) {
        // Check if there's another admin in the group
        const hasAnotherAdmin = groupMembers.some(
          (member) => member.role === "ADMIN" && member.user._id !== currentUser._id
        );
        console.log("Has another admin:", hasAnotherAdmin);
  
        if (hasAnotherAdmin) {
          // If there is another admin, show modal to confirm leaving
          setShowLeaveGroupModal(true);
        } else if (groupMembers.length > 1) {
          // No other admin, but there are other members; show modal to assign a new admin
          const otherMembers = groupMembers.filter(
            (member) => member.user._id !== currentUser._id
          );
          setPotentialAdmins(otherMembers);
          setShowAssignAdminModal(true);
        } else {
          // Admin is the only member; show modal to confirm dissolving the group
          setShowDissolveGroupModal(true);
        }
      } else {
        // Non-admin (member) can leave directly - show leave confirmation modal
        setShowLeaveGroupModal(true);
      }
    } catch (error) {
      console.error("Error in handleLeaveGroup:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred");
    }
  };

  const confirmLeaveGroup = async () => {
    try {
      setLoading(true);
      
      if (!chatService.leaveGroup) {
        console.error("[confirmLeaveGroup] Error: chatService.leaveGroup function is not defined");
        throw new Error("The leaveGroup function is not available");
      }
      
      const response = await chatService.leaveGroup(conversation._id);
      
      console.log("[confirmLeaveGroup] Response:", response);
      
      if (response.success) {
        setShowLeaveGroupModal(false);
        navigation.navigate("Home_Chat");
      } else {
        console.error("[confirmLeaveGroup] Error in response:", response.error);
        Alert.alert("Error", response.error || "Failed to leave group");
      }
    } catch (error) {
      console.error("[confirmLeaveGroup] Exception:", error);
      Alert.alert("Error", error.message || "Failed to leave group");
    } finally {
      setLoading(false);
    }
  };

  const showAdminSelection = () => {
    setShowAssignAdminModal(false);
    setShowAdminSelectionModal(true);
  };

  const assignNewAdminAndLeave = async (memberId) => {
    try {
      setLoading(true);
      console.log("[assignNewAdminAndLeave] Assigning new admin:", memberId);
      
      if (!chatService.changeAdmin) {
        console.error("[assignNewAdminAndLeave] Error: chatService.changeAdmin function is not defined");
        throw new Error("The changeAdmin function is not available");
      }
      
      // Use the changeAdmin function
      const adminChangeResult = await chatService.changeAdmin(
        conversation._id,
        memberId
      );

      console.log("[assignNewAdminAndLeave] Admin change result:", adminChangeResult);

      if (adminChangeResult.success) {
        if (!chatService.leaveGroup) {
          console.error("[assignNewAdminAndLeave] Error: chatService.leaveGroup function is not defined");
          throw new Error("The leaveGroup function is not available");
        }
        
        // Leave the group after assigning new admin
        const leaveResult = await chatService.leaveGroup(conversation._id);
        
        console.log("[assignNewAdminAndLeave] Leave group result:", leaveResult);
        
        if (leaveResult.success) {
          setShowAdminSelectionModal(false);
          navigation.navigate("Home_Chat");
        } else {
          console.error("[assignNewAdminAndLeave] Error leaving group:", leaveResult.error);
          throw new Error(leaveResult.error || "Failed to leave group after assigning new admin");
        }
      } else {
        console.error("[assignNewAdminAndLeave] Error assigning new admin:", adminChangeResult.error);
        throw new Error(adminChangeResult.error || "Failed to assign new admin");
      }
    } catch (error) {
      console.error("[assignNewAdminAndLeave] Exception:", error);
      Alert.alert("Error", error.message || "Failed to assign new admin and leave group");
    } finally {
      setLoading(false);
    }
  };

  const dissolveGroup = async () => {
    try {
      setLoading(true);
      
      if (!chatService.dissolveGroup) {
        console.error("[dissolveGroup] Error: chatService.dissolveGroup function is not defined");
        throw new Error("The dissolveGroup function is not available");
      }
      
      const response = await chatService.dissolveGroup(conversation._id);
      
      console.log("[dissolveGroup] Response:", response);
      
      if (response.success) {
        // Emit socket event to notify all group members about dissolution
        emitDeleteConversation(conversation, currentUser?._id);
        
        setShowDissolveGroupModal(false);
        navigation.navigate("Home_Chat");
      } else {
        console.error("[dissolveGroup] Error in response:", response.error);
        throw new Error(response.error || "Failed to dissolve group");
      }
    } catch (error) {
      console.error("[dissolveGroup] Exception:", error);
      Alert.alert("Error", error.message || "Failed to dissolve group");
    } finally {
      setLoading(false);
    }
  };

  const renderMediaGrid = ({ item }) => {
    const isVideo =
      item.type === "video" || /\.(mp4|mov|avi)$/i.test(item.fileName);

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
        <Image source={{ uri: item.url }} style={styles.mediaThumbnail} />
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
        navigation.navigate("FileViewer", { 
          uri: item.url,
          fileName: item.fileName
        });
      }}
    >
      <View style={styles.fileIconContainer}>
        <MaterialIcon 
          name={getFileIcon(item.fileName)}
          size={24} 
          color="#135CAF" 
        />
      </View>
      <View style={styles.fileDetails}>
        <Text style={styles.fileName} numberOfLines={1}>
          {item.fileName || "Unnamed file"}
        </Text>
        <Text style={styles.fileSize}>
          {item.size ? `${(item.size / 1024).toFixed(1)} KB` : "2 KB"}
        </Text>
      </View>
      <MaterialIcon name="download" size={22} color="#666" />
    </TouchableOpacity>
  );

  const renderMemberItem = ({ item }) => {
    const user = item.user || {};
    const isAdmin = item.role === "ADMIN";
    const isSelf = user._id === currentUser?._id;

    return (
      <View style={styles.memberItem} key={item._id || user._id}>
        <View style={styles.memberInfo}>
          <View style={styles.memberAvatarContainer}>
            <Image
              source={
                user.avatar
                  ? {
                      uri: user.avatar.startsWith("http")
                        ? user.avatar
                        : `${API_URL}/uploads/${user.avatar}`,
                    }
                  : require("../../../../assets/chat/avatar.png")
              }
              style={styles.memberAvatar}
            />
          </View>
          <View>
            <Text style={styles.memberName}>
              {user.firstName} {user.lastName}
              {isSelf ? " (Bạn)" : ""}
            </Text>
            {isAdmin && <Text style={styles.adminBadge}>Trưởng nhóm</Text>}
          </View>
        </View>

        {!isSelf && checkIsAdmin() && (
          <TouchableOpacity
            style={styles.memberAction}
            onPress={() => {
              console.log("Opening action modal for member:", user._id);
              setSelectedMember(user);
              setShowActionModal(true);
            }}
          >
            <MaterialIcon name="dots-vertical" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderGroupHeader = () => {
    if (!conversation) return null;
    
    return (
      <>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                conversation.avatar
                  ? {
                      uri: conversation.avatar.startsWith("http")
                        ? conversation.avatar
                        : `${API_URL}/uploads/${conversation.avatar}`,
                    }
                  : require("../../../../assets/chat/group.jpg")
              }
              style={styles.avatarLarge}
            />
            {checkIsAdmin() && (
              <TouchableOpacity style={styles.editAvatarButton}>
                <MaterialIcon name="camera" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.name}>{conversation.name || "Group Chat"}</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.memberCountBadge}>
              <MaterialIcon name="account-group" size={16} color="#135CAF" />
              <Text style={styles.memberCount}>{groupMembers.length} thành viên</Text>
            </View>
            {checkIsAdmin() && (
              <View style={styles.adminBadgeLarge}>
                <Text style={styles.adminBadgeText}>Trưởng nhóm</Text>
              </View>
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShowAddMemberModal}
            >
              <MaterialIcon name="account-plus" size={22} color="#fff" />
              <Text style={styles.actionText}>Thêm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.leaveButton]}
              onPress={handleLeaveGroup}
            >
              <MaterialIcon name="exit-to-app" size={22} color="#fff" />
              <Text style={styles.actionText}>Rời nhóm</Text>
            </TouchableOpacity>

            {checkIsAdmin() && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.dissolveButton]}
                onPress={() => setShowDissolveGroupModal(true)}
              >
                <MaterialIcon name="delete" size={22} color="#fff" />
                <Text style={styles.actionText}>Giải tán</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <MaterialIcon name="account-group" size={20} color="#135CAF" />
              <Text style={styles.sectionTitle}>Thành viên ({groupMembers.length})</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowAllMembers(!showAllMembers)}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>
                {showAllMembers ? "Hide" : "Show all"}
              </Text>
              <MaterialIcon 
                name={showAllMembers ? "chevron-up" : "chevron-down"} 
                size={18} 
                color="#135CAF" 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.membersList}>
            {(showAllMembers ? groupMembers : groupMembers.slice(0, 3)).map((item) => renderMemberItem({ item }))}
          </View>
          
          {!showAllMembers && groupMembers.length > 3 && (
            <TouchableOpacity 
              style={styles.showMoreButton}
              onPress={() => setShowAllMembers(true)}
            >
              <Text style={styles.showMoreText}>
                +{groupMembers.length - 3} thành viên
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {mediaMessages.images.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcon name="image-multiple" size={20} color="#135CAF" />
                <Text style={styles.sectionTitle}>Hình ảnh chia sẻ</Text>
              </View>
              {mediaMessages.images.length > 6 && (
                <TouchableOpacity style={styles.viewAllTextButton}>
                  <Text style={styles.viewAllTextButtonLabel}>Tất cả</Text>
                  <MaterialIcon name="chevron-right" size={16} color="#135CAF" />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={mediaMessages.images.slice(0, 6)}
              renderItem={renderMediaGrid}
              keyExtractor={(item, index) => `image-${index}`}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.mediaGrid}
            />
          </View>
        )}

        {mediaMessages.videos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcon name="video" size={20} color="#135CAF" />
                <Text style={styles.sectionTitle}>Video chia sẻ</Text>
              </View>
              {mediaMessages.videos.length > 6 && (
                <TouchableOpacity style={styles.viewAllTextButton}>
                  <Text style={styles.viewAllTextButtonLabel}>Tất cả</Text>
                  <MaterialIcon name="chevron-right" size={16} color="#135CAF" />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={mediaMessages.videos.slice(0, 6)}
              renderItem={renderMediaGrid}
              keyExtractor={(item, index) => `video-${index}`}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.mediaGrid}
            />
          </View>
        )}

        {mediaMessages.files.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcon name="file-document-multiple" size={20} color="#135CAF" />
                <Text style={styles.sectionTitle}>File đính kèm</Text>
              </View>
              {mediaMessages.files.length > 3 && (
                <TouchableOpacity style={styles.viewAllTextButton}>
                  <Text style={styles.viewAllTextButtonLabel}>Tất cả</Text>
                  <MaterialIcon name="chevron-right" size={16} color="#135CAF" />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={mediaMessages.files.slice(0, 3)}
              renderItem={renderFileItem}
              keyExtractor={(item, index) => `file-${index}`}
              scrollEnabled={false}
            />
          </View>
        )}
      </>
    );
  };

  const renderIndividualHeader = () => {
    if (!conversation || !otherUser) return null;
    
    return (
      <>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                otherUser?.avatar
                  ? {
                      uri: otherUser.avatar.startsWith("http")
                        ? otherUser.avatar
                        : `${API_URL}/uploads/${otherUser.avatar}`,
                    }
                  : require("../../../../assets/chat/avatar.png")
              }
              style={styles.avatarLarge}
            />
          </View>
          <Text style={styles.name}>
            {otherUser?.firstName} {otherUser?.lastName}
          </Text>
        </View>


        {mediaMessages.images.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcon name="image-multiple" size={20} color="#135CAF" />
                <Text style={styles.sectionTitle}>Hình ảnh chia sẻ</Text>
              </View>
              {mediaMessages.images.length > 6 && (
                <TouchableOpacity style={styles.viewAllTextButton}>
                  <Text style={styles.viewAllTextButtonLabel}>tất cả</Text>
                  <MaterialIcon name="chevron-right" size={16} color="#135CAF" />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={mediaMessages.images.slice(0, 6)}
              renderItem={renderMediaGrid}
              keyExtractor={(item, index) => `image-${index}`}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.mediaGrid}
            />
          </View>
        )}

        {mediaMessages.videos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcon name="video" size={20} color="#135CAF" />
                <Text style={styles.sectionTitle}>Video chia sẻ</Text>
              </View>
              {mediaMessages.videos.length > 6 && (
                <TouchableOpacity style={styles.viewAllTextButton}>
                  <Text style={styles.viewAllTextButtonLabel}>Tất cả</Text>
                  <MaterialIcon name="chevron-right" size={16} color="#135CAF" />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={mediaMessages.videos.slice(0, 6)}
              renderItem={renderMediaGrid}
              keyExtractor={(item, index) => `video-${index}`}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.mediaGrid}
            />
          </View>
        )}

        {mediaMessages.files.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <MaterialIcon name="file-document-multiple" size={20} color="#135CAF" />
                <Text style={styles.sectionTitle}>File đính kèm</Text>
              </View>
              {mediaMessages.files.length > 3 && (
                <TouchableOpacity style={styles.viewAllTextButton}>
                  <Text style={styles.viewAllTextButtonLabel}>Tất cả</Text>
                  <MaterialIcon name="chevron-right" size={16} color="#135CAF" />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={mediaMessages.files.slice(0, 3)}
              renderItem={renderFileItem}
              keyExtractor={(item, index) => `file-${index}`}
              scrollEnabled={false}
            />
          </View>
        )}
      </>
    );
  };

  const renderAddMemberModal = () => (
    <Modal
      visible={showAddMemberModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm thành viên</Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddMemberModal(false);
                setSelectedMembers([]);
                setSearchQuery("");
              }}
            >
              <MaterialIcon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {selectedMembers.length > 0 && (
            <View style={styles.selectedMembers}>
              <Text style={styles.sectionTitle}>Chọn thành viên</Text>
              <FlatList
                horizontal
                data={selectedMembers}
                renderItem={({ item }) => (
                  <View style={styles.selectedMemberChip}>
                    <Text style={styles.selectedMemberName}>
                      {item.firstName} {item.lastName}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedMembers((prev) =>
                          prev.filter((member) => member._id !== item._id)
                        )
                      }
                    >
                      <MaterialIcon
                        name="close-circle"
                        size={18}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item) => item._id}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

          <FlatList
            data={searchResults}
            renderItem={({ item }) => {
              // Extract the contact details - this could be in user or contact field
              // If the user._id is our ID, then the contact field contains the friend
              // If the contact._id is our ID, then the user field contains the friend
              const contactPerson =
                item.contact._id === currentUser?._id
                  ? item.user
                  : item.contact;

              console.log(
                `Processing potential member: ${contactPerson.firstName} ${contactPerson.lastName} (${contactPerson._id})`
              );

              // Skip if this is the current user
              if (contactPerson._id === currentUser?._id) {
                console.log(`Skipping self: ${contactPerson._id}`);
                return null;
              }

              // Check if already in group
              const isMember = groupMembers.some(
                (member) => member.user._id === contactPerson._id
              );
              console.log(
                `Contact ${contactPerson.firstName} is member: ${isMember}`
              );

              return (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => {
                    if (
                      !isMember &&
                      !selectedMembers.some(
                        (member) => member._id === contactPerson._id
                      )
                    ) {
                      setSelectedMembers((prev) => [...prev, contactPerson]);
                    }
                  }}
                  disabled={isMember}
                >
                  <Image
                    source={
                      contactPerson.avatar
                        ? {
                            uri: contactPerson.avatar.startsWith("http")
                              ? contactPerson.avatar
                              : `${API_URL}/uploads/${contactPerson.avatar}`,
                          }
                        : require("../../../../assets/chat/avatar.png")
                    }
                    style={styles.searchResultAvatar}
                  />
                    <Text style={styles.searchResultName}>
                      {contactPerson.firstName} {contactPerson.lastName}
                    </Text>
                    {isMember && (
                      <Text style={styles.memberStatus}>Đã là thành viên</Text>
                    )}
                  {selectedMembers.some(
                    (member) => member._id === contactPerson._id
                  ) && (
                    <Text style={[styles.memberStatus, { color: "#135CAF" }]}>
                      Selected
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", padding: 20, color: "#666" }}>
                  Không có liên hệ để thêm
                </Text>
            }
          />

          {selectedMembers.length > 0 && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddMembers}
            >
              <Text style={styles.addButtonText}>Thêm thành viên</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderLeaveGroupModal = () => (
    <Modal
      visible={showLeaveGroupModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Rời nhóm</Text>
            <TouchableOpacity onPress={() => setShowLeaveGroupModal(false)}>
              <MaterialIcon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalMessage}>
            Bạn có chắc chắn muốn rời nhóm này không?
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowLeaveGroupModal(false)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmButton]}
              onPress={confirmLeaveGroup}
            >
              <Text style={styles.confirmButtonText}>Rời</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAssignAdminModal = () => (
    <Modal
      visible={showAssignAdminModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thay đổi trưởng nhóm</Text>
            <TouchableOpacity onPress={() => setShowAssignAdminModal(false)}>
              <MaterialIcon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalMessage}>
            Trước khi rời nhóm, bạn phải chọn một thành viên khác làm trưởng nhóm.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowAssignAdminModal(false)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmButton]}
              onPress={showAdminSelection}
            >
              <Text style={styles.confirmButtonText}>Chọn trưởng nhóm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAdminSelectionModal = () => (
    <Modal
      visible={showAdminSelectionModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { maxHeight: "70%" }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn trưởng nhóm</Text>
            <TouchableOpacity onPress={() => setShowAdminSelectionModal(false)}>
              <MaterialIcon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalMessage}>
            Chọn một thành viên để làm trưởng nhóm:
          </Text>
          
          <FlatList
            data={potentialAdmins}
            keyExtractor={(item) => item.user._id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.memberSelectionItem}
                onPress={() => assignNewAdminAndLeave(item.user._id)}
              >
                <Image 
                  source={
                    item.user.avatar 
                      ? { uri: item.user.avatar.startsWith("http") 
                          ? item.user.avatar 
                          : `${API_URL}/uploads/${item.user.avatar}` }
                      : require("../../../../assets/chat/avatar.png")
                  } 
                  style={styles.memberSelectionAvatar} 
                />
                  <Text style={styles.memberSelectionName}>
                    {item.user.firstName} {item.user.lastName}
                  </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", padding: 20, color: "#666" }}>
                  Không có thành viên khác để chọn làm trưởng nhóm.
                </Text>
            }
          />
          
          <TouchableOpacity 
            style={[styles.modalButton, styles.cancelButton, { marginTop: 10 }]}
            onPress={() => setShowAdminSelectionModal(false)}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderDissolveGroupModal = () => (
    <Modal
      visible={showDissolveGroupModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Giải tán nhóm</Text>
            <TouchableOpacity onPress={() => setShowDissolveGroupModal(false)}>
              <MaterialIcon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalMessage}>
            Bạn là thành viên duy nhất trong nhóm này. Bạn có muốn giải tán nó không?
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowDissolveGroupModal(false)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.dissolveButton]}
              onPress={dissolveGroup}
            >
              <Text style={styles.confirmButtonText}>Giải tán</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderMemberActionsModal = () => (
    <Modal
      visible={showActionModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowActionModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowActionModal(false)}
      >
        <View style={styles.actionModalContent}>
          <Text style={styles.actionModalTitle}>
            Tùy chọn
          </Text>
          
          {selectedMember && (
            <>
              <TouchableOpacity
                style={styles.actionModalItem}
                onPress={() => handleMakeAdmin(selectedMember._id)}
              >
                  <MaterialIcon name="shield-account" size={22} color="#4CAF50" />
                <Text style={styles.actionModalItemText}>Chuyển thành trưởng nhóm</Text>
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity
            style={[styles.actionModalItem, styles.removeActionItem]}
            onPress={() => handleRemoveMember(selectedMember?._id)}
          >
              <MaterialIcon name="account-remove" size={22} color="#e53935" />
            <Text style={[styles.actionModalItemText, styles.removeActionText]}>
              Xóa thành viên
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowActionModal(false)}
          >
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Helper function to determine file icon
  const getFileIcon = (fileName) => {
    if (!fileName) return "file-document-outline";
    const ext = fileName.split(".").pop().toLowerCase();
    
    switch (ext) {
      case "pdf":
        return "file-pdf-box";
      case "doc":
      case "docx":
        return "file-word-box";
      case "xls":
      case "xlsx":
        return "file-excel-box";
      case "ppt":
      case "pptx":
        return "file-powerpoint-box";
      case "zip":
      case "rar":
      case "7z":
        return "zip-box";
      case "txt":
        return "file-document-box";
      case "mp3":
      case "wav":
      case "ogg":
        return "file-music-box";
      default:
        return "file-document-box";
    }
  };

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
          {isGroup ? "Thông tin nhóm" : "Thông tin liên hệ"}
        </Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        onScrollBeginDrag={() => {
          console.log("Scroll started - hiding menus");
          setShowActionModal(false);
        }}
      >
        {isGroup ? renderGroupHeader() : renderIndividualHeader()}
      </ScrollView>

      {renderAddMemberModal()}
      {renderLeaveGroupModal()}
      {renderAssignAdminModal()}
      {renderAdminSelectionModal()}
      {renderDissolveGroupModal()}
      {renderMemberActionsModal()}
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#135CAF",
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  avatarSection: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e4",
    marginBottom: 12,
    borderRadius: 16,
    marginHorizontal: 12,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarLarge: {
    width: 140,
    height: 140,
    borderRadius: 100,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#e6effe",
  },
  editAvatarButton: {
    position: "absolute",
    top: 0,
    right: 10,
    padding: 4,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  memberCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    backgroundColor: "#f0f5ff",
    borderRadius: 12,
  },
  memberCount: {
    marginLeft: 4,
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
  adminBadgeLarge: {
    padding: 4,
    backgroundColor: "#e6f2ff",
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: 12,
    color: "#135CAF",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 16,
    width: "100%",
    justifyContent: "space-around",
  },
  actionButton: {
    backgroundColor: "#135CAF",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 90,
    shadowColor: "#135CAF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  blockButton: {
    backgroundColor: "#e74c3c",
    shadowColor: "#e74c3c",
  },
  leaveButton: {
    backgroundColor: "#e74c3c",
    shadowColor: "#e74c3c",
  },
  dissolveButton: {
    backgroundColor: "#e74c3c",
    shadowColor: "#e74c3c",
  },
  actionText: {
    color: "#fff",
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    padding: 18,
    backgroundColor: "#fff",
    marginTop: 12,
    borderRadius: 16,
    marginHorizontal: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginLeft: 10,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f5ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  toggleText: {
    marginRight: 5,
    color: "#135CAF",
    fontWeight: "600",
  },
  showMoreButton: {
    alignSelf: "center",
    marginTop: 14,
    padding: 10,
    backgroundColor: "#f0f5ff",
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  showMoreText: {
    color: "#135CAF",
    fontWeight: "600",
    fontSize: 14,
  },
  mediaItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 2,
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
  },
  mediaThumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#f0f5ff",
    borderRadius: 10,
    marginVertical: 5,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fileIconContainer: {
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  fileSize: {
    fontSize: 12,
    color: "#666",
  },
  viewAllTextButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllTextButtonLabel: {
    fontSize: 14,
    color: "#135CAF",
    fontWeight: "600",
    marginRight: 4,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    position: "relative",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberAvatarContainer: {
    position: "relative",
  },
  memberAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#e6effe",
  },
  memberOnlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  adminBadge: {
    fontSize: 12,
    color: "#135CAF",
    fontWeight: "600",
    backgroundColor: "#e6f2ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  memberAction: {
    padding: 8,
    backgroundColor: "#f0f5ff",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  searchInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedMembers: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  selectedMemberChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#c8e1fb",
  },
  selectedMemberName: {
    marginRight: 6,
    color: "#135CAF",
    fontWeight: "600",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchResultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#e6effe",
  },
  searchResultName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#135CAF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#135CAF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  actionModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: "#333",
  },
  actionModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionModalItemText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: "500",
  },
  removeActionItem: {
    borderBottomWidth: 0,
    marginTop: 5,
  },
  removeActionText: {
    color: '#e53935',
  },
  cancelButton: {
    marginTop: 18,
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  cancelText: {
    color: '#666',
    fontWeight: 'bold',
  },
  memberStatus: {
    fontSize: 13,
    color: "#999",
    marginLeft: 10,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: "#333",
    marginVertical: 20,
    textAlign: "center",
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 6,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#135CAF",
    shadowColor: "#135CAF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  memberSelectionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 4,
  },
  memberSelectionAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#e6effe",
  },
  memberSelectionName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  adminAction: {
    marginTop: 6,
  },
  membersList: {
    width: '100%',
  },
  avatarContainer: {
    position: "relative",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "#fff",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f5ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },
  offlineDot: {
    backgroundColor: "#9e9e9e",
  },
  onlineStatus: {
    fontSize: 15,
    color: "#4CAF50",
    marginBottom: 14,
    fontWeight: "500",
  },
  offlineStatus: {
    fontSize: 15,
    color: "#999",
    marginBottom: 14,
    fontWeight: "500",
  },
  userInfoSection: {
    width: "100%",
    marginTop: 18,
    marginBottom: 5,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  privacySection: {
    backgroundColor: "#fff",
    marginBottom: 12,
    padding: 18,
    marginHorizontal: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  privacyOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  privacyOptionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  privacyOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  modalIconContainer: {
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  warningIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cancelModalButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dissolveConfirmButton: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  selectedMemberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f0f5ff',
    marginBottom: 20,
  },
  selectedMemberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#e6effe',
  },
  selectedMemberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyListContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 12,
    right: 5,
    backgroundColor: '#135CAF',
    width: 33,
    height: 33,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  memberCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  adminBadgeLarge: {
    backgroundColor: '#e6f2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  adminBadgeText: {
    fontSize: 12,
    color: '#135CAF',
    fontWeight: '600',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaGrid: {
    margin: 2,
    marginTop: 5,
  },
  viewAllTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllTextButtonLabel: {
    fontSize: 14,
    color: '#135CAF',
    fontWeight: '600',
    marginRight: 4,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4caf50',
    borderWidth: 3,
    borderColor: '#fff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f5ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
    marginRight: 6,
  },
  offlineDot: {
    backgroundColor: '#9e9e9e',
  },
  memberAvatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  memberOnlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4caf50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  fileDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  fileSize: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  }
};

export default UserInfoScreen;