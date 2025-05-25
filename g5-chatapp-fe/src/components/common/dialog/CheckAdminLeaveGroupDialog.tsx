import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getNameFallBack } from "@/lib/utils";
// import { useAuthStore } from "@/store/useAuthStore";
import { useConversationStore } from "@/store/useConversationStore";
import type { Conversation } from "@/types";
import { LogOutIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface CheckAdminLeaveGroupDialogProps {
  conversation: Conversation | null;
}

export function CheckAdminLeaveGroupDialog({
  conversation,
}: CheckAdminLeaveGroupDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const { changeAdminGroup } = useConversationStore();
  // const { user } = useAuthStore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const toggleSelectUser = (userId: string) => {
    setSelectedUserId((prev) => (prev === userId ? null : userId));
  };

  const normalizedInput = inputValue.trim().toLowerCase();

  const filterContacts = conversation?.members
    .filter((member) => {
      const fullName =
        `${member.user.firstName} ${member.user.lastName}`.toLowerCase();
      const email = member.user.email?.toLowerCase() || "";
      const matchesQuery =
        fullName.includes(normalizedInput) || email.includes(normalizedInput);

      return matchesQuery && member.role !== "ADMIN"; // 👈 Exclude admins
    })
    .map((member) => member.user);

  useEffect(() => {
    // getMyContact();
  }, [conversation]);

  return (
    <Dialog>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              className="rounded-full size-8 flex justify-center items-center"
              variant="destructive"
            >
              <LogOutIcon className="size-4 text-base-content" />
            </Button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent>Rời nhóm</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[400px] h-[60vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <DialogTitle className="text-base font-semibold">
              Chọn người thay thế quản trị viên
            </DialogTitle>
          </div>

          {/* Input */}
          <div className="p-4 flex-1">
            <Input
              placeholder="Email hoặc tên người dùng"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-gray-100"
            />
          </div>
          {/* result */}
          {/* result */}
          <div className="flex-grow h-[240px] overflow-y-auto">
            {filterContacts &&
              filterContacts.length > 0 &&
              filterContacts.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between gap-2 p-4 border-b border-base-300"
                >
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        src={user.avatar || "/avatar.png"}
                      ></AvatarImage>
                      <AvatarFallback>
                        {getNameFallBack(
                          user.firstName || "",
                          user.lastName || ""
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">
                        {user.firstName + " " + user.lastName}
                      </p>
                      <p className="text-xs text-base-content">{user.email}</p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={selectedUserId === user._id}
                    onChange={() => toggleSelectUser(user._id!)}
                  />
                </div>
              ))}
          </div>

          {/* Footer */}
          <DialogFooter className="bg-gray-50 px-4 py-3 border-t flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="ghost">Hủy</Button>
            </DialogClose>
            <Button
              disabled={!selectedUserId}
              onClick={async () => {
                if (selectedUserId && conversation) {
                  await changeAdminGroup(conversation._id, selectedUserId);
                  setSelectedUserId(null);
                  setInputValue("");
                }
              }}
            >
              Thay đổi quản trị viên
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
