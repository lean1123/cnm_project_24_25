"use client";
import ItemList from "@/components/common/item-list/ItemList";
import { Loader2, Search } from "lucide-react";
import React, { useState } from "react";
import ConversationItem from "./_components/ConversationItem";

type Props = React.PropsWithChildren<{}>;

const conversations = [
  {
    id: "1a2b3c",
    imageUrl: "https://example.com/avatar1.jpg",
    username: "john_doe",
    isGroup: false,
  },
  {
    id: "4d5e6f",
    imageUrl: "https://example.com/avatar2.jpg",
    username: "jane_smith",
    isGroup: false,
  },
  {
    id: "7g8h9i",
    imageUrl: "https://example.com/avatar3.jpg",
    username: "team_chat",
    isGroup: true,
  },
  {
    id: "10j11k12l",
    imageUrl: "https://example.com/avatar4.jpg",
    username: "alex_jones",
    isGroup: false,
  },
];

const ConversationsLayout = ({ children }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter(
    (conversation) =>
      !conversation.isGroup &&
      conversation.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <>
      <ItemList title="Conversations">
        {/* search */}
        {/* Search Input */}
        <div className="relative mb-4 w-full">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {conversations ? (
          filteredConversations.length === 0 ? (
            <p>No conversations found</p>
          ) : (
            filteredConversations.map((conversation) => {
              return conversation.isGroup ? null : (
                <ConversationItem
                  key={conversation.id}
                  id={conversation.id}
                  imageUrl={conversation.imageUrl}
                  username={conversation.username}
                  lastMessageContent="Hello!"
                  lastMessageSender="1a2b3c"
                />
              );
            })
          )
        ) : (
          <Loader2 className="w-8 h-8" />
        )}
      </ItemList>
      {children}
    </>
  );
};

export default ConversationsLayout;
