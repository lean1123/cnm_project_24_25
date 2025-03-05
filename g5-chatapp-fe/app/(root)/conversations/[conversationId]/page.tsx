"use client";

import { Info, Loader2, Phone, Video } from "lucide-react";
import React, { use, useEffect, useState } from "react";
import Header from "./_components/Header";
import Body from "./_components/body/Body";
import ChatInput from "./_components/input/ChatInput";
import ConversationContainer from "@/components/common/conversation/ConversationContainer";
import ConversationInfo from "./_components/info/ConversationInfo";

type Props = {
  params: Promise<{
    conversationId: string;
  }>;
};

function ConversationPage({ params }: Props) {
  const header = {
    name: "John Doe",
    imageUrl: "https://randomuser.me/api/port.jpg",
  };
  const conversation = {
    id: "1a2b3c",
    senderId: "4d5e6f",
    content: "Hello, how are you?",
    createdAt: "2021-12-31T23:59:59Z",
    isGroup: false,
  };

  const { conversationId } = use(params);

  useEffect(() => {
    console.log("Conversation ID:", conversationId);
  }, [conversationId]);

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
        className={`flex flex-col ${
          isOpenRightBar ? "col-span-6" : "col-span-9"
        }`}
      >
        <Header
          name={header.name}
          imageUrl={header.imageUrl}
          options={[
            {
              label: "Voice call",
              icon: <Phone />,
              onClick: () => setLeaveGroupDialogOpen(true),
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
        <Body />
        <ChatInput />
      </div>
      <ConversationInfo isOpen={isOpenRightBar} setOpen={setIsOpenRightBar} />
    </ConversationContainer>
  );
}

export default ConversationPage;
