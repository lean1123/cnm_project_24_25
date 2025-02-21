import React, { useState } from 'react';
import { 
    View, Text, Image, TouchableOpacity, StyleSheet, Modal, TextInput 
  } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const ProfileScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Lennon',
    phone: '(+44) 20 1234 5689',
    gender: 'Male',
    birthday: '12/01/1997',
    email: 'john.lennon@mail.com'
  });

  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const handleSave = () => {
    setProfile(editedProfile); // Cập nhật profile mới
    setModalVisible(false); // Đóng modal
  };
    return (
    <View style={styles.container}>
     <Header />
      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=5' }} // Avatar mẫu
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatar}>
            <Icon name="pencil" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>John Lennon</Text>

        {/* Thông tin cá nhân */}
        <View style={styles.infoContainer}>
          <InfoRow label="Phone" value={profile.phone} />
          <InfoRow label="Gender" value={profile.gender} />
          <InfoRow label="Birthday" value={profile.birthday} />
          <InfoRow label="Email" value={profile.email} />
        </View>

       {/* Buttons */}
       <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
          <Icon name="pencil" size={18} color="#fff" />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton}>
          <Icon name="logout" size={18} color="#E74C3C" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Footer />
         {/* Modal chỉnh sửa */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TextInput
              style={styles.input}
              value={editedProfile.name}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, name: text })}
              placeholder="Full Name"
            />
            <TextInput
              style={styles.input}
              value={editedProfile.phone}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, phone: text })}
              placeholder="Phone Number"
            />
            <TextInput
              style={styles.input}
              value={editedProfile.gender}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, gender: text })}
              placeholder="Gender"
            />
            <TextInput
              style={styles.input}
              value={editedProfile.birthday}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, birthday: text })}
              placeholder="Birthday"
            />
            <TextInput
              style={styles.input}
              value={editedProfile.email}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, email: text })}
              placeholder="Email"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </View>
  );
};

/* Component hàng thông tin */
const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label} :</Text>
    <Text style={styles.infoValue}>{value}</Text>
    <Icon name="content-copy" size={16} color="#999" />
  </View>
);

export default ProfileScreen;

/* Styles */
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      marginTop: 20,
    },
    /* Profile Section */
    profileSection: {
      alignItems: 'center',
      flex: 1,
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    editAvatar: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#135CAF',
      borderRadius: 12,
      padding: 6,
    },
    name: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 10,
    },
    /* Info */
    infoContainer: {
      marginTop: 10,
      width: '80%',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderColor: '#eee',
    },
    infoLabel: {
      fontWeight: 'bold',
      color: '#666',
    },
    infoValue: {
      color: '#333',
    },
    /* Buttons */
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#3498db',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginTop: 20,
    },
    editText: {
      color: '#fff',
      marginLeft: 10,
      fontWeight: 'bold',
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FCE4E4',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginTop: 10,
    },
    logoutText: {
      color: '#E74C3C',
      marginLeft: 10,
      fontWeight: 'bold',
    },
    /* Modal */
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      width: '80%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 10,
      marginVertical: 5,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 15,
    },
    saveButton: {
      backgroundColor: '#3498db',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    saveText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    cancelButton: {
      backgroundColor: '#FCE4E4',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    cancelText: {
      color: '#E74C3C',
      fontWeight: 'bold',
    },
  });