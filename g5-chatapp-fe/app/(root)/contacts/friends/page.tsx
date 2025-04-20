"use client";
import ContactContainer from "@/components/common/contact/ContactContainer";
import Filter from "../_components/Filter";
import FriendItem from "./_components/FriendItem";
import { useContactStore } from "@/store/useContactStore";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

type Props = {};


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
          <FriendItem key={contact._id} info={
            contact.contact._id === user?._id ? contact.user : contact.contact
          } />
        ))}
      </div>
    </ContactContainer>
  );
};

export default FriendsPage;
