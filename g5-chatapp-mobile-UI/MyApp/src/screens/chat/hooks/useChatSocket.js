import { useEffect, useCallback } from 'react';
import { socket } from '../../../config/socket';

export const useChatSocket = ({ conversation, userId, onNewMessage, setIsOnline }) => {
  useEffect(() => {
    if (!conversation?._id || !userId) {
      console.log('Missing required data:', { conversationId: conversation?._id, userId });
      return;
    }

    console.log('Setting up socket listeners for conversation:', conversation._id);

    // Ensure socket is connected
    if (!socket.connected) {
      console.log('Socket not connected, connecting...');
      socket.connect();
    }

    // Handle connection events
    const handleConnect = () => {
      console.log('Socket connected, joining room:', conversation._id);
      socket.emit('join', {
        userId: userId,
        conversationId: conversation._id
      });
    };

    const handleDisconnect = (reason) => {
      console.log('Socket disconnected:', reason);
      setIsOnline(false);
      // Attempt to reconnect
      setTimeout(() => {
        if (!socket.connected) {
          console.log('Attempting to reconnect...');
          socket.connect();
        }
      }, 1000);
    };

    // Listen for new messages
    const handleReceiveMessage = (data) => {
      console.log('Received message data in socket hook:', data);
      
      // Extract message from data
      const messageData = data?.message || data;
      
      // Validate message data
      if (!messageData || (!messageData.content && !messageData.file)) {
        console.log('Invalid message data received:', data);
        return;
      }

      // Ensure message has required fields
      const validMessage = {
        ...messageData,
        _id: messageData._id || `temp-${Date.now()}`,
        conversation: messageData.conversation || conversation._id,
        createdAt: messageData.createdAt || new Date().toISOString()
      };

      console.log('Processing message in socket hook:', validMessage);
      
      // Chỉ xử lý tin nhắn thuộc về conversation hiện tại
      if (validMessage.conversation === conversation._id) {
        onNewMessage(validMessage);
      } else {
        console.log('Message belongs to different conversation:', validMessage.conversation);
      }
    };

    // Listen for online status
    const handleOnlineStatus = (data) => {
      console.log('Online status update:', data);
      if (data?.userId && data.userId !== userId) {
        setIsOnline(!!data.isOnline);
      }
    };

    // Setup listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('newMessage', handleReceiveMessage);  // Lắng nghe event 'newMessage' từ server
    socket.on('userOnline', handleOnlineStatus);
    socket.on('userOffline', handleOnlineStatus);

    // Initial connection if socket is already connected
    if (socket.connected) {
      handleConnect();
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up socket listeners for conversation:', conversation._id);
      
      if (socket.connected) {
        // Leave room
        socket.emit('leave', {
          userId: userId,
          conversationId: conversation._id
        });
      }

      // Remove listeners
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('newMessage', handleReceiveMessage);
      socket.off('userOnline', handleOnlineStatus);
      socket.off('userOffline', handleOnlineStatus);
    };
  }, [conversation?._id, userId, onNewMessage, setIsOnline]);
}; 