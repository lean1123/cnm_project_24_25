import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConversationStore } from "@/store/useConversationStore";

export function DissolveGroupDialog() {
  const [open, setOpen] = useState(false);
  const { dissolveGroup, selectedConversation } = useConversationStore();
  const handleDissolveGroup = async () => {
    if (!selectedConversation) return;
    await dissolveGroup(selectedConversation._id!);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-1">
            <DialogTrigger asChild>
              <Button
                className="rounded-full size-8 flex justify-center items-center"
                variant="destructive"
              >
                <Trash2 className="size-4 text-base-content" />
              </Button>
            </DialogTrigger>
          </div>
        </TooltipTrigger>
        <TooltipContent>Giải tán nhóm</TooltipContent>
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bạn có chắc chắn?</DialogTitle>
          <DialogDescription>
            Hành động này sẽ{" "}
            <span className="text-red-500 font-semibold">
              giải tán toàn bộ nhóm
            </span>
            . Tất cả thành viên sẽ bị xóa khỏi nhóm và tài nguyên nhóm sẽ bị
            xóa.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              handleDissolveGroup();
              setOpen(false);
            }}
          >
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
