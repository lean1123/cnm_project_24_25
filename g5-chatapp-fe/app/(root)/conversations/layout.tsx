"use client";
import ItemList from "@/components/common/item-list/ItemList";
import { Loader2, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import ConversationItem from "./_components/ConversationItem";
import { useAuthStore } from "@/store/useAuthStore";
import { useConversationStore } from "@/store/useConversationStore";
import { Conversation } from "@/types";

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

  const {user} = useAuthStore();
  const {conversations, getConversations, setSelectedConversation} = useConversationStore();

  // const filteredConversations = conversations?.filter(
  //   (conversation) =>
  //     !conversation.isGroup && conversation.lastMessage && // Ensure lastMessage exists
  //     conversation?.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  // );
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      await getConversations(user.id);
      console.log("Conversations ui data:", conversations);
    };
    fetchConversations();
  }, [user]);

  const getMemberName = (conversation: Conversation) => {
    if (conversation.members[0]._id !== user?.id) {
      return conversation.members[0].firstName + " " + conversation.members[0].lastName;
    }
    return conversation.members[1].firstName + " " + conversation.members[1].lastName;
  }
  return (
    <>
      <ItemList title="Conversations">
        {/* search */}
        {/* Search Input */}
        {/* <div className="relative mb-4 w-full">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div> */}

        {conversations ? (
          conversations.length === 0 ? (
            <p>No conversations found</p>
          ) : (
            conversations && conversations.map((conversation) => {
              return conversation.isGroup ? null : (
                <ConversationItem
                  key={conversation._id}
                  id={conversation._id}
                  imageUrl={conversation.profilePicture || ""}
                  name={getMemberName(conversation)}
                  lastMessageContent={conversation.lastMessage?.content || ""}
                  lastMessageSender={conversation.lastMessage?.sender._id || ""}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    console.log("Selected conversation:", conversation._id);
                  }}
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
