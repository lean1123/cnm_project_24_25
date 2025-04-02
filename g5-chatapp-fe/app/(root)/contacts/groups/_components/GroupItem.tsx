import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";

type Props = {
  id: number;
  title: string;
  avatar: string;
  numberOfMembers: number;
};

const GroupItem = ({ id, title, avatar, numberOfMembers }: Props) => {
  return (
    <div
      key={id}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <Image
          width={48}
          height={48}
          src={avatar}
          alt={title}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex flex-col">
          <span className="font-semibold">{title}</span>
          <span className="text-sm text-gray-500">
            {numberOfMembers} members
          </span>
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
              <h4 className="font-medium text-sm leading-none text-red-500">
                Leave group
              </h4>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default GroupItem;
