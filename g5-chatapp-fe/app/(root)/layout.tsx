"use client";
import SidebarWrapper from "@/components/common/sidebar/SidebarWrapper";
import { useAuthStore } from "@/store/useAuthStore";
import { useContactStore } from "@/store/useContactStore";
import React, { useEffect } from "react";

type Props = React.PropsWithChildren<{}>;

const Layout = ({ children }: Props) => {
  const { subscribeContact, unsubscribeContact, subscribeCancelContact, unsubscribeCancelContact, subscribeRejectContact, unsubscribeRejectContact } = useContactStore();
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

      return () => {
        unsubscribeContact();
        unsubscribeCancelContact();
        unsubscribeRejectContact();
      };
    }
  }, [isAuthenticated, socket]);
  return <SidebarWrapper>{children}</SidebarWrapper>;
};

export default Layout;
