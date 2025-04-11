import React, { useEffect } from "react";
import Message from "./Message";
import { useConversationStore } from "@/store/useConversationStore";
import { useAuthStore } from "@/store/useAuthStore";

type Props = {};

const Body = (props: Props) => {
  const mockMessages = [
    {
      message: {
        senderId: "user_1",
        content: "Xin chào!",
        createdAt: "2025-02-19T08:30:00Z",
        type: "text",
      },
      senderImage: "https://example.com/avatar1.jpg",
      senderName: "John Doe",
      isCurrentUser: false,
    },
    {
      message: {
        senderId: "user_2",
        content: "Chào bạn! Bạn khỏe không?",
        createdAt: "2025-02-19T08:32:00Z",
        type: "text",
      },
      senderImage: "https://example.com/avatar2.jpg",
      senderName: "Jane Smith",
      isCurrentUser: true,
    },
    {
      message: {
        senderId: "user_2",
        content: "Hôm nay bạn có rảnh không?",
        createdAt: "2025-02-19T08:33:00Z",
        type: "text",
      },
      senderImage: "https://example.com/avatar2.jpg",
      senderName: "Jane Smith",
      isCurrentUser: true,
    },
    {
      message: {
        senderId: "user_1",
        content: "Ừ, mình rảnh. Có gì không?",
        createdAt: "2025-02-19T08:35:00Z",
        type: "text",
      },
      senderImage: "https://example.com/avatar1.jpg",
      senderName: "John Doe",
      isCurrentUser: false,
    },
  ];
  const {
    sendMessage,
    messages,
    selectedConversation,
    fetchMessages,
    subscribeToNewMessages,
    unsubscribeFromNewMessages,
  } = useConversationStore();
  const { user } = useAuthStore();
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation, fetchMessages]);

  useEffect(() => {
    subscribeToNewMessages();
    return () => {
      unsubscribeFromNewMessages();
    };
  }, [subscribeToNewMessages, unsubscribeFromNewMessages]);

  return (
    <div className="h-[calc(100vh-335px)] w-full flex flex-col">
      <div className="flex-1 w-full flex overflow-y-scroll flex-col-reverse gap-2 p-3 no-scrollbar">
        {messages &&
          messages?.map((message, index) => {
            const lastByUser =
              messages[index - 1]?.sender.userId === message.sender.userId;
            const isCurrentUser = message.sender.userId === user?.id;
            return (
              <Message
                key={index}
                fromCurrentUser={isCurrentUser}
                senderImage={message.sender.fullName || ""}
                file={message?.files || []}
                senderName={message.sender.fullName || ""}
                lastByUser={lastByUser}
                content={message.content}
                createdAt={message.createdAt}
                type={message.type}
                isTemp={message.isTemp || false}
                isError={message.isError || false}
              />
            );
          })}
      </div>
    </div>
  );
};

export default Body;
