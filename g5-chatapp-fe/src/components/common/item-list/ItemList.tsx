
import { Card } from "@/components/ui/card";
import { useConversation } from "@/hooks/useConversation";
import { cn } from "@/lib/utils";
import React from "react";
import SearchNav from "../search/SearchNav";

type Props = React.PropsWithChildren<{
  title: string;
  action?: React.ReactNode;
}>;

const ItemList = ({ children, title, action }: Props) => {
  const { isActive } = useConversation();
  return (
    <Card
      className={cn("hidden h-full w-full lg:flex-none lg:w-80 p-2", {
        block: !isActive,
        "lg:block": isActive,
      })}
    >
      {/* <div className="mb-4 flex items-center justify-between">
        <SearchNav
          isOpenSearchResult={false}
          setIsOpenSearchResult={() => {}}
        />
      </div> */}
      <div className="w-full h-[85vh] overflow-y-scroll no-scrollbar flex flex-col items-center justify-start gap-2">
        {children}
      </div>
    </Card>
  );
};

export default ItemList;
