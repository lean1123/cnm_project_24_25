"use client";
import ItemList from "@/components/common/item-list/ItemList";
import {
  ContactRound,
  Loader2,
  Search,
  UserRound,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import React, { useState } from "react";
import ConversationItem from "../conversations/_components/ConversationItem";
import NavItem from "./_components/NavItem";

type Props = React.PropsWithChildren<{}>;

const nav = [
  {
    id: "1a2b3c",
    icon: <ContactRound />,
    title: "Friends list",
    path: "/friends",
  },
  {
    id: "4d5e6f",
    icon: <UsersRound />,
    title: "Joined groups",
    path: "/groups",
  },
  {
    id: "7g8h9i",
    icon: <UserRoundPlus />,
    title: "Friend requests",
    path: "/requests",
  },
];

const ContactsLayout = ({ children }: Props) => {
  return (
    <>
      <ItemList title="Contacts">
        {nav && nav.length > 0 ? (
          nav.map((item) => (
            <NavItem
              key={item.id}
              id={item.id}
              title={item.title}
              icon={item.icon}
              path={item.path}
            />
          ))
        ) : (
          <Loader2 className="w-8 h-8 animate-spin" />
        )}
      </ItemList>
      {children}
    </>
  );
};

export default ContactsLayout;
