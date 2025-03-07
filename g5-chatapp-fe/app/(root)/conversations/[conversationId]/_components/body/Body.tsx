import React from "react";
import Message from "./Message";

type Props = {};

const Body = (props: Props) => {
  const messages = [
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
  return (
    <div className="flex-1 w-full flex overflow-y-scroll flex-col-reverse gap-2 p-3 no-scrollbar">
      {messages?.map(
        ({ message, senderImage, senderName, isCurrentUser }, index) => {
          const lastByUser =
            messages[index - 1]?.message.senderId ===
            messages[index]?.message.senderId;
          return (
            <Message
              key={index}
              fromCurrentUser={isCurrentUser}
              senderImage={senderImage}
              senderName={senderName}
              lastByUser={lastByUser}
              content={message.content}
              createdAt={message.createdAt}
              type={message.type}
            />
          );
        }
      )}
    </div>
  );
};

export default Body;
