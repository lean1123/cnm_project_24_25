"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { Member } from "@/types";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  MoreVertical,
} from "lucide-react";
import { useConversationStore } from "@/store/useConversationStore";

type Props = {
  members: Member[];
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
};

const ShowGroupMember = ({ members, isActive, setIsActive }: Props) => {
  const { user } = useAuthStore();
  const {
    removeMemberFromGroup,
    selectedConversation,
    changeRoleMember,
    changeAdminGroup,
  } = useConversationStore();
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);

  const currentMember = members.find((m) => m.user._id === user?.id);
  const isCurrentUserAdmin = currentMember?.role === "ADMIN";

  const sortMembers = members.sort((a, b) => {
    if (a.role === "ADMIN" && b.role !== "ADMIN") return -1;
    if (b.role === "ADMIN" && a.role !== "ADMIN") return 1;
    return 0;
  });

  const handleRemove = async (member: Member) => {
    console.log("Remove:", member.user.firstName);
    await removeMemberFromGroup(selectedConversation?._id!, member.user._id!);
  };

  const handleMakeAdmin = async (member: Member) => {
    console.log("Make admin:", member.user.firstName);
    await changeAdminGroup(selectedConversation?._id!, member.user._id!);
  };

  const handleMakeOwner = async (member: Member) => {
    console.log("Make owner:", member.user.firstName);
    await changeRoleMember(selectedConversation?._id!, member.user._id!);
  };

  return (
    <div className="w-full flex-col">
      <div className="flex items-center justify-between w-full p-2 bg-secondary/50 rounded-md">
        <p className="text-gray-500 text-sm mt-2">{members.length} members</p>
        <button
          onClick={() => setIsActive(!isActive)}
          className="text-sm text-muted-foreground"
        >
          {isActive ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>

      {isActive && (
        <div className="w-full flex flex-col items-start justify-start gap-2 p-2 rounded-md mt-2">
          {sortMembers.map((member) => {
            const isCurrentUser = member.user._id === user?.id;
            const isAdmin = member.role === "ADMIN";
            const isOwner = member.role === "OWNER";

            const showPopoverTrigger =
              isCurrentUserAdmin && !isAdmin && !isCurrentUser;

            return (
              <div
                key={member.user._id}
                className="relative flex items-center gap-2 w-full p-2 hover:bg-secondary/40 rounded-md cursor-pointer group"
                onMouseEnter={() => setHoveredMemberId(member.user._id!)}
                onMouseLeave={() => setHoveredMemberId(null)}
              >
                <Avatar className="size-8">
                  <AvatarImage
                    src={member.user.avatar || "/avatar.png"}
                    alt={member.user.firstName}
                  />
                </Avatar>

                <div className="flex flex-col items-start justify-start w-full">
                  <h1 className="text-base font-semibold">
                    {member.user.firstName + " " + member.user.lastName}
                  </h1>
                  {isAdmin && (
                    <span className="text-sm text-gray-500">Admin</span>
                  )}
                  {isOwner && (
                    <span className="text-sm text-gray-500">Owner</span>
                  )}
                </div>

                {isCurrentUser && (
                  <span className="text-sm text-gray-500">(You)</span>
                )}

                {/* Hiển thị Popover Trigger nếu đủ điều kiện */}
                {showPopoverTrigger && hoveredMemberId === member.user._id && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 text-muted-foreground hover:text-primary"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2 text-sm mr-4">
                      <button
                        onClick={() => handleRemove(member)}
                        className="w-full text-left px-2 py-1 rounded hover:bg-red-100 text-red-600"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => handleMakeAdmin(member)}
                        className="w-full text-left px-2 py-1 rounded hover:bg-blue-100 text-blue-600"
                      >
                        Make Admin
                      </button>
                      <button
                        onClick={() => handleMakeOwner(member)}
                        className="w-full text-left px-2 py-1 rounded hover:bg-green-100 text-green-600"
                      >
                        Make Owner
                      </button>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShowGroupMember;
