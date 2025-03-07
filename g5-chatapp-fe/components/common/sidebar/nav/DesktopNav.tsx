"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigation } from "@/hooks/useNavigation";
import {
  CircleEllipsis,
  CircleUserRound,
  MoreVertical,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const DesktopNav = () => {
  const paths = useNavigation();

  return (
    <Card className="hidden lg:flex lg:flex-col lg:justify-between lg:items-center lg:h-full lg:w-16 lg:px-2 lg:py-4">
      <div className="flex flex-col items-center gap-8">
        <Link href={"/"}>
          <div className="flex flex-col items-center justify-center">
            <Image src="/logo.png" width={40} height={40} alt="Logo" />
            <p className="text-sm font-semibold text-primary">E-chat</p>
          </div>
        </Link>
        <nav>
          <ul className="flex flex-col items-center justify-start h-full gap-4">
            {paths.paths.map((path, id) => {
              return (
                <li key={id} className="relative">
                  <Link href={path.href}>
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
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className="flex flex-col items-center gap-4">
        <CircleEllipsis />
        <CircleUserRound />
      </div>
    </Card>
  );
};

export default DesktopNav;
