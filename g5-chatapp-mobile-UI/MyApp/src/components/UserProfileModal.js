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
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Làm nền tối mờ
    padding: 0,
    margin: 0,
    justifyContent: 'center',
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: '#eee',
    borderRadius: 20,
    padding: 6,
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#f0f4f8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  avatar: {
    marginBottom: 12,
    borderColor: '#007AFF',
    borderWidth: 3,
    backgroundColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1c1c1e',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  subheader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  listItemTitle: {
    fontSize: 16,
    color: '#1c1c1e',
    fontWeight: '500',
  },
  listItemDescription: {
    fontSize: 14,
    color: '#555',
  },
});


export default UserProfileModal; 