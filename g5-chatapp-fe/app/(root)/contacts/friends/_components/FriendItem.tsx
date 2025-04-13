"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { getInitials, getNameFallBack } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";
import { User } from "@/types";
import { MoreHorizontal } from "lucide-react";
import React, { useEffect, useState } from "react";

type Props = {
  id: string;
  // name: string;
  // avatar: string;
  // state: string;
};

const FriendItem = ({ id }: Props) => {
  const {getUserById} = useUserStore();
  const [user, setUser] = useState<User | null>(null);
  const {activeUsers} = useAuthStore();
  const isOnline = activeUsers.find((user) => user === id);
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUserById(id);
      setUser(userData);
    };
    fetchUser();
  }
  , [id, getUserById]);
  return (
    <div
      key={id}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage
            src={user?.avatar || ""}
            alt={user?.firstName + " " + user?.lastName}
            // className="w-12 h-12 rounded-full"
          />
          <AvatarFallback>{getNameFallBack(user?.firstName || "", user?.lastName || "")}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold">{user?.firstName + " " + user?.lastName}</span>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            {isOnline ? (
              <span className="h-2 w-2 rounded-full bg-green-500" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-red-500" />
            )}
            {isOnline ? "Online" : "Offline"}
          </p>
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
