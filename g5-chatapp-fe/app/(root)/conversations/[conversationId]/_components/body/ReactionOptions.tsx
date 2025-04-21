"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Smile } from "lucide-react";

const emojiOptions = ["❤️", "😂", "😮", "😢", "😡", "👍", "👎"];

export function MessageReactions({
  message,
  fromCurrentUser,
  onReact,
  onUnreact,
}: {
  message: any;
  fromCurrentUser: boolean;
  onReact: (emoji: string) => void;
  onUnreact: (emoji: string) => void;
}) {
  const userReactions: string[] = message?.reactions?.map((r: any) => r.reaction) || [];

  const handleReaction = (emoji: string) => {
    if (userReactions.includes(emoji)) {
      onUnreact(emoji);
    } else {
      onReact(emoji);
    }
  };

  if (!message || !message.reactions || message.reactions.length === 0) return null;

  return (
    <div
      className={cn(
        "absolute -bottom-2 flex gap-1 z-20 bg-background rounded-full shadow-md p-1",
        {
          "right-auto left-2": fromCurrentUser,
          "right-2": !fromCurrentUser,
        }
      )}
    >
      {/* Các emoji đã được react */}
      {userReactions.map((emoji, index) => (
        <Button
          key={index}
          variant="ghost"
          size="icon"
          className="rounded-full size-6 text-sm hover:bg-muted"
          onClick={() => onUnreact(emoji)}
        >
          {emoji}
        </Button>
      ))}

      {/* Popover chọn emoji */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full size-6 text-muted-foreground hover:bg-muted"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 rounded-xl border shadow-xl bg-background grid grid-cols-4 gap-2">
          {emojiOptions.map((emoji, index) => (
            <button
              key={index}
              className={cn(
                "text-xl p-1 hover:scale-110 transition-transform",
                userReactions.includes(emoji) ? "opacity-50" : ""
              )}
              onClick={() => handleReaction(emoji)}
            >
              {emoji}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
