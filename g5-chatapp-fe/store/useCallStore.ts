import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { OngoingCall } from "@/types";

interface CallStoreState {
  isCall: boolean;
  conversationId: string | null;
  ongoingCall: OngoingCall | null;
  isCallActive: boolean;
  isCallAccepted: boolean;
  callType: string;
  callStatus: string;
  callDuration: number;
  handleCall: (conversationId: string) => void;
  handleAcceptCall: (conversationId: string) => void;
  handleRejectCall: (conversationId: string) => void;
  handleEndCall: (conversationId: string) => void;
  handleCancelCall: (conversationId: string) => void;
  subscribeCall: () => void;
  unsubscribeCall: () => void;
  subscribeAcceptCall: () => void;
  unsubscribeAcceptCall: () => void;
  subscribeRejectCall: () => void;
  unsubscribeRejectCall: () => void;
  subscribeEndCall: () => void;
  unsubscribeEndCall: () => void;
  subscribeCancelCall: () => void;
  unsubscribeCancelCall: () => void;
  subscribeNewUserStartCall: () => void;
  unsubscribeNewUserStartCall: () => void;
}

export const useCallStore = create<CallStoreState>((set, get) => ({
  call: null,
  conversationId: null,
  isCallActive: false,
  isCallAccepted: false,
  callType: "",
  callStatus: "",
  callDuration: 0,
  ongoingCall: null,
  isCall: false,
  handleCall: (conversationId: string) => {
    set({ isCallActive: true });
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("call", {
        conversationId,
        sender: useAuthStore.getState().user,
      });
      set({
        isCallActive: true,
        isCallAccepted: true,
        conversationId,
      });
      socket.emit("joinCall", {
        conversationId,
        userId: useAuthStore.getState().user?._id,
      });
    }
  },
  handleAcceptCall: (conversationId: string) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("joinCall", {
        conversationId,
        userId: useAuthStore.getState().user?._id,
      });
      socket.emit("acceptCall", {
        conversationId: "67fc19e48255723cbd575594",
        sender: useAuthStore.getState().user?._id,
      });
      set({
        isCallAccepted: true,
        isCallActive: true,
        ongoingCall: null,
        conversationId,
      });
    }
  },
  handleRejectCall: (conversationId: string) => {
    set({  isCallAccepted: false, isCallActive: false });
  },
  handleEndCall: (conversationId: string) => {
    set({  isCallActive: false, isCallAccepted: false });
  },
  handleCancelCall: (conversationId: string) => {
    set({  isCallActive: false });
  },
  subscribeCall: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.on("goingCall", (data) => {
        if (data.sender._id !== useAuthStore.getState().user?._id) {
          set({
            ongoingCall: {
              sender: data.sender,
              isRinging: true,
            },
          });
        }
      });
    }
  },
  unsubscribeCall: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("call");
    }
  },
  subscribeAcceptCall: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.on("acceptCall", (data) => {
        set({  isCallAccepted: true });
      });
    }
  },
  unsubscribeAcceptCall: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("acceptCall");
    }
  },
  subscribeRejectCall: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.on("rejectCall", (data) => {
        set({  isCallAccepted: false });
      });
    }
  },
  unsubscribeRejectCall: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("rejectCall");
    }
  },
  subscribeEndCall: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.on("endCall", (data) => {
        set({  isCallActive: false });
      });
    }
  },
  unsubscribeEndCall: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("endCall");
    }
  },
  subscribeCancelCall: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.on("cancelCall", (data) => {
        set({  isCallActive: false });
      });
    }
  },
  unsubscribeCancelCall: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("cancelCall");
    }
  },
  subscribeNewUserStartCall: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.on("newUserStartCall", (data) => {
        set({ ongoingCall: data });
      });
    }
  },
  unsubscribeNewUserStartCall: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newUserStartCall");
    }
  },
}));
