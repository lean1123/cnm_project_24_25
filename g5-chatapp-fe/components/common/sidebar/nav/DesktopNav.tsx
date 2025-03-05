"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigation } from "@/hooks/useNavigation";
import { getInitials } from "@/lib/utils";
import {
  CircleEllipsis,
  CircleUserRound,
  MoreVertical,
  User,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AccountInformationDialog from "../../dialog/AccountInformationDialog";

const DesktopNav = () => {
  const paths = useNavigation();

  return (
    <Card className="hidden lg:flex lg:flex-col lg:justify-between lg:items-center lg:h-full lg:w-16 lg:px-2 lg:py-4">
      <div className="flex flex-col items-center gap-8">
        <Link href={"/"}>
          <div className="flex flex-col items-center justify-center">
            <Image src="/logo.png" width={40} height={40} alt="Logo" />
            <p className="text-sm font-semibold text-primary">E-chat</p>
          </div>
        </Link>
        <nav>
          <ul className="flex flex-col items-center justify-start h-full gap-4">
            {paths.paths.map((path, id) => {
              return (
                <li key={id} className="relative">
                  <Link href={path.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Button
                            key={id}
                            size={"icon"}
                            variant={path.active ? "default" : "outline"}
                          >
                            {path.icon}
                          </Button>
                          {path.count ? (
                            <Badge className="absolute left-6 bottom-7 px-2">
                              {path.count}
                            </Badge>
                          ) : null}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{path.name}</TooltipContent>
                    </Tooltip>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className="flex flex-col items-center gap-4">
        {/* <CircleEllipsis /> */}
        {/* user */}
        <Popover>
          <PopoverTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage alt="User" src="/avatar.jpg" />
              <AvatarFallback>{getInitials("John Doe")}</AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="w-52 ml-6 p-0">
            <div className="grid gap-2 py-2">
              <AccountInformationDialog />
              <Separator />
              <div className="space-y-1 hover:bg-gray-100 p-2 cursor-pointer">
                <h4 className="font-medium text-sm leading-none">Settings</h4>
              </div>
              <Separator />
              <div className="space-y-1 hover:bg-gray-100 p-2 cursor-pointer">
                <h4 className="font-medium text-sm leading-none text-red-500">
                  Log out
                </h4>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </Card>
  );
};

export default DesktopNav;
