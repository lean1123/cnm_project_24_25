import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from './useAuthStore';
import { 
  getSocket, 
  emitCall, 
  emitAcceptCall, 
  emitRejectCall, 
  emitEndCall, 
  emitCancelCall 
} from '../services/socket';
import { navigate } from '../navigation/Navigator';

const useCallStore = create(
  persist(
    (set, get) => ({
      isCallActive: false,
      callConversationId: null,
      ongoingCall: null,
      isCallWaiting: false,
      isCallAccepted: false,
      isCallGroup: false,
      callType: "",
      callStatus: "",
      callDuration: 0,

      // Call actions
      handleCall: (conversationId, isGroup) => {
        const socket = getSocket();
        const user = useAuthStore.getState().user;
        
        if (socket && user) {
          // Emit call event to server
          emitCall(user, conversationId, "video", isGroup);
          
          set({
            isCallActive: true,
            isCallWaiting: true,
            isCallAccepted: false,
            isCallGroup: isGroup,
            callType: "video",
            callConversationId: conversationId,
          });
          
          // Navigate to call screen
          navigate('TestCall', {
            roomID: conversationId,
            userID: user._id,
            userName: `${user.firstName} ${user.lastName}`
          });
        }
      },

      handleAcceptCall: (conversationId, isGroup) => {
        const user = useAuthStore.getState().user;
        
        if (user) {
          emitAcceptCall(user._id, conversationId, isGroup);
          
          set({
            isCallAccepted: true,
            isCallActive: true,
            ongoingCall: null,
            isCallWaiting: false,
            isCallGroup: isGroup,
            callConversationId: conversationId,
          });
          
          // Navigate to call screen
          navigate('TestCall', {
            roomID: conversationId,
            userID: user._id,
            userName: `${user.firstName} ${user.lastName}`
          });
        }
      },

      handleRejectCall: (conversationId, isGroup) => {
        const user = useAuthStore.getState().user;
        
        if (user) {
          emitRejectCall(user._id, conversationId, isGroup);
          
          set({
            callConversationId: null,
            isCallAccepted: false,
            isCallActive: false,
            ongoingCall: null,
          });
        }
      },

      handleEndCall: (conversationId, isGroup) => {
        const user = useAuthStore.getState().user;
        
        if (user) {
          emitEndCall(user._id, conversationId);
          
          set({
            isCallActive: false,
            isCallAccepted: false,
            callConversationId: null,
          });
        }
      },

      handleCancelCall: (conversationId, isGroup) => {
        const user = useAuthStore.getState().user;
        
        if (user) {
          emitCancelCall(user._id, conversationId, isGroup);
          
          set({
            isCallActive: false,
            isCallAccepted: false,
            isCallWaiting: false,
            callConversationId: null,
          });
        }
      },

      // Socket event handlers
      setIncomingCall: (callData) => {
        if (callData.sender._id !== useAuthStore.getState().user?._id) {
          set({
            ongoingCall: {
              sender: callData.sender,
              isRinging: true,
              type: callData.type,
            },
            callConversationId: callData.conversationId,
            isCallGroup: callData.isGroup,
          });
        }
      },
      
      setCallAccepted: () => {
        if (get().isCallWaiting) {
          set({
            isCallAccepted: true,
            isCallActive: true,
            isCallWaiting: false,
          });
        }
      },
      
      setCallRejected: () => {
        set({
          isCallActive: false,
          isCallWaiting: false,
          ongoingCall: null,
        });
      },
      
      setCallEnded: () => {
        set({
          isCallActive: false,
          isCallAccepted: false,
          callConversationId: null,
        });
      },
      
      setCallCancelled: () => {
        set({
          isCallActive: false,
          ongoingCall: null,
          callConversationId: null,
        });
      },
      
      resetCallState: () => {
        set({
          isCallActive: false,
          callConversationId: null,
          ongoingCall: null,
          isCallWaiting: false,
          isCallAccepted: false,
          isCallGroup: false,
          callType: "",
          callStatus: "",
          callDuration: 0,
        });
      },
    }),
    {
      name: 'call-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these values
        callType: state.callType,
      }),
    }
  )
);

export default useCallStore; 