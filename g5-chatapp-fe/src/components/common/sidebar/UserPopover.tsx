import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import AccountInformationDialog from "../dialog/AccountInformationDialog";
import { useConversationStore } from "@/store/useConversationStore";

type Props = {};

const UserPopover = (props: Props) => {
  const { user, getMyProfile, logout } = useAuthStore();
  const { setSelectedConversation} = useConversationStore();

  const handleLogout = () => {
    // Handle logout logic here, e.g., clear tokens, redirect to login page, etc.
    logout();
    // console.log("Logout clicked");
    // Cookies.remove("accessToken");
    // Cookies.remove("refreshToken");
    // window.location.href = "/login"; // Redirect to login page
    setSelectedConversation(null);
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
            <h4 className="font-medium text-sm leading-none">Cài đặt</h4>
          </div>
          <Separator />
          <div
            className="space-y-1 hover:bg-gray-100 p-2 cursor-pointer"
            onClick={() => {
              handleLogout();
            }}
          >
            <h4 className="font-medium text-sm leading-none text-red-500">
              Đăng xuất
            </h4>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserPopover;
