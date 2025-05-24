import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import type { OngoingCall } from "@/types";

interface CallStoreState {
  isCall: boolean;
  callConversationId: string | null;
  ongoingCall: OngoingCall | null;
  isCallActive: boolean;
  isCallWaiting: boolean;
  isCallAccepted: boolean;
  isCallGroup: boolean;
  callType: string;
  callStatus: string;
  callDuration: number;
  handleCall: (conversationId: string, isGroup: boolean) => void;
  handleAcceptCall: (callConversationId: string, isGroup: boolean) => void;
  handleRejectCall: (conversationId: string, isGroup: boolean) => void;
  handleEndCall: (conversationId: string, isGroup: boolean) => void;
  handleCancelCall: (conversationId: string, isGroup: boolean) => void;
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
  handleCall: (conversationId: string, isGroup: boolean) => {
    set({ isCallActive: true });
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("call", {
        conversationId,
        sender: useAuthStore.getState().user,
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
  handleAcceptCall: (conversationId: string, isGroup: boolean) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("acceptCall", {
        conversationId,
        userId: useAuthStore.getState().user?._id,
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
  handleRejectCall: (conversationId: string, isGroup: boolean) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("rejectCall", {
        conversationId: conversationId,
        userId: useAuthStore.getState().user?._id,
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
  handleEndCall: (conversationId: string, isGroup: boolean) => {
    set({ isCallActive: false, isCallAccepted: false });
  },
  handleCancelCall: (conversationId: string, isGroup: boolean) => {
    set({
      isCallActive: false,
      isCallAccepted: false,
      isCallWaiting: false,
      callConversationId: null,
    });
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("cancelCall", {
        conversationId: conversationId,
        userId: useAuthStore.getState().user?._id,
        isGroup: isGroup,
      });
    }
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
              type: data.type,
            },
          });
        }
        set({
          callConversationId: data.conversationId,
          isCallGroup: data.isGroup,
        });
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
        if (get().isCallWaiting) {
          set({
            isCallAccepted: true,
            isCallActive: true,
            isCallWaiting: false,
          });
        }
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
        if (!get().isCallWaiting || !get().isCallGroup) {
          // set({
          //   isCallActive: false,
          //   isCallWaiting: true,
          //   ongoingCall: null,
          // });
          set({ isCallAccepted: false, isCallWaiting: false });
        }
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
        set({ isCallActive: false });
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
        set({ isCallActive: false, ongoingCall: null });
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
