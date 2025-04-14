import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { styles } from '../styles/ChatDetailStyles';

const ChatOptions = ({ 
  visible, 
  onClose, 
  onCamera, 
  onGallery, 
  onLocation, 
  onDocument 
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.optionsBox}>
          <View style={styles.optionRow}>
            <TouchableOpacity style={styles.option} onPress={onCamera}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#0099ff",
                  borderRadius: 50,
                  padding: 10,
                  backgroundColor: "#0099ff",
                }}
              >
                <Ionicons name="camera-outline" size={32} color="#ffffff" />
              </View>
              <Text style={styles.optionText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#0099ff",
                  borderRadius: 50,
                  padding: 10,
                  backgroundColor: "#0099ff",
                }}
              >
                <Ionicons name="mic-outline" size={32} color="#ffffff" />
              </View>
              <Text style={styles.optionText}>Record</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#0099ff",
                  borderRadius: 50,
                  padding: 10,
                  backgroundColor: "#0099ff",
                }}
              >
                <Ionicons name="person-outline" size={32} color="#ffffff" />
              </View>
              <Text style={styles.optionText}>Contact</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.optionRow}>
            <TouchableOpacity style={styles.option} onPress={onGallery}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#0099ff",
                  borderRadius: 50,
                  padding: 10,
                  backgroundColor: "#0099ff",
                }}
              >
                <Ionicons name="image-outline" size={32} color="#ffffff" />
              </View>
              <Text style={styles.optionText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={onLocation}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#0099ff",
                  borderRadius: 50,
                  padding: 10,
                  backgroundColor: "#0099ff",
                }}
              >
                <Ionicons name="location-outline" size={32} color="#ffffff" />
              </View>
              <Text style={styles.optionText}>My Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={onDocument}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#0099ff",
                  borderRadius: 50,
                  padding: 10,
                  backgroundColor: "#0099ff",
                }}
              >
                <Ionicons name="document-outline" size={32} color="#ffffff" />
              </View>
              <Text style={styles.optionText}>Document</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ChatOptions; 