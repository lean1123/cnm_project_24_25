import React, { useEffect } from "react";
import ContactContainer from "../common/contact/ContactContainer";
import Filter from "./Filter";
import { useContactStore } from "@/store/useContactStore";
import FriendItem from "./FriendItem";
import { useAuthStore } from "@/store/useAuthStore";
import NewRequestItem from "./NewRequestItem";
import { Separator } from "../ui/separator";
import PendingRequestItem from "./PendingRequestItem";
import GroupItem from "./GroupItem";
import { Loader2 } from "lucide-react";

type Props = {};

const groups = [
  {
    id: 1,
    title: "Group 1",
    avatar: "https://via.placeholder.com/150",
    numberOfMembers: 5,
  },
  {
    id: 2,
    title: "Group 2",
    avatar: "https://via.placeholder.com/150",
    numberOfMembers: 10,
  },
  {
    id: 3,
    title: "Group 3",
    avatar: "https://via.placeholder.com/150",
    numberOfMembers: 15,
  },
  {
    id: 4,
    title: "Group 4",
    avatar: "https://via.placeholder.com/150",
    numberOfMembers: 20,
  },
];

const ContactPage = (props: Props) => {
  const [showListFriends, setShowListFriends] = React.useState(false);
  const [showListRequests, setShowListRequests] = React.useState(false);
  const [showListGroups, setShowListGroups] = React.useState(false);
  const {
    contacts,
    getMyContact,
    myPendingContact,
    myRequestContact,
    getListPendingContact,
    getListRequestContact,
    selectedContactPage,
  } = useContactStore();
  const { user } = useAuthStore();
  useEffect(() => {
    getMyContact();
    getListPendingContact();
    getListRequestContact();
  }, []);
  useEffect(() => {
    if (selectedContactPage === "friends") {
      setShowListFriends(true);
      setShowListRequests(false);
      setShowListGroups(false);
    } else if (selectedContactPage === "requests") {
      setShowListFriends(false);
      setShowListRequests(true);
      setShowListGroups(false);
    } else if (selectedContactPage === "groups") {
      setShowListFriends(false);
      setShowListRequests(false);
      setShowListGroups(true);
    }
  }, [selectedContactPage]);

  const [search, setSearch] = React.useState("");
  const [sortOption, setSortOption] = React.useState("a-z");

  const [filteredContacts, setFilteredContacts] = React.useState(contacts);

  useEffect(() => {
    if (!contacts || !user) return;

    let filtered = contacts.filter((contact) => {
      const contactInfo =
        contact.contact._id === user._id ? contact.user : contact.contact;
      return (
        `${contactInfo.firstName} ${contactInfo.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        contactInfo.email.toLowerCase().includes(search.toLowerCase())
      );
    });

    // Sort theo sortOption
    filtered.sort((a, b) => {
      const aName =
        a.contact._id === user._id
          ? `${a.user.lastName} ${a.user.firstName}`
          : `${a.user.lastName} ${a.user.firstName}`;
      const bName =
        b.contact._id === user._id
          ? `${b.user.lastName} ${b.user.firstName}`
          : `${b.user.lastName} ${b.user.firstName}`;

      return sortOption === "a-z"
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName);
    });

    setFilteredContacts(filtered);
  }, [search, contacts, user, sortOption]);

  if (showListFriends)
    return (
      <ContactContainer title="Danh sách bạn bè">
        <Filter
          search={search}
          setSearch={setSearch}
          sortOption={sortOption}
          setSortOption={setSortOption}
        />
        <div className="mt-4 flex flex-col w-full">
          {filteredContacts.map((contact) => (
            <FriendItem
              key={contact._id}
              info={
                contact.contact._id === user?._id
                  ? contact.user
                  : contact.contact
              }
              contactId={contact._id}
            />
          ))}
        </div>
      </ContactContainer>
    );
  if (showListRequests)
    return (
      <ContactContainer title="Yêu cầu kết bạn">
        <div className="mt-4 flex flex-col w-full">
          <h4 className="text-xl font-semibold tracking-tight mb-4">
            Lời mời kết bạn mới
          </h4>
          {myRequestContact.map((request) => (
            <NewRequestItem key={request._id} {...request} />
          ))}
          {myRequestContact.length === 0 && (
            <div className="flex items-center justify-center w-full h-full p-4 text-gray-500">
              Không có lời mời kết bạn mới
            </div>
          )}
        </div>
        <Separator className="mt-4" />
        <div className="mt-4 flex flex-col w-full">
          <h4 className="text-xl font-semibold tracking-tight mb-4">
            Yêu cầu kết bạn đang chờ xác nhận
          </h4>
          {myPendingContact.map((request) => (
            <PendingRequestItem key={request._id} {...request} />
          ))}
          {myPendingContact.length === 0 && (
            <div className="flex items-center justify-center w-full h-full p-4 text-gray-500">
              Không có yêu cầu kết bạn đang chờ xác nhận
            </div>
          )}
        </div>
      </ContactContainer>
    );
  if (showListGroups)
    return (
      <ContactContainer title="Joined groups">
        {/* <Filter /> */}
        <div className="mt-4 flex flex-col w-full">
          {groups.map((group) => (
            <GroupItem key={group.id} {...group} />
          ))}
        </div>
      </ContactContainer>
    );
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
    </div>
  );
};

export default ContactPage;
