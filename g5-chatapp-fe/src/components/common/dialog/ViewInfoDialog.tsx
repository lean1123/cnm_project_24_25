import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toStringFromDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type { User } from "@/types";
import { format } from "date-fns";
import { CalendarIcon, Pencil, PencilLine, Undo } from "lucide-react";
import React, { useEffect, useState } from "react";
type Props = {
  info: User;
};

function ViewInfoDialog({ info }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [dob, setDob] = useState<Date>(new Date());
  useEffect(() => {
    setUser(info);
    if (info?.dob) {
      setDob(new Date(info.dob));
    }
  }, [info]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* <Button variant="outline">Edit Profile</Button> */}
        <div className="space-y-1 hover:bg-gray-100 p-2 cursor-pointer">
          <h4 className="font-medium text-sm leading-none">
            Xem thông tin tài khoản
          </h4>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thông tin tài khoản</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4 transition-transform">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <Avatar className="size-28">
                <AvatarImage src={user?.avatar || "/avatar.png"} alt="User" />
              </Avatar>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="font-semibold text-2xl">
                {user?.firstName + " " + user?.lastName}
              </span>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-between gap-2">
              <span className="text-gray-500">Giới tính</span>
              <span className="font-normal">
                {user?.gender == "male" ? "Nam" : "Nữ"}
              </span>
            </div>
            <div className="flex flex-row justify-between gap-2">
              <span className="text-gray-500">Ngày sinh</span>
              <span className="font-normal">{toStringFromDate(dob)} </span>
              {/* <span className="font-normal">{user?.dob} </span> */}
            </div>
            <div className="flex flex-row justify-between gap-2">
              <span className="text-gray-500">Email</span>
              <span className="font-normal">{user?.email}</span>
            </div>
          </div>
        </div>
        <Separator />
        <DialogFooter className="flex flex-row items-center justify-center">
          {/* <Button variant="outline" onClick={() => setIsEdit(!isEdit)}>
                <PencilLine />
                Cập nhật
              </Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewInfoDialog;
