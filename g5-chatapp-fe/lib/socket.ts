import { useAuthStore } from "@/store/useAuthStore";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
    const { user } = useAuthStore.getState();
  if (!socket) {
    socket = io("http://localhost:3000", {
      autoConnect: true,
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
      socket?.emit("join", {
        userId: user?.id || "userId",
        conversationId: "67f78d703650537962c40c7a",
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket?.id);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};