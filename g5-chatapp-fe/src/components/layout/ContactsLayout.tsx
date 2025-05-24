import ItemList from "@/components/common/item-list/ItemList";
import { ContactRound, Loader2, UserRoundPlus } from "lucide-react";
import React from "react";
import NavItem from "../contacts/NavItem";

type Props = React.PropsWithChildren<{}>;

const nav = [
  {
    id: "1a2b3c",
    icon: <ContactRound />,
    title: "Danh sách bạn bè",
    page: "friends",
  },
  // {
  //   id: "4d5e6f",
  //   icon: <UsersRound />,
  //   title: "Joined groups",
  //   path: "/groups",
  // },
  {
    id: "7g8h9i",
    icon: <UserRoundPlus />,
    title: "Yêu cầu kết bạn",
    page: "requests",
  },
];

const ContactsLayout = ({ children }: Props) => {
  // const { getListPendingContact, getListRequestContact, subscribeContact, unsubscribeContact } = useContactStore();
  //   useEffect(() => {
  //     subscribeContact();
  //     return () => {
  //       unsubscribeContact();
  //     };
  //   }, [subscribeContact, unsubscribeContact]);
  return (
    <>
      <ItemList title="Contacts">
        {nav && nav.length > 0 ? (
          nav.map((item) => (
            <NavItem
              key={item.id}
              id={item.id}
              title={item.title}
              icon={item.icon}
              page={item.page}
            />
          ))
        ) : (
          <Loader2 className="w-8 h-8 animate-spin" />
        )}
      </ItemList>
      {children}
    </>
  );
};

export default ContactsLayout;
