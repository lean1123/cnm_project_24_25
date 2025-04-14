import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React, { useEffect } from "react";
import AccountInformationDialog from "../dialog/AccountInformationDialog";
import { getInitials, getNameFallBack } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";
import Cookies from "js-cookie";

type Props = {};

const UserPopover = (props: Props) => {
  const { user, getMyProfile } = useAuthStore();

  const handleLogout = () => {
    // Handle logout logic here, e.g., clear tokens, redirect to login page, etc.
    console.log("Logout clicked");
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    window.location.href = "/login"; // Redirect to login page
  };
  useEffect(() => {
    getMyProfile();
  }, []);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage alt="User" src={user?.avatar || "/avatar.png"} />
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
          <div
            className="space-y-1 hover:bg-gray-100 p-2 cursor-pointer"
            onClick={() => {
              handleLogout();
            }}
          >
            <h4 className="font-medium text-sm leading-none text-red-500">
              Log out
            </h4>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserPopover;
