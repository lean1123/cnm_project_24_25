import SidebarWrapper from "@/components/common/sidebar/SidebarWrapper";
import ContactPage from "@/components/contacts/ContactPage";
import ConversationPage from "@/components/coversations/ConversationPage";
import ContactsLayout from "@/components/layout/ContactsLayout";
import ConversationsLayout from "@/components/layout/CoversationsLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { useCallStore } from "@/store/useCallStore";
import { useContactStore } from "@/store/useContactStore";
import { useConversationStore } from "@/store/useConversationStore";
import { useMessageStore } from "@/store/useMessageStore";
import React, { useEffect } from "react";

type Props = {};

const HomePage = (props: Props) => {
  const { selectedHomePage } = useAuthStore();
  const [showConversations, setShowConversations] = React.useState(false);
  const [showContacts, setShowContacts] = React.useState(false);

  useEffect(() => {
    if (selectedHomePage === "conversations") {
      setShowConversations(true);
      setShowContacts(false);
    } else if (selectedHomePage === "contacts") {
      setShowConversations(false);
      setShowContacts(true);
    }
  }, [selectedHomePage]);

  const {
    subscribeNewGroup,
    unsubscribeNewGroup,
    subscribeUpdateGroup,
    unsubscribeUpdateGroup,
  } = useConversationStore();
  const {
    subscribeContact,
    unsubscribeContact,
    subscribeCancelContact,
    unsubscribeCancelContact,
    subscribeRejectContact,
    unsubscribeRejectContact,
    subscribeAcceptContact,
    unsubscribeAcceptContact,
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
      subscribeNewGroup();
      subscribeAcceptCall();
      subscribeRejectCall();
      subscribeEndCall();
      subscribeCancelCall();
      subscribeAcceptContact();
      subscribeUpdateGroup();
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
        unsubscribeNewGroup();
        unsubscribeAcceptCall();
        unsubscribeRejectCall();
        unsubscribeEndCall();
        unsubscribeCancelCall();
        unsubscribeAcceptContact();
        unsubscribeUpdateGroup();
      };
    }
  }, [isAuthenticated, socket]);
  return (
    <SidebarWrapper>
      {/* <div className="flex flex-col h-full w-full">
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-2xl font-bold">Welcome to the Home Page</h1>
        </div>
      </div> */}

      {showConversations && (
        <ConversationsLayout>
          <ConversationPage />
        </ConversationsLayout>
      )}
      {showContacts && (
        <ContactsLayout>
          <ContactPage />
        </ContactsLayout>
      )}
    </SidebarWrapper>
  );
};

export default HomePage;
