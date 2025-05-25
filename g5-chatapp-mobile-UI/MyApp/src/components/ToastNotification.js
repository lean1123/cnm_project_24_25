import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ToastNotification = ({ 
  visible, 
  message, 
  title, 
  type = 'info', 
  onClose, 
  autoClose = true,
  duration = 3000,
  onPress,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeout = useRef(null);

  useEffect(() => {
    if (visible) {
      showNotification();
      
      if (autoClose) {
        timeout.current = setTimeout(() => {
          hideNotification();
        }, duration);
      }
    } else {
      hideNotification();
    }

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [visible]);

  const showNotification = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) {
        onClose();
      }
    });
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          icon: 'checkmark-circle',
          color: '#fff',
        };
      case 'error':
        return {
          backgroundColor: '#F44336',
          icon: 'close-circle',
          color: '#fff',
        };
      case 'warning':
        return {
          backgroundColor: '#FF9800',
          icon: 'warning',
          color: '#fff',
        };
      case 'friend-request':
        return {
          backgroundColor: '#135CAF',
          icon: 'person-add',
          color: '#fff',
        };
      case 'friend-accept':
        return {
          backgroundColor: '#4CAF50',
          icon: 'people',
          color: '#fff',
        };
      default:
        return {
          backgroundColor: '#2196F3',
          icon: 'information-circle',
          color: '#fff',
        };
    }
  };

  const typeStyles = getTypeStyles();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: typeStyles.backgroundColor,
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.content}
        activeOpacity={0.8}
        onPress={() => {
          if (onPress) {
            onPress();
          }
          if (autoClose) {
            hideNotification();
          }
        }}
      >
        <Ionicons name={typeStyles.icon} size={24} color={typeStyles.color} />
        <View style={styles.textContainer}>
          {title && <Text style={[styles.title, { color: typeStyles.color }]}>{title}</Text>}
          <Text style={[styles.message, { color: typeStyles.color }]}>{message}</Text>
        </View>
        <TouchableOpacity onPress={hideNotification} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={typeStyles.color} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginHorizontal: 8,
    marginTop: 40,
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
  },
  closeButton: {
    padding: 5,
  },
});

export default ToastNotification; 