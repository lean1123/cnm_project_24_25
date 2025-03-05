import ContactContainer from "@/components/common/contact/ContactContainer";
import React from "react";
import NewRequestItem from "./_components/NewRequestItem";
import { Separator } from "@/components/ui/separator";
import PendingRequestItem from "./_components/PendingRequestItem";

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
  return (
    <ContactContainer title="Friend requests">
      <div className="mt-4 flex flex-col w-full">
        <h4 className="text-xl font-semibold tracking-tight mb-4">
          New request
        </h4>
        {requests.map((request) => (
          <NewRequestItem key={request.id} {...request} />
        ))}
      </div>
      <Separator className="mt-4" />
      <div className="mt-4 flex flex-col w-full">
        <h4 className="text-xl font-semibold tracking-tight mb-4">
          Pending request
        </h4>
        {requests.map((request) => (
          <PendingRequestItem key={request.id} {...request} />
        ))}
      </div>
    </ContactContainer>
  );
};

export default RequestPage;
