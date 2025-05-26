import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useContactStore } from "@/store/useContactStore";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type UnfriendDialogProps = {
  contactId: string;
};

export function UnfriendDialog({ contactId }: UnfriendDialogProps) {
  const [open, setOpen] = useState(false);
  const { unfriend } = useContactStore();
  const handleUnfriend = async () => {
    await unfriend(contactId);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="text-red-500 font-medium text-sm leading-none">Hủy kết bạn</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bạn có chắc chắn?</DialogTitle>
          <DialogDescription>
            Hành động này sẽ{" "}
            <span className="text-red-500 font-semibold">xóa</span>
            kết bạn với người dùng này. Bạn sẽ không thể trò chuyện với họ
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              handleUnfriend();
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
