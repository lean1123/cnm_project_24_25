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
import { format } from "date-fns";
import { CalendarIcon, Pencil, PencilLine, Undo } from "lucide-react";
import React, { useEffect, useState } from "react";
type Props = {};

function AccountInformationDialog({}: Props) {
  const [isEdit, setIsEdit] = useState(false);
  const { user, getMyProfile, changeAvatar, updateProfile } = useAuthStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("male");
  const [dob, setDob] = useState<Date>(new Date());
  useEffect(() => {
    getMyProfile();
    setDob(new Date(user?.dob!));
    setFirstName(user?.firstName!);
    setLastName(user?.lastName!);
    setGender(user?.gender || "male");
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      changeAvatar(file);
    }
  };

  const handleUpdateProfile = async () => {
    const data = {
      firstName,
      lastName,
      gender,
      dob: dob.toISOString(),
    };
    await updateProfile(data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* <Button variant="outline">Edit Profile</Button> */}
        <div className="space-y-1 hover:bg-gray-100 p-2 cursor-pointer">
          <h4 className="font-medium text-sm leading-none">
            Thông tin tài khoản
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
              {"<"} Chỉnh sửa thông tin tài khoản
            </DialogTitle>
          ) : (
            <DialogTitle>Thông tin tài khoản</DialogTitle>
          )}
        </DialogHeader>

        {!isEdit ? (
          <>
            <div className="flex flex-col gap-4 py-4 transition-transform">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <Avatar className="size-28">
                    <AvatarImage
                      src={user?.avatar || "/avatar.png"}
                      alt="User"
                    />
                  </Avatar>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button
                    variant={"outline"}
                    className="rounded-full p-3 border bg-background text-black absolute bottom-0 right-0"
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
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
                  <span className="text-gray-500">Giới tính</span>
                  <span className="font-normal">
                    {user?.gender == "male" ? "Nam" : "Nữ"}
                  </span>
                </div>
                <div className="flex flex-row justify-between gap-2">
                  <span className="text-gray-500">Ngày sinh</span>
                  <span className="font-normal">{toStringFromDate(dob)} </span>
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
                Cập nhật
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label>Tên</Label>
                <Input
                  placeholder=""
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Họ</Label>
                <Input
                  placeholder=""
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Giới tính</Label>
                <RadioGroup
                  value={gender}
                  onValueChange={setGender}
                  className="flex flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="r2" />
                    <Label htmlFor="r2">Nam</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="r3" />
                    <Label htmlFor="r3">Nữ</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Ngày sinh</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon />
                      {dob ? format(dob, "PPP") : <span>Chọn ngày</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dob}
                      onSelect={(day) => day && setDob(day)}
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
                Hủy
              </Button>
              <Button variant="default" onClick={() => handleUpdateProfile()}>
                Cập nhật
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AccountInformationDialog;
