import { useEffect } from "react";

import { useAuthStore } from "@/store/useAuthStore";
import { useConversationStore } from "@/store/useConversationStore";
import { useMessageStore } from "@/store/useMessageStore";
import type { Message } from "@/types";
import MessageComponent from "./Message";
import MessageSkeleton from "@/components/common/skeletons/MessageSkeleton";
import { Loader2 } from "lucide-react";

type Props = {};

const Body = (props: Props) => {
  const { selectedConversation } = useConversationStore();
  const { messages, fetchMessages, isTyping, isLoadingMessages } =
    useMessageStore();
  const { user } = useAuthStore();
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

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

  const checkFirstMessage = (message: Message | null, index: number) => {
    if (!message || !messages || messages.length === 0) return false;

    const nextMessage = messages[index + 1];
    return !nextMessage || nextMessage.sender._id !== message.sender._id;
  };

  return (
    <div className="h-[calc(100vh-13rem)] w-full flex flex-col">
      <div className="flex-1 w-full flex overflow-y-scroll flex-col-reverse gap-2 p-3 no-scrollbar">
        {/* {isLoadingMessages && <MessageSkeleton />} */}
        {isLoadingMessages && (
          <MessageSkeleton />
          // <div className="flex h-full justify-center items-center w-full">
          //   <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
          // </div>
        )}
        {!isLoadingMessages && messages && messages.length === 0 && (
          <div className="flex h-full justify-center items-center w-full">
            {messages && messages.length === 0 && (
              <p className="text-gray-500">Hãy bắt đầu cuộc trò chuyện nào!</p>
            )}
          </div>
        )}
        {!isLoadingMessages &&
          messages &&
          messages?.map((message, index) => {
            const lastByUser =
              messages[index - 1]?.sender._id === message.sender._id;
            const isCurrentUser = message.sender._id === user?.id;
            const isDeleted = checkDeletedMessage(message);
            const isLastMessage = checkLastMessage(message);
            const isFirstMessage = checkFirstMessage(message, index);
            if (isDeleted) return null; // Bỏ qua tin nhắn đã bị xóa
            return (
              <MessageComponent
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
                isFirstMessage={isFirstMessage}
              />
            );
          })}
      </div>
      <div className="flex items-center gap-2 ml-12 h-2">
        {isTyping && <span className="text-gray-500">Đang soạn tin...</span>}
      </div>
    </div>
  );
};

export default Body;
