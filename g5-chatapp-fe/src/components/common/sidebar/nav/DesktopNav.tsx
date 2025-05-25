import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigation } from "@/hooks/useNavigation";

import { Link } from "react-router-dom";
import UserPopover from "../UserPopover";
import { useAuthStore } from "@/store/useAuthStore";
import { MessageCircleMore, UsersRound } from "lucide-react";
import { useState } from "react";

const pathsData = [
  {
    name: "Tin nhắn",
    page: "conversations",
    icon: <MessageCircleMore />,
    active: true,
  },
  {
    name: "Danh bạ",
    page: "contacts",
    icon: <UsersRound />,
    active: false,
    count: 0,
  },
];

const DesktopNav = () => {
  // const paths = useNavigation();
  const { selectedHomePage, setSelectedHomePage } = useAuthStore();
  const [paths, setPaths] = useState(pathsData);
  const handleClick = (path: any) => {
    setSelectedHomePage(path.page);
    setPaths((prev) =>
      prev.map((p) => ({
        ...p,
        active: p.name === path.name,
      }))
    );
  };
  return (
    <Card className="hidden lg:flex lg:flex-col lg:justify-between lg:items-center lg:h-full lg:w-16 lg:px-2 lg:py-4">
      <div className="flex flex-col items-center gap-8">
        <Link to={"/"}>
          <div className="flex flex-col items-center justify-center">
            <img src="/Logo.png" width={40} height={40} alt="Logo" />
            <p className="text-sm font-semibold text-primary">E-chat</p>
          </div>
        </Link>
        <nav>
          <ul className="flex flex-col items-center justify-start h-full gap-4">
            {paths.map((path, id) => {
              return (
                <li key={id} className="relative">
                  <div onClick={() => handleClick(path)}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Button
                            key={id}
                            size={"icon"}
                            variant={path.active ? "default" : "outline"}
                          >
                            {path.icon}
                          </Button>
                          {path.count ? (
                            <Badge className="absolute left-6 bottom-7 px-2">
                              {path.count}
                            </Badge>
                          ) : null}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{path.name}</TooltipContent>
                    </Tooltip>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className="flex flex-col items-center gap-4">
        {/* <CircleEllipsis /> */}
        {/* user */}
        <UserPopover />
      </div>
    </Card>
  );
};

export default DesktopNav;
