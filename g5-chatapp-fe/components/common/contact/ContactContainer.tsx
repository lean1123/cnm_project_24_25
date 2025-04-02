import { Card } from "@/components/ui/card";
import React from "react";

type Props = React.PropsWithChildren<{
  title: string;
}>;

const ContactContainer = ({ children, title }: Props) => {
  return (
    <Card className="w-full h-[calc(100vh - 32px)] lg:h-full p-2 flex flex-col">
      <h1 className="text-2xl font-semibold tracking-tight mb-4">{title}</h1>
      {children}
    </Card>
  );
};

export default ContactContainer;
