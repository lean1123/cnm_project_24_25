import {
  MessageCircle,
  MessageCircleDashed,
  MessageCircleMore,
  MessageSquare,
  Users,
  UsersRound,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export const useNavigation = () => {
  const pathname = usePathname();

  const paths = useMemo(
    () => [
      {
        name: "Conversations",
        href: "/conversations",
        icon: <MessageCircleMore />,
        active: pathname.startsWith("/conversations"),
      },
      {
        name: "Friends",
        href: "/friends",
        icon: <UsersRound />,
        active: pathname.startsWith("/friends"),
        count: 2,
      },
    ],
    [pathname]
  );

  return { paths };
};
