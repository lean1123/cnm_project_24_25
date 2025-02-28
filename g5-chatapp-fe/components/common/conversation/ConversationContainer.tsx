import { Card } from "@/components/ui/card";
import React from "react";

type Props = React.PropsWithChildren<{}>;

const ConversationContainer = ({ children }: Props) => {
  return (
    <Card className="w-full h-[calc(100vh - 32px)] lg:h-full p-2 grid grid-cols-9 gap-2">
      {children}
    </Card>
  );
};

export default ConversationContainer;
