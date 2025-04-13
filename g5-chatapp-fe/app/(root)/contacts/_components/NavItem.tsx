"use client";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

type Props = {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
};

const NavItem = ({ id, title, icon, path }: Props) => {
  const activePath = usePathname();
  const isActive = activePath === `/contacts${path}`;
  return (
    <Link href={`/contacts/${path}`} className="w-full">
      <Card className={`p-4 flex flex-row items-center gap-4 truncate ${isActive ? "bg-secondary/65" : "" }`} id={id}>
        {icon}
        <h4 className="truncate">{title}</h4>
      </Card>
    </Link>
  );
};

export default NavItem;
