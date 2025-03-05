import ContactContainer from "@/components/common/contact/ContactContainer";
import React from "react";
import Filter from "../_components/Filter";
import GroupItem from "./_components/GroupItem";

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

const GroupsPage = (props: Props) => {
  return (
    <ContactContainer title="Joined groups">
      <Filter />
      <div className="mt-4 flex flex-col w-full">
        {groups.map((group) => (
          <GroupItem key={group.id} {...group} />
        ))}
      </div>
    </ContactContainer>
  );
};

export default GroupsPage;
