import { useAuthStore } from "@/store/useAuthStore";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    const { user, setActiveUsers } = useAuthStore.getState();
    socket = io(import.meta.env.VITE_BASE_API_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
      if (user?.id) {
        socket?.emit("login", { userId: user.id });
      }
      socket?.on("activeUsers", (data) => {
        console.log("Active users:", data.activeUsers);
        setActiveUsers(data.activeUsers);
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
