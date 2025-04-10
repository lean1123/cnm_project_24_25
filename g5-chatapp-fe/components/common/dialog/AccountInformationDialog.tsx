"use client";

import React, { useEffect, useState } from "react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  ChevronLeft,
  Pencil,
  PencilLine,
  Undo,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useAuthStore } from "@/store/useAuthStore";
type Props = {};

function AccountInformationDialog({}: Props) {
  const [isEdit, setIsEdit] = useState(false);
  const [date, setDate] = useState<Date>(new Date("2003-11-11"));
  const { user, getMyProfile } = useAuthStore();
  useEffect(() => {
    getMyProfile();
  }, []);
  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* <Button variant="outline">Edit Profile</Button> */}
        <div className="space-y-1 hover:bg-gray-100 p-2 cursor-pointer">
          <h4 className="font-medium text-sm leading-none">
            Account information
          </h4>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {isEdit ? (
            <DialogTitle
              onClick={() => setIsEdit(!isEdit)}
              className="cursor-pointer"
            >
              {" "}
              {"<"} Edit your profile information
            </DialogTitle>
          ) : (
            <DialogTitle>Profile</DialogTitle>
          )}
        </DialogHeader>

        {!isEdit ? (
          <>
            <div className="flex flex-col gap-4 py-4 transition-transform">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <Avatar className="size-28">
                    {/* <AvatarImage src={user?.id} alt="User" /> */}
                    <AvatarFallback className="text-4xl">
                      {getInitials(user?.firstName + " " + user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant={"outline"}
                    className="rounded-full p-3 border bg-background text-black absolute bottom-0 right-0"
                  >
                    <Pencil />
                  </Button>
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
                  <span className="text-gray-500">Gender</span>
                  <span className="font-normal">{user?.gender}</span>
                </div>
                <div className="flex flex-row justify-between gap-2">
                  <span className="text-gray-500">Birthday</span>
                  <span className="font-normal">
                    {date.getDate() +
                      "/" +
                      date.getMonth() +
                      "/" +
                      date.getFullYear()}
                  </span>
                </div>
                <div className="flex flex-row justify-between gap-2">
                  <span className="text-gray-500">Email</span>
                  <span className="font-normal">{user?.email}</span>
                </div>
              </div>
            </div>
            <Separator />
            <DialogFooter className="flex flex-row items-center justify-center">
              <Button variant="outline" onClick={() => setIsEdit(!isEdit)}>
                <PencilLine />
                Update
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label>Display name</Label>
                <Input placeholder="" defaultValue={user?.firstName} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Gender</Label>
                <RadioGroup defaultValue="male" className="flex flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="r2" />
                    <Label htmlFor="r2">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="r3" />
                    <Label htmlFor="r3">Female</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Birthday</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(day) => day && setDate(day)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Separator />
            <DialogFooter className="flex flex-row items-center justify-center">
              <Button variant="outline" onClick={() => setIsEdit(!isEdit)}>
                <Undo />
                Cancel
              </Button>
              <Button variant="default">Update</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AccountInformationDialog;
