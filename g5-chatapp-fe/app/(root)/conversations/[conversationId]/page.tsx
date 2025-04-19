"use client";

import { Info, Loader2, Phone, Video } from "lucide-react";
import React, { use, useEffect, useState } from "react";
import Header from "./_components/Header";
import Body from "./_components/body/Body";
import ChatInput from "./_components/input/ChatInput";
import ConversationContainer from "@/components/common/conversation/ConversationContainer";
import ConversationInfo from "./_components/info/ConversationInfo";
import { useConversationStore } from "@/store/useConversationStore";
import { root } from "postcss";
import { useAuthStore } from "@/store/useAuthStore";
import { useCallStore } from "@/store/useCallStore";

type Props = {
  params: Promise<{
    conversationId: string;
  }>;
};

function ConversationPage({ params }: Props) {
  const { conversationId } = use(params);

  const { selectedConversation, getConversation } = useConversationStore();

  const { user } = useAuthStore();

  const { handleCall } = useCallStore();

  useEffect(() => {
    console.log("Conversation ID:", conversationId);
    if (conversationId) {
      getConversation(conversationId);
    }
  }, [conversationId]);

  const userSelected = selectedConversation?.members.find(
    (member) => member.user._id !== user?.id
  );

  const [removeFriendDialogOpen, setRemoveFriendDialogOpen] = useState(false);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [leaveGroupDialogOpen, setLeaveGroupDialogOpen] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video" | null>(null);

  const [isOpenRightBar, setIsOpenRightBar] = useState(false);

  return conversationId === undefined ? (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8" />
    </div>
  ) : conversationId === null ? (
    <p className="w-full h-full flex items-center justify-center">
      Select/start a conversation to get started!
    </p>
  ) : (
    <ConversationContainer>
      {/* <RemoveFriendDialog
        conversationId={conversationId}
        open={removeFriendDialogOpen}
        setOpen={setRemoveFriendDialogOpen}
      /> */}
      <div
        className={`flex flex-col justify-between ${
          isOpenRightBar ? "col-span-6" : "col-span-9"
        }`}
      >
        {selectedConversation?.isGroup ? (
          <Header
            isGroup={selectedConversation?.isGroup || false}
            name={selectedConversation?.name}
            imageUrl={selectedConversation?.profilePicture || ""}
            numMembers={selectedConversation?.members.length}
            options={[
              {
                label: "Voice call",
                icon: <Phone />,
                onClick: () => handleCall(conversationId),
              },
              {
                label: "Video call",
                icon: <Video />,
                onClick: () => setDeleteGroupDialogOpen(true),
              },
              {
                label: "Info",
                icon: <Info />,
                onClick: () => setIsOpenRightBar(!isOpenRightBar),
              },
            ]}
          />
        ) : (
          <Header
            isGroup={selectedConversation?.isGroup || false}
            userId={userSelected?.user._id || ""}
            firstName={userSelected?.user.firstName || ""}
            lastName={userSelected?.user.lastName || ""}
            imageUrl={userSelected?.user.avatar || ""}
            options={[
              {
                label: "Voice call",
                icon: <Phone />,
                onClick: () => handleCall(conversationId),
              },
              {
                label: "Video call",
                icon: <Video />,
                onClick: () => setDeleteGroupDialogOpen(true),
              },
              {
                label: "Info",
                icon: <Info />,
                onClick: () => setIsOpenRightBar(!isOpenRightBar),
              },
            ]}
          />
        )}

        <Body />
        <ChatInput />
      </div>
      {selectedConversation?.isGroup ? (
        <ConversationInfo
          isOpen={isOpenRightBar}
          setOpen={setIsOpenRightBar}
          conversationSelected={selectedConversation}
          isGroup={true}
        />
      ) : (
        <ConversationInfo
          isOpen={isOpenRightBar}
          setOpen={setIsOpenRightBar}
          userSelected={userSelected?.user || null}
          isGroup={false}
        />
      )}
    </ConversationContainer>
  );
}

export default ConversationPage;
