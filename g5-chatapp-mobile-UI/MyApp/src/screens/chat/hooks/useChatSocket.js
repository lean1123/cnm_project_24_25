import { useEffect, useCallback, useState } from 'react';
import { initSocket, getSocket } from '../../../config/socket';

export const useChatSocket = ({ conversation, userId, onNewMessage, setIsOnline }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!conversation?._id || !userId) {
      console.log('Missing required data:', { conversationId: conversation?._id, userId });
      return;
    }

    console.log('Setting up socket listeners for conversation:', conversation._id);

    // Initialize socket
    const setupSocket = async () => {
      try {
        // Initialize socket if not already initialized
        const socketInstance = await initSocket();
        if (!socketInstance) {
          console.error('Failed to initialize socket');
          return;
        }
        
        setSocket(socketInstance);
        
        // Ensure socket is connected
        if (!socketInstance.connected) {
          console.log('Socket not connected, connecting...');
          socketInstance.connect();
        }
        
        // Set up event listeners
        setupEventListeners(socketInstance);
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };
    
    // Try to get existing socket first
    try {
      const existingSocket = getSocket();
      if (existingSocket) {
        setSocket(existingSocket);
        setupEventListeners(existingSocket);
      } else {
        setupSocket();
      }
    } catch (error) {
      console.log('No existing socket, initializing new one');
      setupSocket();
    }
    
    function setupEventListeners(socketInstance) {

      // Handle connection events
      const handleConnect = () => {
        console.log('Socket connected, joining room:', conversation._id);
        socketInstance.emit('join', {
          userId: userId,
          conversationId: conversation._id
        });
      };

      const handleDisconnect = (reason) => {
        console.log('Socket disconnected:', reason);
        setIsOnline(false);
        // Attempt to reconnect
        setTimeout(() => {
          if (socketInstance && !socketInstance.connected) {
            console.log('Attempting to reconnect...');
            socketInstance.connect();
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
      socketInstance.on('connect', handleConnect);
      socketInstance.on('disconnect', handleDisconnect);
      socketInstance.on('newMessage', handleReceiveMessage);  // Lắng nghe event 'newMessage' từ server
      socketInstance.on('userOnline', handleOnlineStatus);
      socketInstance.on('userOffline', handleOnlineStatus);

      // Initial connection if socket is already connected
      if (socketInstance.connected) {
        handleConnect();
      }
    }

    // Cleanup function
    return () => {
      if (socket) {
        console.log('Cleaning up socket listeners for conversation:', conversation._id);
        
        if (socket.connected) {
          // Leave room
          socket.emit('leave', {
            userId: userId,
            conversationId: conversation._id
          });
        }

        // Remove listeners
        socket.off('connect');
        socket.off('disconnect');
        socket.off('newMessage');
        socket.off('userOnline');
        socket.off('userOffline');
      }
    };
  }, [conversation?._id, userId, onNewMessage, setIsOnline]);
};
