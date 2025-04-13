"use client";
import ContactContainer from "@/components/common/contact/ContactContainer";
import React, { useEffect } from "react";
import NewRequestItem from "./_components/NewRequestItem";
import { Separator } from "@/components/ui/separator";
import PendingRequestItem from "./_components/PendingRequestItem";
import { useContactStore } from "@/store/useContactStore";
import { useAuthStore } from "@/store/useAuthStore";

type Props = {};

const requests = [
  {
    id: 1,
    name: "John Doe",
    avatar:
      "https://th.bing.com/th/id/OIP.Zvs5IHgOO5kip7A32UwZJgHaHa?rs=1&pid=ImgDetMain",
    sendAt: "2 hours ago",
  },
  {
    id: 2,
    name: "Jane Doe",
    avatar: "",
    sendAt: "1 day ago",
  },
];

const RequestPage = (props: Props) => {
  const {myPendingContact, myRequestContact, getListPendingContact, getListRequestContact, acceptContact, rejectContact, cancelContact} = useContactStore();
  useEffect(() => {
    getListPendingContact();
    getListRequestContact();
  }
  , []);
  return (
    <ContactContainer title="Friend requests">
      <div className="mt-4 flex flex-col w-full">
        <h4 className="text-xl font-semibold tracking-tight mb-4">
          New request
        </h4>
        {myRequestContact.map((request) => (
          <NewRequestItem key={request._id} {...request} />
        ))}
        {myRequestContact.length === 0 && (
          <div className="flex items-center justify-center w-full h-full p-4 text-gray-500">
            No new requests
          </div>
        )}  
      </div>
      <Separator className="mt-4" />
      <div className="mt-4 flex flex-col w-full">
        <h4 className="text-xl font-semibold tracking-tight mb-4">
          Pending request
        </h4>
        {myPendingContact.map((request) => (
          <PendingRequestItem key={request._id} {...request} />
        ))}
        {myPendingContact.length === 0 && (
          <div className="flex items-center justify-center w-full h-full p-4 text-gray-500">
            No pending requests
          </div>
        )}  
      </div>
    </ContactContainer>
  );
};

export default RequestPage;
