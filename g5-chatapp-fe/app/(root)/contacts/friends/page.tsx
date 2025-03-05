import ContactContainer from "@/components/common/contact/ContactContainer";
import Filter from "../_components/Filter";
import FriendItem from "./_components/FriendItem";

type Props = {};

const friends = [
  {
    id: 1,
    name: "John Doe",
    avatar:
      "https://th.bing.com/th/id/OIP.Zvs5IHgOO5kip7A32UwZJgHaHa?rs=1&pid=ImgDetMain",
    state: "Online",
  },
  {
    id: 2,
    name: "Jane Doe",
    avatar:
      "https://th.bing.com/th/id/OIP.Zvs5IHgOO5kip7A32UwZJgHaHa?rs=1&pid=ImgDetMain",
    state: "Offline",
  },
  {
    id: 3,
    name: "John Smith",
    avatar:
      "https://th.bing.com/th/id/OIP.Zvs5IHgOO5kip7A32UwZJgHaHa?rs=1&pid=ImgDetMain",
    state: "Online",
  },
  {
    id: 4,
    name: "Jane Smith",
    avatar: "",
    state: "Offline",
  },
];

const FriendsPage = (props: Props) => {
  return (
    <ContactContainer title="Friends list">
      {/* filter */}
      <Filter />
      {/* list contact */}
      <div className="mt-4 flex flex-col w-full">
        {friends.map((friend) => (
          <FriendItem key={friend.id} {...friend} />
        ))}
      </div>
    </ContactContainer>
  );
};

export default FriendsPage;
