import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { View } from 'react-native';
import ToastNotification from './ToastNotification';

// Create a context for the notification system
const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const idCounter = useRef(0);

  // Remove a notification by id
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Add a new notification
  const addNotification = (notification) => {
    const id = idCounter.current++;
    
    // Add the notification to the queue
    setNotifications(prev => [
      ...prev, 
      { 
        ...notification, 
        id,
        visible: true,
        onClose: () => removeNotification(id)
      }
    ]);

    // Return the id so it can be used to programmatically close the notification
    return id;
  };

  // Helper methods for different notification types
  const showInfo = (message, title, options = {}) => {
    return addNotification({ message, title, type: 'info', ...options });
  };

  const showSuccess = (message, title, options = {}) => {
    return addNotification({ message, title, type: 'success', ...options });
  };

  const showError = (message, title, options = {}) => {
    return addNotification({ message, title, type: 'error', ...options });
  };

  const showWarning = (message, title, options = {}) => {
    return addNotification({ message, title, type: 'warning', ...options });
  };

  const showFriendRequest = (message, title, options = {}) => {
    return addNotification({ 
      message, 
      title, 
      type: 'friend-request',
      autoClose: true,
      duration: 3000,
      ...options 
    });
  };

  const showFriendAccept = (message, title, options = {}) => {
    return addNotification({ message, title, type: 'friend-accept', ...options });
  };

  // Close a notification programmatically
  const closeNotification = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, visible: false } 
          : notification
      )
    );
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Notification context value
  const value = {
    showInfo,
    showSuccess,
    showError,
    showWarning,
    showFriendRequest,
    showFriendAccept,
    closeNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999 }}>
        {notifications.map((notification) => (
          <ToastNotification
            key={notification.id}
            {...notification}
          />
        ))}
      </View>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider; 