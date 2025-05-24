
import { useMemo } from "react";
import { useParams } from "react-router-dom";

export const useConversation = () => {
  const params = useParams();

  const conversationId = useMemo(
    () => params?.conversationId || ("" as string),
    [params?.conversationId]
  );

  const isActive = useMemo(() => !!conversationId, [conversationId]);

  return { conversationId, isActive };
};
