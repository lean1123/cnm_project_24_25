"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Pencil, UserPlus, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useContactStore } from "@/store/useContactStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getNameFallBack } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "@/types";
import { useConversationStore } from "@/store/useConversationStore";

export function CreateGroupDialog() {
  const [inputValue, setInputValue] = useState("");
  const { searchUsers, isSearching } = useUserStore();
  const { contacts, getMyContact } = useContactStore();
  const {
    membersCreateGroup,
    addMemberCreateGroup,
    removeMemberCreateGroup,
    createGroup,
  } = useConversationStore();
  const router = useRouter();
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  const [friends, setFriends] = useState<User[]>([]);

  const handleCreateGroup = async () => {
    if (!name || !membersCreateGroup || membersCreateGroup.length < 2) return;
    const groupMembers = membersCreateGroup
      .map((member) => member._id)
      .filter((id): id is string => id !== undefined);
    const groupData = {
      name,
      members: groupMembers,
    };
    await createGroup(groupData);
    setName(null);
    setFile(null);
  };

  const getFriends = () => {
    console.log("getFriends");
    if (!contacts) return;
    const friendsList = contacts.map((contact) => {
      return contact.user._id === user?.id ? contact.contact : contact.user;
    });
    setFriends(friendsList);
  };

  const checkIsFriend = (userId: string) => {
    if (!contacts) return false;
    return contacts.some(
      (contact) => contact.user._id === userId || contact.contact._id === userId
    );
  };

  // useEffect(() => {
  //   getMyContact(); // gọi để load dữ liệu contacts từ store
  // }, [contacts, getMyContact]);

  useEffect(() => {
    if (!contacts || contacts.length === 0) return;
    const friendsList = contacts.map((contact) => {
      return contact.user._id === user?.id ? contact.contact : contact.user;
    });
    setFriends(friendsList);
  }, [contacts, user?.id]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isCheckSelected = (userId: string) => {
    return membersCreateGroup.some((member) => member._id === userId);
  };

  const handleAddMember = (member: User) => {
    addMemberCreateGroup(member);
  };

  const handleRemoveMember = (member: User) => {
    removeMemberCreateGroup(member);
  };

  const friendFilter = useMemo(() => {
    return friends.filter((friend) => {
      const fullName = `${friend.firstName} ${friend.lastName}`.toLowerCase();
      const email = friend.email?.toLowerCase() || "";
      const query = inputValue.toLowerCase();

      return (
        inputValue === "" || fullName.includes(query) || email.includes(query)
      );
    });
  }, [friends, inputValue]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Users className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[80vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <DialogTitle className="text-base font-semibold">
              Create a group
            </DialogTitle>
          </div>
          {/* info group */}
          <div className="flex items-center justify-start gap-4 px-4 pt-4">
            <div className="relative rounded-full border">
              <Avatar
                className="size-14 cursor-pointer"
                onClick={() => {
                  document.getElementById("avatar-upload")?.click();
                }}
              >
                <AvatarImage
                  src={previewUrl || "/camera.jpg"}
                  alt="User"
                  className=""
                />
              </Avatar>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <input
              placeholder="Enter group name "
              className="w-full outline-none border-b-2 border-gray-300 focus:border-primary focus:ring-0 pb-3"
              value={name || ""}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {/* Search */}
          <div className="p-4">
            <Input
              placeholder="Email or username"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-gray-100"
            />
          </div>
          {/* result */}
          <div className="flex-grow grid grid-cols-5">
            {/* left */}
            <div className="col-span-3 overflow-y-scroll h-[320px] no-scrollbar">
              {friendFilter &&
                friendFilter.map((contact, idx) => (
                  <div
                    key={contact._id}
                    className={`flex items-center justify-start gap-2 p-4 border-t border-base-300 ${
                      idx === 0 ? "border-t-0" : ""
                    }`}
                  >
                    {/* checkbox */}
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={isCheckSelected(contact._id || "")}
                      onChange={() =>
                        isCheckSelected(contact._id || "")
                          ? handleRemoveMember(contact)
                          : handleAddMember(contact)
                      }
                    />
                    <div className="flex items-center gap-2">
                      <img
                        src={contact.avatar || "/avatar.png"}
                        alt={contact._id}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-semibold">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p className="text-xs text-base-content">
                          {contact.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            {/* right */}
            <div className="col-span-2 border-l border-base-300">
              <div className="text-sm font-semibold p-2">
                Selected
                <span className="ml-2 px-2 rounded-full bg-primary/30 text-primary">
                  {membersCreateGroup.length}/10
                </span>
              </div>
              {membersCreateGroup.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between gap-2 p-1 bg-primary/5 mx-2 rounded-full"
                >
                  <div className="flex items-center gap-2 ">
                    <img
                      src={member.avatar || "/avatar.png"}
                      alt="avatar"
                      className="size-5 rounded-full border border-primary"
                    />
                    <div>
                      <p className="text-xs font-semibold text-primary">
                        {member.firstName} {member.lastName}
                      </p>
                    </div>
                  </div>
                  <button
                    className="bg-primary text-base-100 rounded-full"
                    onClick={() => handleRemoveMember(member)}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="bg-gray-50 px-4 py-3 border-t flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                handleCreateGroup();
                console.log("membersCreateGroup", membersCreateGroup);
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
