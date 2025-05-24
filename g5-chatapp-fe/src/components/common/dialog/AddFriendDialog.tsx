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
import { useContactStore } from "@/store/useContactStore";
import { useUserStore } from "@/store/useUserStore";
import { MessageCircle, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

export function AddFriendDialog() {
  const [inputValue, setInputValue] = useState("");
  const { searchUsers, searchResults, isSearching } = useUserStore();
  const { contacts, getMyContact, createContact } = useContactStore();

  const handleSearch = async () => {
    await searchUsers(inputValue);
  };

  const checkIsFriend = (userId: string) => {
    if (!contacts) return false;
    return contacts.some(
      (contact) => contact.user._id === userId || contact.contact._id === userId
    );
  };

  const handleSendFriendRequest = async (
    receiverId: string,
    receiverName: string
  ) => {
    // sendFriendRequest(receiverId);
    console.log("Sending friend request to: ", receiverId);
    console.log("Receiver name: ", receiverName);
    await createContact(receiverId, receiverName);
  };

  useEffect(() => {
    getMyContact();
  }, []);

  return (
    <Dialog>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <UserPlus className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent>Kết bạn</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[400px] h-[60vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <DialogTitle className="text-base font-semibold">
              Kết bạn
            </DialogTitle>
          </div>

          {/* Input */}
          <div className="p-4 flex-1">
            <Input
              placeholder="Email or username"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-gray-100"
            />
          </div>
          {/* result */}
          {/* result */}
          {isSearching && (
            <div className="flex items-center justify-center p-4">
              <p className="text-sm text-gray-500">Đang tìm kiếm...</p>
            </div>
          )}
          <div className="flex-grow h-[240px] overflow-y-auto">
            {searchResults &&
              searchResults.length > 0 &&
              searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between gap-2 p-4 border-b border-base-300"
                >
                  <div className="flex items-center gap-2">
                    {/* <img
                      src={user.avatar || "/avatar.png"}
                      alt={user.firstName + " " + user.lastName}
                      className="w-10 h-10 rounded-full"
                    /> */}
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
                  {checkIsFriend(user._id as string) ? (
                    <button className="p-2 bg-base-200 text-base-content rounded-md">
                      <MessageCircle className="size-4" />
                    </button>
                  ) : (
                    <button
                      className="p-2 bg-primary text-base-100 rounded-md"
                      onClick={() =>
                        handleSendFriendRequest(
                          user._id as string,
                          user.firstName + " " + user.lastName
                        )
                      }
                    >
                      <UserPlus className="size-4" />
                    </button>
                  )}
                </div>
              ))}
          </div>

          {/* Footer */}
          <DialogFooter className="bg-gray-50 px-4 py-3 border-t flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="ghost">Hủy</Button>
            </DialogClose>
            <Button onClick={handleSearch}>Tìm</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
