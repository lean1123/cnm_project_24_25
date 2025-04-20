import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { OngoingCall } from "@/types";

interface CallStoreState {
  call: any;
  isCall: boolean;
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
  subscribeSdp: () => void;
  unsubscribeSdp: () => void;
  subscribeIceCandidate: () => void;
  unsubscribeIceCandidate: () => void;
}

export const useCallStore = create<CallStoreState>((set, get) => ({
  call: null,
  isCallActive: false,
  isCallAccepted: false,
  callType: "",
  callStatus: "",
  callDuration: 0,
  ongoingCall: null,
  isCall: false,
  handleCall: (conversationId: string) => {
    set({ call: conversationId, isCallActive: true });
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("call", {
        conversationId,
        sender: useAuthStore.getState().user,
      });
      set({
        isCallActive: true,
        isCallAccepted: true,
      });
      socket.emit("joinCall", {
        conversationId,
        userId: useAuthStore.getState().user?._id,
      });
    }
  },
  handleAcceptCall: (conversationId: string) => {
    set({
      call: conversationId,
      isCallAccepted: true,
      isCallActive: true,
      ongoingCall: null,
    });
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
    }
  },
  handleRejectCall: (conversationId: string) => {
    set({ call: conversationId, isCallAccepted: false });
  },
  handleEndCall: (conversationId: string) => {
    set({ call: conversationId, isCallActive: false, isCallAccepted: false });
  },
  handleCancelCall: (conversationId: string) => {
    set({ call: conversationId, isCallActive: false });
  },
  subscribeCall: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.on("goingCall", (data) => {
        set({ call: data });
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
        set({ call: data, isCallAccepted: true });
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
        set({ call: data, isCallAccepted: false });
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
        set({ call: data, isCallActive: false });
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
        set({ call: data, isCallActive: false });
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
  subscribeSdp: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.on("sdp", (data) => {
        set({ call: data });
      });
    }
  },
  unsubscribeSdp: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("sdp");
    }
  },
  subscribeIceCandidate: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.on("iceCandidate", (data) => {
        set({ call: data });
      });
    }
  },
  unsubscribeIceCandidate: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("iceCandidate");
    }
  },
}));
