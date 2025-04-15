"use client";
import SidebarWrapper from "@/components/common/sidebar/SidebarWrapper";
import { useAuthStore } from "@/store/useAuthStore";
import { useCallStore } from "@/store/useCallStore";
import { useContactStore } from "@/store/useContactStore";
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

      return () => {
        unsubscribeContact();
        unsubscribeCancelContact();
        unsubscribeRejectContact();
        unsubscribeCall();
      };
    }
  }, [isAuthenticated, socket]);
  return <SidebarWrapper>{children}</SidebarWrapper>;
};

export default Layout;
