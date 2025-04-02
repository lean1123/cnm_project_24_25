import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { CircleCheck, CircleX, Undo } from "lucide-react";

type Props = {
  id: number;
  name: string;
  avatar: string;
  sendAt: string;
};

const PendingRequestItem = ({ id, name, avatar, sendAt }: Props) => {
  return (
    <div
      key={id}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold">{name}</span>
          <span className="text-sm text-gray-500">{sendAt}</span>
        </div>
      </div>
      {/* button */}
      <div className="flex items-center gap-2">
        <Button className="bg-background hover:bg-orange-500 text-orange-500 hover:text-white">
          <Undo size={16} />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PendingRequestItem;
