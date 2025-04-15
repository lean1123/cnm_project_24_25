import React, { useEffect } from "react";
import Message from "./Message";
import { useConversationStore } from "@/store/useConversationStore";
import { useAuthStore } from "@/store/useAuthStore";
import { sub } from "date-fns";

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
    subscribeToDeleteMessage,
    unsubscribeFromDeleteMessage,
    subscribeToRevokeMessage,
    unsubscribeFromRevokeMessage,
    typing,
    isTyping,
    subscribeToTyping,
    unsubscribeFromTyping,
  } = useConversationStore();
  const { user } = useAuthStore();
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation, fetchMessages]);

  useEffect(() => {
    subscribeToNewMessages();
    subscribeToDeleteMessage();
    subscribeToRevokeMessage();
    subscribeToTyping();
    return () => {
      unsubscribeFromNewMessages();
      unsubscribeFromDeleteMessage();
      unsubscribeFromRevokeMessage();
      unsubscribeFromTyping();
    };
  }, [
    subscribeToNewMessages,
    unsubscribeFromNewMessages,
    subscribeToDeleteMessage,
    unsubscribeFromDeleteMessage,
    subscribeToRevokeMessage,
    unsubscribeFromRevokeMessage,
  ]);


  const checkDeletedMessage = (message: Message | null) => {
    if (!message) return false;
    if (message.deletedFor && message.deletedFor.length > 0) {
      return message.deletedFor.includes(user?._id);
    }
    return false;
  };

  const checkLastMessage = (message: Message | null) => {
    if (!message || !messages || messages.length === 0) return false;
    const lastMessage = messages[0];
    return lastMessage._id === message._id && lastMessage.sender._id === user?._id && lastMessage._id !== "temp";
  }

  return (
    <div className="h-[calc(100vh-14rem)] w-full flex flex-col">
      <div className="flex-1 w-full flex overflow-y-scroll flex-col-reverse gap-2 p-3 no-scrollbar">
        {messages &&
          messages?.map((message, index) => {
            const lastByUser =
              messages[index - 1]?.sender._id === message.sender._id;
            const isCurrentUser = message.sender._id === user?.id;
            const isDeleted = checkDeletedMessage(message);
            const isLastMessage = checkLastMessage(message);
            if (isDeleted) return null; // Bỏ qua tin nhắn đã bị xóa
            return (
              <Message
                key={index}
                message={message}
                fromCurrentUser={isCurrentUser}
                senderImage={message.sender.avatar || ""}
                file={message?.files || []}
                senderName={message.sender.firstName || ""}
                lastByUser={lastByUser}
                content={message.content}
                createdAt={message.createdAt}
                type={message.type}
                isTemp={message.isTemp || false}
                isError={message.isError || false}
                isLastMessage={isLastMessage}
              />
            );
          })}
      </div>
      {isTyping && (
        <div className="flex items-center gap-2 ml-12">
          <span className="text-gray-500">Typing...</span>
        </div>
      )}
    </div>
  );
};

export default Body;
