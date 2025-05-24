import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConversation } from "@/hooks/useConversation";
import { useNavigation } from "@/hooks/useNavigation";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

const MobileNav = () => {
  const paths = useNavigation();

  const { isActive } = useConversation();

  if (isActive) return null;

  return (
    <Card className="fixed bottom-4 w-[calc(100%-32px)] lg:hidden flex items-center px-4 py-2">
      <nav className="w-full">
        <ul className="flex justify-evenly items-center">
          {paths.paths.map((path, id) => {
            return (
              <li key={id} className="relative">
                <Link to={path.href}>
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
                          <Badge className="absolute left-7 bottom-6">
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
          <li className="flex flex-col items-center gap-4">
            <User />
          </li>
        </ul>
      </nav>
    </Card>
  );
};

export default MobileNav;
