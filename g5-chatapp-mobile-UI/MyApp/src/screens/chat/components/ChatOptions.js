import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const ChatOptions = ({ 
  visible, 
  onClose, 
  onCamera, 
  onGallery, 
  onLocation, 
  onDocument,
  onVideo,
  onAudio
}) => {
  const options = [
    {
      icon: "camera-outline",
      label: "Camera",
      onPress: onCamera,
      color: "#FF6B6B"
    },
    {
      icon: "image-outline",
      label: "Gallery",
      onPress: onGallery,
      color: "#4ECDC4"
    },
    {
      icon: "videocam-outline",
      label: "Video",
      onPress: onVideo,
      color: "#45B7D1"
    },
    {
      icon: "mic-outline",
      label: "Audio",
      onPress: onAudio,
      color: "#96CEB4"
    },
    {
      icon: "location-outline",
      label: "Location",
      onPress: onLocation,
      color: "#FF9F1C"
    },
    {
      icon: "document-outline",
      label: "Document",
      onPress: onDocument,
      color: "#7868E6"
    }
  ];

  return (
    <Modal 
      visible={visible} 
      transparent={true} 
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.optionsBox}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Share Content</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsGrid}>
              {options.map((option, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.option}
                  onPress={option.onPress}
                >
                  <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                    <Ionicons name={option.icon} size={28} color="#ffffff" />
                  </View>
                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  optionsBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  option: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 25,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  }
});

export default ChatOptions; 