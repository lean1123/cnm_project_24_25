import { create } from "zustand";
import { getSocket } from "../services/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useCallStore = create((set, get) => ({
  call: null,
  callConversationId: null,
  isCallActive: false,
  isCallWaiting: false,
  isCallAccepted: false,
  isCallGroup: false,
  callType: "",
  callStatus: "",
  callDuration: 0,
  ongoingCall: null,
  isCall: false,
  handleCall: (conversationId, isGroup) => {
    set({ isCallActive: true });
    const socket = getSocket();
    if (socket) {
      socket.emit("call", {
        conversationId,
        sender: AsyncStorage.getItem("userId"),
        type: "video",
        isGroup: isGroup,
      });
      set({
        isCallActive: true,
        isCallWaiting: true,
        isCallAccepted: false,
        isCallGroup: isGroup,
        callType: "video",
        callConversationId: conversationId,
      });
    }
  },
  handleAcceptCall: (conversationId, isGroup) => {
    const socket = getSocket();
    if (socket) {
      socket.emit("acceptCall", {
        conversationId,
        userId: AsyncStorage.getItem("userId"),
        isGroup: isGroup,
      });
      set({
        isCallAccepted: true,
        isCallActive: true,
        ongoingCall: null,
        isCallWaiting: false,
        isCallGroup: isGroup,
        callConversationId: conversationId,
      });
    }
  },
  handleRejectCall: (conversationId, isGroup) => {
    const socket = getSocket();
    if (socket) {
      socket.emit("rejectCall", {
        conversationId: conversationId,
        userId: AsyncStorage.getItem("userId"),
        isGroup: isGroup,
      });
    }
    set({
      callConversationId: conversationId,
      isCallAccepted: false,
      isCallActive: false,
      ongoingCall: null,
    });
  },
  handleEndCall: (conversationId, isGroup) => {
    set({ isCallActive: false, isCallAccepted: false });
  },
  handleCancelCall: (conversationId, isGroup) => {
    set({
      isCallActive: false,
      isCallAccepted: false,
      isCallWaiting: false,
      callConversationId: null,
    });
    const socket = getSocket();
    if (socket) {
      socket.emit("cancelCall", {
        conversationId: conversationId,
        userId: AsyncStorage.getItem("userId"),
        isGroup: isGroup,
      });
    }
  },
  setupSocketListeners: (userId) => {
    const socket = getSocket();
    if (socket) {
      socket.on("goingCall", (data) => {
        if (data.sender._id !== useAuthStore.getState().user?._id) {
          set({
            ongoingCall: {
              sender: data.sender,
              isRinging: true,
              type: data.type,
            },
          });
        }
        set({
          callConversationId: data.conversationId,
          isCallGroup: data.isGroup,
        });
      });
      socket.on("acceptCall", (data) => {
        if (get().isCallWaiting) {
          set({
            isCallAccepted: true,
            isCallActive: true,
            isCallWaiting: false,
          });
        }
      });
      socket.on("rejectCall", (data) => {
        if (!get().isCallWaiting || !get().isCallGroup) {
          set({ isCallAccepted: false, isCallWaiting: false });
        }
      });
      socket.on("endCall", (data) => {
        set({ isCallActive: false });
      });
      socket.on("cancelCall", (data) => {
        set({ isCallActive: false, ongoingCall: null });
      });
      socket.on("newUserStartCall", (data) => {
        set({ ongoingCall: data });
      });
    }
  },
  cleanupSocketListeners: () => {
    const socket = getSocket();
    if (socket) {
      socket.off("goingCall");
      socket.off("acceptCall");
      socket.off("rejectCall");
      socket.off("endCall");
      socket.off("cancelCall");
      socket.off("newUserStartCall");
    }
  },
}));
