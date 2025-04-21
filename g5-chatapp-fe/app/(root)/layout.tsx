"use client";
import SidebarWrapper from "@/components/common/sidebar/SidebarWrapper";
import { useAuthStore } from "@/store/useAuthStore";
import { useCallStore } from "@/store/useCallStore";
import { useContactStore } from "@/store/useContactStore";
import { useMessageStore } from "@/store/useMessageStore";
import React, { useEffect, useState } from "react";

type Props = React.PropsWithChildren<{}>;

const Layout = ({ children }: Props) => {
  const {
    subscribeContact,
    unsubscribeContact,
    subscribeCancelContact,
    unsubscribeCancelContact,
    subscribeRejectContact,
    unsubscribeRejectContact,
  } = useContactStore();
  const {
    subscribeCall,
    unsubscribeCall,
    subscribeAcceptCall,
    unsubscribeAcceptCall,
    subscribeRejectCall,
    unsubscribeRejectCall,
    subscribeEndCall,
    unsubscribeEndCall,
    subscribeCancelCall,
    unsubscribeCancelCall,
  } = useCallStore();
  const {
    subscribeToNewMessages,
    unsubscribeFromNewMessages,
    subscribeToDeleteMessage,
    unsubscribeFromDeleteMessage,
    subscribeToRevokeMessage,
    unsubscribeFromRevokeMessage,
    subscribeToTyping,
    unsubscribeFromTyping,
    subscribeToReaction,
    unsubscribeFromReaction,
    subscribeToUnReaction,
    unsubscribeFromUnReaction,
  } = useMessageStore();
  const { subscribeActiveUsers, unsubscribeActiveUsers } = useAuthStore();
  const { isAuthenticated, connectSocket, socket } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && socket) {
      subscribeContact();
      subscribeCancelContact();
      subscribeRejectContact();
      subscribeCall();
      subscribeActiveUsers();
      subscribeToNewMessages();
      subscribeToDeleteMessage();
      subscribeToRevokeMessage();
      subscribeToTyping();
      subscribeToReaction();
      subscribeToUnReaction();
      return () => {
        unsubscribeContact();
        unsubscribeCancelContact();
        unsubscribeRejectContact();
        unsubscribeCall();
        unsubscribeActiveUsers();
        unsubscribeFromNewMessages();
        unsubscribeFromDeleteMessage();
        unsubscribeFromRevokeMessage();
        unsubscribeFromTyping();
        unsubscribeFromReaction();
        unsubscribeFromUnReaction();
      };
    }
  }, [isAuthenticated, socket]);
  return <SidebarWrapper>{children}</SidebarWrapper>;
};

export default Layout;
