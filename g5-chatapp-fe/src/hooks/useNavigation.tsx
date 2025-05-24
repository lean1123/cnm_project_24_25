import {
  MessageCircleMore,
  UsersRound
} from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export const useNavigation = () => {
  const pathname = useLocation().pathname;

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
