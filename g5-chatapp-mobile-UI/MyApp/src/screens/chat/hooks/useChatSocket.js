import { useRef, useEffect } from 'react';
import { io } from "socket.io-client";
import { API_URL } from "../../../config/constants";

export const useChatSocket = (conversation, userId, onNewMessage, setIsOnline) => {
  const socket = useRef(null);

  const setupSocket = () => {
    if (!conversation?._id) return;
    
    if (socket.current) {
      console.log("Socket already exists, disconnecting...");
      socket.current.disconnect();
    }

    console.log("Setting up new socket connection");
    socket.current = io(API_URL, {
      transports: ["websocket"],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  
    socket.current.on("connect", () => {
      console.log("Socket connected, joining conversation:", conversation._id);
      socket.current.emit("joinConversation", conversation._id);
    });
  
    socket.current.on("newMessage", (message) => {
      console.log("New message received via socket:", message);
      if (message?.conversation === conversation._id || message?.conversationId === conversation._id) {
        onNewMessage(message);
      }
    });

    socket.current.on("userOnline", (data) => {
      if (data.userId && data.userId !== userId) {
        setIsOnline(true);
      }
    });

    socket.current.on("userOffline", (data) => {
      if (data.userId && data.userId !== userId) {
        setIsOnline(false);
      }
    });

    socket.current.on("messageReceived", (messageId) => {
      console.log("Message received confirmation:", messageId);
    });
  
    socket.current.on("error", (error) => {
      console.error("Socket error:", error);
      setTimeout(() => {
        console.log("Attempting to reconnect after error...");
        setupSocket();
      }, 3000);
    });

    socket.current.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect" || reason === "io client disconnect") {
        return;
      }
      setTimeout(() => {
        console.log("Attempting to reconnect...");
        setupSocket();
      }, 3000);
    });

    socket.current.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
      if (conversation?._id) {
        socket.current.emit("joinConversation", conversation._id);
      }
    });

    const pingInterval = setInterval(() => {
      if (socket.current?.connected) {
        socket.current.emit("ping");
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  };

  useEffect(() => {
    if (!conversation?._id || !userId) return;

    console.log("Setting up socket for conversation:", conversation._id);
    setupSocket();

    return () => {
      if (socket.current) {
        console.log("Disconnecting socket");
        socket.current.disconnect();
      }
    };
  }, [userId, conversation?._id]);

  return socket;
}; 