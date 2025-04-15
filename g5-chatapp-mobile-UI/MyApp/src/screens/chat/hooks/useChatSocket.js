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

    const setupSocket = async () => {
      try {
        const socketInstance = await initSocket();
        if (!socketInstance) {
          console.error('Failed to initialize socket');
          return;
        }
        
        setSocket(socketInstance);
        
        if (!socketInstance.connected) {
          console.log('Socket not connected, connecting...');
          socketInstance.connect();
        }
        
        setupEventListeners(socketInstance);
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };
    
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

        setTimeout(() => {
          if (socketInstance && !socketInstance.connected) {
            console.log('Attempting to reconnect...');
            socketInstance.connect();
          }
        }, 1000);
      };

      const handleReceiveMessage = (data) => {
        console.log('Received message data in socket hook:', data);
        
        const messageData = data?.message || data;
        
        if (!messageData || (!messageData.content && !messageData.file)) {
          console.log('Invalid message data received:', data);
          return;
        }

        const validMessage = {
          ...messageData,
          _id: messageData._id || `temp-${Date.now()}`,
          conversation: messageData.conversation || conversation._id,
          createdAt: messageData.createdAt || new Date().toISOString()
        };

        console.log('Processing message in socket hook:', validMessage);
        
        if (validMessage.conversation === conversation._id) {
          onNewMessage(validMessage);
        } else {
          console.log('Message belongs to different conversation:', validMessage.conversation);
        }
      };

      const handleOnlineStatus = (data) => {
        console.log('Online status update:', data);
        if (data?.userId && data.userId !== userId) {
          setIsOnline(!!data.isOnline);
        }
      };

      socketInstance.on('connect', handleConnect);
      socketInstance.on('disconnect', handleDisconnect);
      socketInstance.on('newMessage', handleReceiveMessage); 
      socketInstance.on('userOnline', handleOnlineStatus);
      socketInstance.on('userOffline', handleOnlineStatus);

      if (socketInstance.connected) {
        handleConnect();
      }
    }

    return () => {
      if (socket) {
        console.log('Cleaning up socket listeners for conversation:', conversation._id);
        
        if (socket.connected) {

          socket.emit('leave', {
            userId: userId,
            conversationId: conversation._id
          });
        }

        socket.off('connect');
        socket.off('disconnect');
        socket.off('newMessage');
        socket.off('userOnline');
        socket.off('userOffline');
      }
    };
  }, [conversation?._id, userId, onNewMessage, setIsOnline]);
};
