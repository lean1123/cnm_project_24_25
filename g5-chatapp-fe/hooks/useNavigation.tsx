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
        name: "Contacts",
        href: "/contacts/friends",
        icon: <UsersRound />,
        active: pathname.startsWith("/contacts"),
        count: 2,
      },
    ],
    [pathname]
  );

  return { paths };
};
