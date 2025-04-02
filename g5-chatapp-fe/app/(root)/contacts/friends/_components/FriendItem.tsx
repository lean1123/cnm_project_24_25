import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import React from "react";

type Props = {
  id: number;
  name: string;
  avatar: string;
  state: string;
};

const FriendItem = ({ id, name, avatar, state }: Props) => {
  return (
    <div
      key={id}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage
            src={avatar}
            alt={name}
            // className="w-12 h-12 rounded-full"
          />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold">{name}</span>
          <span className="text-sm text-gray-500">{state}</span>
        </div>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="link">
            <MoreHorizontal size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44 mr-6 p-0">
          <div className="grid gap-2 py-2">
            <div className="space-y-1 hover:bg-gray-100 p-2 cursor-pointer">
              <h4 className="font-medium text-sm leading-none">
                View information
              </h4>
            </div>
            <Separator />
            <div className="space-y-1 hover:bg-gray-100 p-2 cursor-pointer">
              <h4 className="font-medium text-sm leading-none">
                Block this user
              </h4>
            </div>
            <Separator />
            <div className="space-y-1 hover:bg-gray-100 p-2 cursor-pointer">
              <h4 className="font-medium text-sm leading-none text-red-500">
                Remove friend
              </h4>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FriendItem;
