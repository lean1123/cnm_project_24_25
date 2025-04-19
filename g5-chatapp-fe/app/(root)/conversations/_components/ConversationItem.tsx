"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { LastMessage } from "@/types";
import { User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type Props = {
  id: string;
  imageUrl: string;
  name: string;
  lastMessage: LastMessage | null;
  onClick?: () => void;
};

const ConversationItem = ({ id, imageUrl, name, lastMessage }: Props) => {
  const path = usePathname();
  const isActive = path === `/conversations/${id}`;
  const { user } = useAuthStore();
  return (
    <Link href={`/conversations/${id}`} className="w-full" id={id}>
      <Card
        className={`p-2 flex flex-row items-center gap-4 truncate ${
          isActive ? "bg-secondary/65" : ""
        }`}
      >
        <div className="flex flex-row items-center gap-4 truncate">
          <Avatar>
            <AvatarImage src={imageUrl || "/avatar.png"} alt={name} />
            {/* <AvatarFallback>{getInitials(name)}</AvatarFallback> */}
          </Avatar>
          <div className="flex flex-col truncate">
            <h4 className="truncate">{name}</h4>
            {lastMessage ? (
              <span className="text-sm text-muted-foreground flex truncate overflow-ellipsis">
                <p className="font-semibold">
                  {lastMessage.sender._id === user?._id ? "You :" : ""}
                </p>
                {lastMessage.type === "VIDEO" &&
                  lastMessage.files &&
                  lastMessage.files.length > 0 && (
                    <p className="text-sm text-muted-foreground truncate">
                      {`Send a video`}
                    </p>
                  )}
                {lastMessage.type === "IMAGE" &&
                  lastMessage.files &&
                  lastMessage.files.length == 1  && (
                    <p className="text-sm text-muted-foreground truncate">
                      {`Send a photo`}
                    </p>
                  )}
                {lastMessage.type === "IMAGE" &&
                  lastMessage.files &&
                  lastMessage.files.length > 1 && (
                    <p className="text-sm text-muted-foreground truncate">
                      {`Send ${lastMessage.files.length} photos`}
                    </p>
                  )}
                {lastMessage.type === "FILE" &&
                  lastMessage.files &&
                  lastMessage.files.length > 0 && (
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMessage.files[0].fileName}
                    </p>
                  )}
                {/* {lastMessage.type === "FILE" &&
                  lastMessage.files &&
                  lastMessage.files.length > 1 && (
                    <p className="text-sm text-muted-foreground truncate">
                      {`Send ${lastMessage.files.length} files`}
                    </p>
                  )} */}
                {lastMessage.type === "TEXT" && (
                  <p className="text-sm text-muted-foreground truncate">
                    {lastMessage.content}
                  </p>
                )}
                {lastMessage.type === "AUDIO" &&
                  lastMessage.files &&
                  lastMessage.files.length > 0 && (
                    <p className="text-sm text-muted-foreground truncate">
                      {`Send a voice message`}
                    </p>
                  )}
                {lastMessage.type === "LOCATION" && lastMessage.content && (
                  <p className="text-sm text-muted-foreground truncate">
                    {`Send a location`}
                  </p>
                )}
                {lastMessage.type === "CONTACT" && lastMessage.content && (
                  <p className="text-sm text-muted-foreground truncate">
                    {`Send a contact`}
                  </p>
                )}
                {lastMessage.type === "STICKER" && lastMessage.content && (
                  <p className="text-sm text-muted-foreground truncate">
                    {`Send a sticker`}
                  </p>
                )}
                {lastMessage.type === "REACT" && lastMessage.content && (
                  <p className="text-sm text-muted-foreground truncate">
                    {`Reacted with ${lastMessage.content}`}
                  </p>
                )}
                {lastMessage.type === "CALL" && lastMessage.content && (
                  <p className="text-sm text-muted-foreground truncate">
                    {`Call ${lastMessage.content}`}
                  </p>
                )}
              </span>
            ) : (
              <p className="text-sm text-muted-foreground truncate">
                Start the conversation!
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ConversationItem;
