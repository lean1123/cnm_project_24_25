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
      label: "Hình ảnh",
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
      label: "Vị trí",
      onPress: onLocation,
      color: "#FF9F1C"
    },
    {
      icon: "document-outline",
      label: "Tài liệu",
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
            <View style={styles.grabber} />
            <View style={styles.header}>
              <Text style={styles.headerText}>Tùy chọn chức năng</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={26} color="#0099ff" />
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
                    <Ionicons name={option.icon} size={30} color="#fff" />
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  optionsBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingTop: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  grabber: {
    width: 40,
    height: 5,
    backgroundColor: '#e4e4e4',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e4',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'left',
    marginLeft: '10%',
  },
  closeButton: {
    padding: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  option: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});

export default ChatOptions;