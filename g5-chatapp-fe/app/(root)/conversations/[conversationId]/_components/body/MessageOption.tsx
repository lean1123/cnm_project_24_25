import { MessageCircleX, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useMessageStore } from "@/store/useMessageStore";
import { Message } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";

type Props = {
  message: Message;
  setIsDropdownOpen: (isOpen: boolean) => void;
  setIsHovered: (isHovered: boolean) => void;
};

export function MessageOption({
  message,
  setIsDropdownOpen,
  setIsHovered,
}: Props) {
  const { deleteMessage, revokeMessage } = useMessageStore();
  const { user } = useAuthStore();
  return (
    <DropdownMenu
      onOpenChange={(open) => {
        setIsDropdownOpen(open);
        if (!open) {
          setIsHovered(false);
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full size-8 bg-background shadow-sm hover:bg-muted"
        >
          <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="2" />
            <circle cx="6" cy="12" r="2" />
            <circle cx="18" cy="12" r="2" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 z-[999]">
        {message.sender._id === user?.id && (
          <>
            <DropdownMenuItem>
              <button
                className="flex items-center gap-2 text-red-500 w-full"
                onClick={() => revokeMessage(message)}
              >
                <MessageCircleX className="size-4" />
                <span>Recall</span>
              </button>
            </DropdownMenuItem>
            <Separator />
          </>
        )}
        <DropdownMenuItem>
          <button
            className="flex items-center gap-2 text-red-500 w-full"
            onClick={() => deleteMessage(message)}
          >
            <Trash2 className="size-4" />
            <span>Delete for me only</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
