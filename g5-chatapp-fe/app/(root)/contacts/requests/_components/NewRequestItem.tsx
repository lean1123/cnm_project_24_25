import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { CircleCheck, CircleX } from "lucide-react";

type Props = {
  id: number;
  name: string;
  avatar: string;
  sendAt: string;
};

function RequestItem({ id, name, avatar, sendAt }: Props) {
  return (
    <div
      key={id}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold">{name}</span>
          <span className="text-sm text-gray-500">{sendAt}</span>
        </div>
      </div>
      {/* button */}
      <div className="flex items-center gap-2">
        <Button className="bg-background hover:bg-green-500 text-green-500 hover:text-white">
          <CircleCheck size={16} />
          Accept
        </Button>
        <Button className="bg-background hover:bg-red-500 text-red-500 hover:text-white">
          <CircleX size={16} />
          Decline
        </Button>
      </div>
    </div>
  );
}

export default RequestItem;
