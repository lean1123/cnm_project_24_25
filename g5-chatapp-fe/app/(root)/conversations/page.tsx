import ConversationContainer from "@/components/common/conversation/ConversationContainer";
import React from "react";

type Props = {};

const ConversationsPage = (props: Props) => {
  return (
    <ConversationContainer>
      <p className="w-full h-full flex items-center justify-center col-span-9">
        Select/start a conversation to get started!
      </p>
    </ConversationContainer>
  );
};

export default ConversationsPage;
