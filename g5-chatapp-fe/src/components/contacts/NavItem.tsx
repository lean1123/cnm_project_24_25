import { Card } from "@/components/ui/card";
import { useContactStore } from "@/store/useContactStore";

import React, { useEffect } from "react";
import { Link } from "react-router-dom";

type Props = {
  id: string;
  title: string;
  icon: React.ReactNode;
  page: string;
};

const NavItem = ({ id, title, icon, page }: Props) => {
  // const activePath = usePathname();
  const { selectedContactPage, setSelectedContactPage } = useContactStore();
  const isActive = selectedContactPage === page;
  const handleClick = () => {
    setSelectedContactPage(page);
  };
  return (
    <div onClick={handleClick} className="w-full">
      <Card
        className={`p-4 flex flex-row items-center gap-4 truncate ${
          isActive ? "bg-secondary/65" : ""
        }`}
        id={id}
      >
        {icon}
        <h4 className="truncate">{title}</h4>
      </Card>
    </div>
  );
};

export default NavItem;
