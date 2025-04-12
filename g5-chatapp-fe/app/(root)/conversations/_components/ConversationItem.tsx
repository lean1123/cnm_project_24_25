"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type Props = {
  id: string;
  imageUrl: string;
  name: string;
  lastMessageSender: string;
  lastMessageContent: string;
  onClick?: () => void;
};

const ConversationItem = ({
  id,
  imageUrl,
  name,
  lastMessageContent,
  lastMessageSender,
}: Props) => {
  const path = usePathname();
  const isActive = path === `/conversations/${id}`;
  return (
    <Link href={`/conversations/${id}`} className="w-full">
      <Card className={`p-2 flex flex-row items-center gap-4 truncate ${isActive ? "bg-secondary/65" : ""}`}>
        <div className="flex flex-row items-center gap-4 truncate">
          <Avatar>
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col truncate">
            <h4 className="truncate">{name}</h4>
            {lastMessageSender && lastMessageContent ? (
              <span className="text-sm text-muted-foreground flex truncate overflow-ellipsis">
                {/* <p className="font-semibold">
                  {lastMessageSender === "1232" ? "You :" : ""}
                </p>
                <p className="truncate overflow-ellipsis">
                  {lastMessageContent}
                </p> */}
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
