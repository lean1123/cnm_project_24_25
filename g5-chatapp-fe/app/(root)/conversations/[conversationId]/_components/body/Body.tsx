import React, { useEffect } from "react";
import Message from "./Message";
import { useConversationStore } from "@/store/useConversationStore";
import { useAuthStore } from "@/store/useAuthStore";
import { sub } from "date-fns";
import { useMessageStore } from "@/store/useMessageStore";

type Props = {};

const Body = (props: Props) => {
  const { selectedConversation } = useConversationStore();
  const {
    messages,
    fetchMessages,
    isTyping,
  } = useMessageStore();
  const { user } = useAuthStore();
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation, fetchMessages]);


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
    return (
      lastMessage._id === message._id &&
      lastMessage.sender._id === user?._id &&
      lastMessage._id !== "temp"
    );
  };

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
