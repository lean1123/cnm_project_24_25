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
import { useAuthStore } from "@/store/useAuthStore";
import { useConversationStore } from "@/store/useConversationStore";
import { useMessageStore } from "@/store/useMessageStore";
import type { Conversation, Message } from "@/types";
import { Forward } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
  messageToForward: Message | null;
};

const ForwardMessageDialog = ({ messageToForward }: Props) => {
  const { getConversations, conversations, selectedConversation } =
    useConversationStore();
  const { forwardMessage } = useMessageStore();
  const [inputValue, setInputValue] = React.useState("");
  const { user } = useAuthStore();
  const [selectedConversationId, setSelectedConversationId] = useState<
    String[]
  >([]);

  const getMemberName = (conversation: Conversation) => {
    if (conversation.members[0].user._id !== user?.id) {
      return (
        conversation.members[0].user.firstName +
        " " +
        conversation.members[0].user.lastName
      );
    }
    return (
      conversation.members[1].user.firstName +
      " " +
      conversation.members[1].user.lastName
    );
  };

  const filterConversations = () => {
    return conversations.filter((conversation) => {
      // Bỏ qua cuộc trò chuyện đang được chọn
      if (conversation._id === selectedConversation?._id) {
        return false;
      }

      // Nếu không có input, trả về tất cả trừ selectedConversation
      if (inputValue.length === 0) {
        return true;
      }

      const memberName = getMemberName(conversation).toLowerCase();
      return memberName.includes(inputValue.toLowerCase());
    });
  };

  const filteredConversations = filterConversations();

  const getAvatarUrl = (conversation: Conversation) => {
    if (conversation.members[0].user._id !== user?.id) {
      return conversation.members[0].user.avatar;
    }
    return conversation.members[1].user.avatar;
  };

  const handleForwardMessage = async () => {
    if (messageToForward) {
      if (selectedConversationId.length < 1) {
        toast.error(
          "Vui lòng chọn ít nhất một cuộc trò chuyện để chuyển tiếp."
        );
        return;
      }
      forwardMessage(messageToForward._id, selectedConversationId as string[]);
    }
  };
  return (
    <Dialog>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full size-8 bg-background shadow-sm hover:bg-muted"
            >
              <Forward className="size-4" />
            </Button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent>Chuyển tiếp</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[400px] h-[60vh] p-0 ">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <DialogTitle className="text-base font-semibold">
              <div className="flex items-center gap-2">
                <Forward className="size-4" />
                Chuyển tiếp tin nhắn
              </div>
            </DialogTitle>
          </div>

          {/* Input */}
          <div className="p-4">
            <Input
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-gray-100"
            />
          </div>
          {/* result */}
          <div className="h-[240px] overflow-y-scroll no-scrollbar">
            {filteredConversations &&
              filteredConversations.length > 0 &&
              filteredConversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className="flex items-center justify-between gap-2 p-4 border-b border-base-300"
                >
                  {conversation.isGroup ? (
                    <div className="flex items-center gap-2">
                      {/* <img
                      src={user.avatar || "/avatar.png"}
                      alt={user.firstName + " " + user.lastName}
                      className="w-10 h-10 rounded-full"
                    /> */}
                      <Avatar>
                        <AvatarImage
                          src={conversation.profilePicture || "/group.jpg"}
                        ></AvatarImage>
                        <AvatarFallback></AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">
                          {conversation.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* <img
                      src={user.avatar || "/avatar.png"}
                      alt={user.firstName + " " + user.lastName}
                      className="w-10 h-10 rounded-full"
                    /> */}
                      <Avatar>
                        <AvatarImage
                          src={getAvatarUrl(conversation) || "/avatar.png"}
                        ></AvatarImage>
                        <AvatarFallback></AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">
                          {getMemberName(conversation)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedConversationId.includes(
                        conversation._id
                      )}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedConversationId((prev) => [
                            ...prev,
                            conversation._id,
                          ]);
                        } else {
                          setSelectedConversationId((prev) =>
                            prev.filter((id) => id !== conversation._id)
                          );
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
          </div>

          {/* Footer */}
          <DialogFooter className="bg-gray-50 px-4 py-3 border-t flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="ghost">Hủy</Button>
            </DialogClose>
            <Button onClick={handleForwardMessage}>Chuyển tiếp</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForwardMessageDialog;
