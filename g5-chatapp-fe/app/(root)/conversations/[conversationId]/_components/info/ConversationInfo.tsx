"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, getNameFallBack } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useConversationStore } from "@/store/useConversationStore";
import { Conversation, User } from "@/types";
import { Bell, Download, FileText, LogOutIcon, Search, Trash, Trash2, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import ShowGroupMember from "./ShowGroupMember";
import { useMessageStore } from "@/store/useMessageStore";
import { AddMemberToGroupDialog } from "@/components/common/dialog/AddMemberToGroupDialog";

type Props = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  userSelected?: User | null;
  conversationSelected?: Conversation | null;
  isGroup?: boolean;
};

const conversationInfo = {
  name: "John Doe",
  avatar: "/images/avatar.png",
  mutualGroups: 2,
  photos: [
    "https://res.cloudinary.com/dr7uxdi9o/image/upload/v1732893118/ShoesShopApp/User/7618a371-1098-4704-9360-e887650fb1d8.jpg",
    "https://res.cloudinary.com/dr7uxdi9o/image/upload/v1732893118/ShoesShopApp/User/7618a371-1098-4704-9360-e887650fb1d8.jpg",
    "https://res.cloudinary.com/dr7uxdi9o/image/upload/v1732893118/ShoesShopApp/User/7618a371-1098-4704-9360-e887650fb1d8.jpg",
    "https://res.cloudinary.com/dr7uxdi9o/image/upload/v1732893118/ShoesShopApp/User/7618a371-1098-4704-9360-e887650fb1d8.jpg",
    "https://res.cloudinary.com/dr7uxdi9o/image/upload/v1732893118/ShoesShopApp/User/7618a371-1098-4704-9360-e887650fb1d8.jpg",
    "https://res.cloudinary.com/dr7uxdi9o/image/upload/v1732893118/ShoesShopApp/User/7618a371-1098-4704-9360-e887650fb1d8.jpg",
  ],
  files: [
    {
      name: "NuVasive_Spine_Terms_&_Defin... (1).pdf",
      size: "951.32 KB",
      date: "29/10/2024",
      url: "/files/document1.pdf",
    },
    {
      name: "Project_Plan_2024.xlsx",
      size: "2.1 MB",
      date: "15/09/2024",
      url: "/files/document2.xlsx",
    },
    {
      name: "Team_Meeting_Notes.docx",
      size: "500 KB",
      date: "10/08/2024",
      url: "/files/document3.docx",
    },
  ],
};

function ConversationInfo({
  isOpen,
  setOpen,
  userSelected,
  conversationSelected,
  isGroup,
}: Props) {
  // const {userSelected} = useConversationStore()
  const [showGroupMember, setShowGroupMember] = React.useState(false);
  const {messages} = useMessageStore();
  const mediaFiles = messages
  .filter(
    (message) =>
      (message.type === "IMAGE" || message.type === "VIDEO") &&
      Array.isArray(message.files)
  )
  .flatMap((message) => message.files!); // dấu `!` vì ta đã kiểm tra ở trên

  const files = messages
  .filter((message) => (message.type === "FILE" || message.type === "DOCUMENT") && Array.isArray(message.files))
  .flatMap((message) => message.files!); // dấu `!` vì ta đã kiểm tra ở trên

  return (
    <Card
      className={cn(
        "w-full p-2 rounded-lg overflow-y-scroll no-scrollbar",
        isOpen ? "col-span-3" : "hidden"
      )}
    >
      {/* info */}
      <div className="flex flex-col gap-2 justify-center items-center mt-6">
        <Avatar className="h-16 w-16">
          {isGroup ? (
            <AvatarImage
              src={conversationSelected?.profilePicture || "/group.jpg"}
              alt="Group"
            />
          ) : (
            <AvatarImage
              src={userSelected?.avatar || "/avatar.png"}
              alt="User"
            />
          )}
          <AvatarFallback>
            {getNameFallBack(
              userSelected?.firstName || "",
              userSelected?.lastName || ""
            )}
          </AvatarFallback>
        </Avatar>
        {/* <div> */}
        {isGroup ? (
          <h2 className="font-semibold">{conversationSelected?.name}</h2>
        ) : (
          <h2 className="font-semibold">
            {userSelected?.firstName + " " + userSelected?.lastName}
          </h2>
        )}

        {/* button */}
        <div className="mt-2 flex justify-evenly items-start w-full">
          {!isGroup && (
            <>
              <div className="flex flex-col items-center gap-1">
                <Button
                  className="rounded-full size-8 flex justify-center items-center"
                  variant="secondary"
                >
                  <Bell className="size-4 text-base-content" />
                </Button>
                <span className="text-base-content text-sm">Mute</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <Button
                  className="rounded-full size-8 flex justify-center items-center"
                  variant="secondary"
                >
                  <Search className="size-4 text-base-content" />
                </Button>
                <span className="text-base-content text-sm">Search</span>
              </div>
            </>
          )}
          {isGroup && (
            <>
              <div className="flex flex-col items-center gap-1">
                {/* <Button
                  className="rounded-full size-8 flex justify-center items-center"
                  variant="secondary"
                >
                  <UserPlus className="size-4 text-base-content" />
                </Button> */}
                <AddMemberToGroupDialog conversation={conversationSelected!} />
                <span className="text-base-content text-sm">Add</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Button
                  className="rounded-full size-8 flex justify-center items-center"
                  variant="destructive"
                >
                  <LogOutIcon className="size-4 text-base-content" />
                </Button>
                <span className="text-base-content text-sm">Leave</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Button
                  className="rounded-full size-8 flex justify-center items-center"
                  variant="destructive"
                >
                  <Trash2 className="size-4 text-base-content" />
                </Button>
                <span className="text-base-content text-sm">Dissolve</span>
              </div>
            </>
          )}
        </div>
      </div>
      {/*  */}
      {/* members */}
      {isGroup && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-base font-medium">Group member</h3>

          <ShowGroupMember
            members={conversationSelected!.members}
            isActive={showGroupMember}
            setIsActive={setShowGroupMember}
          />
        </div>
      )}
      {/* Photos/Videos */}
      <div className="mt-4 border-t pt-4">
        <h3 className="text-base font-medium">Photos/Videos</h3>
        {mediaFiles.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {mediaFiles.map((file, index) => (
                <Image
                  key={index}
                  src={file.url}
                  alt="Photo"
                  width={100}
                  height={100}
                  className="rounded-md"
                />
              ))}
            </div>
            {/* <Button variant="outline" className="w-full mt-2">
              View all
            </Button> */}
          </>
        ) : (
          <p className="text-gray-500 text-sm mt-2">
            No photos/videos available.
          </p>
        )}
      </div>
      {/* Files */}
      <div className="mt-4 border-t pt-4">
        <h3 className="text-base font-medium">Files</h3>
        {files.length > 0 ? (
          <>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center p-2 border rounded-lg mt-2"
              >
                <FileText className="w-6 h-6 text-gray-500 mr-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.fileName}</p>
                  {/* <p className="text-xs text-gray-500">
                    {file.url} • {file.date}
                  </p> */}
                </div>
                {/* <Link
                  href={file.url}
                  target="_blank"
                  className="text-blue-500 text-sm"
                >
                  <Download className="w-6 h-6" />
                </Link> */}
              </div>
            ))}
            {/* <Button variant="outline" className="w-full mt-2">
              View all
            </Button> */}
          </>
        ) : (
          <p className="text-gray-500 text-sm mt-2">No files available.</p>
        )}
      </div>
    </Card>
  );
}

export default ConversationInfo;
