import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { cn, getInitials, getNameFallBack } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useConversationStore } from "@/store/useConversationStore";
import { CircleArrowLeft, Settings, User } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";

type Props = {
  userId: string;
  imageUrl?: string;
  firstName: string;
  lastName: string;
  options?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }[];
};

const Header = ({userId, imageUrl, firstName, lastName, options }: Props) => {
  const { activeUsers } = useAuthStore();
  const [isOnline, setIsOnline] = React.useState(false);
  useEffect(() => {
    console.log("userSelected", userId);
    if (!userId) return;
    console.log("activeUsers", activeUsers);
    const isUserOnline = activeUsers.includes(userId);
    console.log("isUserOnline", isUserOnline);
    setIsOnline(isUserOnline);
  }, [activeUsers, userId]);

  return (
    <Card className="w-full flex rounded-lg items-center p-2 justify-between">
      <div className="flex items-center gap-2">
        <Link href="/conversations" className="block lg:hidden">
          <CircleArrowLeft />
        </Link>
        <Avatar className="h-8 w-8">
          <AvatarImage src={imageUrl || "/avatar.png"} alt={firstName} />
          <AvatarFallback>
            {getNameFallBack(firstName, lastName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{firstName + " " + lastName}</h2>
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
      <div className="flex gap-2">
        {options &&
          options.map((option, index) => {
            return (
              <Button
                key={index}
                size={"icon"}
                variant={"secondary"}
                onClick={option.onClick}
              >
                {option.icon}
              </Button>
            );
          })}
        {/* {options && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button size={"icon"} variant={"secondary"}>
                <Settings />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {options.map((option, index) => {
                return (
                  <DropdownMenuItem
                    key={index}
                    onClick={option.onClick}
                    className={cn("font-semibold", {
                      "text-destructive": option.destructive,
                    })}
                  >
                    {option.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )} */}
      </div>
    </Card>
  );
};

export default Header;
