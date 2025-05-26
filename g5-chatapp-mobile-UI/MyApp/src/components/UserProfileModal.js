import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Modal, Portal, Avatar, Card, Title, Divider, List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns'; // For formatting date of birth

const UserProfileModal = ({ visible, onClose, user }) => {
  if (!user) {
    return null; // Or some loading/error state if user is temporarily null
  }

  const defaultAvatar = require('../../assets/chat/avatar.png');

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Card style={styles.card}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color="#555" />
            </TouchableOpacity>
            <View style={styles.header}>
              <Avatar.Image
                size={100}
                source={user.avatar ? { uri: user.avatar } : defaultAvatar}
                style={styles.avatar}
              />
              <Title style={styles.userName}>
                {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}
              </Title>
              {/* You can add a subtitle here if needed, e.g., user's role or status */}
            </View>

            <Card.Content style={styles.content}>
              <List.Section>
                <List.Subheader style={styles.subheader}>Thông tin cá nhân</List.Subheader>
                <List.Item
                  title="Email"
                  description={user.email || 'N/A'}
                  left={() => <List.Icon icon="email" color="#007AFF" />}
                  titleStyle={styles.listItemTitle}
                  descriptionStyle={styles.listItemDescription}
                />
                <Divider />
                <List.Item
                  title="Ngày sinh"
                  description={user.dob ? format(new Date(user.dob), 'dd/MM/yyyy') : 'N/A'}
                  left={() => <List.Icon icon="cake-variant" color="#FF69B4" />}
                  titleStyle={styles.listItemTitle}
                  descriptionStyle={styles.listItemDescription}
                />
                 <Divider />
                <List.Item
                  title="Giới tính"
                  description={user.gender || 'N/A'}
                  left={() => <List.Icon icon={user.gender === 'male' ? 'gender-male' : user.gender === 'female' ? 'gender-female' : 'gender-transgender'} color="#4CAF50" />}
                  titleStyle={styles.listItemTitle}
                  descriptionStyle={styles.listItemDescription}
                />
              </List.Section>
            </Card.Content>
            
          </Card>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'rgba(0,0,0,0.0)', // Transparent background for the modal itself
    padding: 0, // Let the card handle padding
    margin: 20, // Give some margin around the card
    borderRadius: 15,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 15,
    elevation: 4, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
  },
  header: {
    alignItems: 'center',
    paddingTop: 30, 
    paddingBottom: 15,
    backgroundColor: '#f7f7f7', // Light background for header
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  avatar: {
    marginBottom: 10,
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  content: {
    paddingHorizontal: 5, // Reduced horizontal padding for list items
    paddingVertical: 10,
  },
  subheader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    paddingBottom: 5,
    paddingLeft: 16, // Align with List.Item default padding
  },
  listItemTitle: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
  },
  listItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    justifyContent: 'center',
    paddingBottom: 15,
  },
});

export default UserProfileModal; 