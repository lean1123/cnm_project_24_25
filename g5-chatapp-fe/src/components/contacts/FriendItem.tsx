import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { getNameFallBack } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type { User } from "@/types";
import { MoreHorizontal } from "lucide-react";
import { UnfriendDialog } from "../common/dialog/UnfriendDialog";

type Props = {
  info: User;
  contactId: string;
};

const FriendItem = ({ info, contactId }: Props) => {
  const { activeUsers } = useAuthStore();
  const isOnline = activeUsers.find((user) => user === info._id) ? true : false;

  return (
    <div
      key={info._id}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage
            src={info?.avatar || "/avatar.png"}
            alt={info?.firstName + " " + info?.lastName}
            // className="w-12 h-12 rounded-full"
          />
          <AvatarFallback>
            {getNameFallBack(info?.firstName || "", info?.lastName || "")}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold">
            {info?.firstName + " " + info?.lastName}
          </span>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            {isOnline ? (
              <span className="h-2 w-2 rounded-full bg-green-500" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-red-500" />
            )}
            {isOnline ? "Đang hoạt động" : "Không hoạt động"}
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
                Xem thông tin cá nhân
              </h4>
            </div>
            <Separator />
            <div className="space-y-1 hover:bg-gray-100 p-2 cursor-pointer">
              <h4 className="font-medium text-sm leading-none">
                Chặn người dùng
              </h4>
            </div>
            <Separator />
            <div className="space-y-1 hover:bg-gray-100 p-2 cursor-pointer">
              {/* <h4 className="font-medium text-sm leading-none text-red-500">
                Xóa bạn bè
              </h4> */}
              <UnfriendDialog contactId={contactId} />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FriendItem;
