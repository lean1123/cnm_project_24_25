"use client";
import ContactContainer from "@/components/common/contact/ContactContainer";
import Filter from "../_components/Filter";
import FriendItem from "./_components/FriendItem";
import { useContactStore } from "@/store/useContactStore";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

type Props = {};

const friends = [
  {
    id: 1,
    name: "John Doe",
    avatar:
      "https://th.bing.com/th/id/OIP.Zvs5IHgOO5kip7A32UwZJgHaHa?rs=1&pid=ImgDetMain",
    state: "Online",
  },
  {
    id: 2,
    name: "Jane Doe",
    avatar:
      "https://th.bing.com/th/id/OIP.Zvs5IHgOO5kip7A32UwZJgHaHa?rs=1&pid=ImgDetMain",
    state: "Offline",
  },
  {
    id: 3,
    name: "John Smith",
    avatar:
      "https://th.bing.com/th/id/OIP.Zvs5IHgOO5kip7A32UwZJgHaHa?rs=1&pid=ImgDetMain",
    state: "Online",
  },
  {
    id: 4,
    name: "Jane Smith",
    avatar: "",
    state: "Offline",
  },
];

const FriendsPage = (props: Props) => {
  const {contacts, getMyContact} = useContactStore();
  const {user} = useAuthStore();
  useEffect(() => {
    getMyContact();
  }
  , []);
  return (
    <ContactContainer title="Friends list">
      {/* filter */}
      <Filter />
      {/* list contact */}
      <div className="mt-4 flex flex-col w-full">
        {contacts.map((contact) => (
          <FriendItem key={contact._id} id={
            contact.contactId === user?._id ? contact.userId : contact.contactId
          } />
        ))}
      </div>
    </ContactContainer>
  );
};

export default FriendsPage;
