import {
    MessageCircleX,
    Trash2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useConversationStore } from "@/store/useConversationStore";
import { Message } from "@/types";

type Props = {
    message: Message
};

export function MessageOption({message} : Props) {
    const {deleteMessage, revokeMessage} = useConversationStore();
  return (
    <DropdownMenu>
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
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem>
          <Button variant={"link"} className="flex items-center gap-2 text-red-500" onClick={() => revokeMessage(message)}>
            <MessageCircleX className="size-4" />
            <span>Recall</span>
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem>
        <Button variant={"link"} className="flex items-center gap-2 text-red-500" onClick={() => deleteMessage(message)}>
            <Trash2 className="size-4" />
            <span>Delete for me only</span>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
