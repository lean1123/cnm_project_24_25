"use client";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials, getNameFallBack } from "@/lib/utils";
import { CircleCheck, CircleX, Undo } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { User } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { useContactStore } from "@/store/useContactStore";

type Props = {
  _id: string;
  user: User;
  contact: User;
  createdAt: string;
};

const PendingRequestItem = ({ _id, user, contact, createdAt }: Props) => {
  const { cancelContact } = useContactStore();
  const { getUserById } = useUserStore();
  const userLogin = useAuthStore((state) => state.user);
  const userItem = userLogin?._id === user._id ? contact : user;
  return (
    <div
      key={_id}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage
            src={userItem?.avatar || "/avatar.png"}
            alt={userItem?.firstName + " " + userItem?.lastName}
          />
          <AvatarFallback>
            {getNameFallBack(
              userItem?.firstName || "",
              userItem?.lastName || ""
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold">
            {userItem?.firstName + " " + userItem?.lastName}
          </span>
          <span className="text-sm text-gray-500">{createdAt}</span>
        </div>
      </div>
      {/* button */}
      <div className="flex items-center gap-2">
        <Button
          className="bg-background hover:bg-orange-500 text-orange-500 hover:text-white"
          onClick={async () => {
            await cancelContact(_id);
          }}
        >
          <Undo size={16} />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PendingRequestItem;
