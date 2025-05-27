import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { decryptMessage } from "@/lib/securityMessage";
import { useAuthStore } from "@/store/useAuthStore";
import { useConversationStore } from "@/store/useConversationStore";
import { useMessageStore } from "@/store/useMessageStore";
import type { Conversation, LastMessage } from "@/types";

type Props = {
  id: string;
  imageUrl: string;
  name: string;
  lastMessage: LastMessage | null;
  conversation: Conversation | null;
};

const ConversationItem = ({
  id,
  imageUrl,
  name,
  lastMessage,
  conversation,
}: Props) => {
  const { user } = useAuthStore();
  const { selectedConversation, setSelectedConversation } =
    useConversationStore();
  const { clearMessages } = useMessageStore();
  const handleClick = () => {
    setSelectedConversation(conversation as Conversation);
    clearMessages();
  };
  const isActive = selectedConversation?._id === id;
  const isLocationMessage = (message: LastMessage) => {
    if (!message) return false;
    if (message.type === "TEXT") {
      const decryptedContent = decryptMessage(
        message.content,
        selectedConversation?._id || "123123"
      );
      return (
        decryptedContent && /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(decryptedContent)
      );
    }
    return false;
  };
  return (
    <div onClick={handleClick} className="w-full cursor-pointer" id={id}>
      <Card
        className={`p-2 flex flex-row items-center gap-4 truncate ${
          isActive ? "bg-secondary/65" : ""
        }`}
      >
        <div className="flex flex-row items-center gap-4 truncate">
          <Avatar>
            <AvatarImage src={imageUrl || "/avatar.png"} alt={name} />
            {/* <AvatarFallback>{getInitials(name)}</AvatarFallback> */}
          </Avatar>
          <div className="flex flex-col truncate">
            <h4 className="truncate">{name}</h4>
            {lastMessage ? (
              <span className="text-sm text-muted-foreground flex truncate overflow-ellipsis">
                <p
                  className={`font-semibold ${
                    lastMessage.sender._id === user?._id ? "pr-1" : ""
                  }`}
                >
                  {lastMessage.sender._id === user?._id ? "Bạn:" : ""}
                </p>
                {lastMessage.type === "VIDEO" &&
                  lastMessage.files &&
                  lastMessage.files.length > 0 && (
                    <p className="text-sm text-muted-foreground truncate">
                      {`Đã gửi video`}
                    </p>
                  )}
                {lastMessage.type === "IMAGE" &&
                  lastMessage.files &&
                  lastMessage.files.length == 1 && (
                    <p className="text-sm text-muted-foreground truncate">
                      {`Đã gửi một ảnh`}
                    </p>
                  )}
                {lastMessage.type === "IMAGE" &&
                  lastMessage.files &&
                  lastMessage.files.length > 1 && (
                    <p className="text-sm text-muted-foreground truncate">
                      {`Đã gửi ${lastMessage.files.length} ảnh`}
                    </p>
                  )}
                {lastMessage.type === "FILE" &&
                  lastMessage.files &&
                  lastMessage.files.length > 0 && (
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMessage.files[0].fileName}
                    </p>
                  )}
                {/* {lastMessage.type === "FILE" &&
                  lastMessage.files &&
                  lastMessage.files.length > 1 && (
                    <p className="text-sm text-muted-foreground truncate">
                      {`Send ${lastMessage.files.length} files`}
                    </p>
                  )} */}
                {lastMessage.type === "TEXT" &&
                  !isLocationMessage(lastMessage) && (
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMessage.forwardFromConversation != null
                        ? decryptMessage(
                            lastMessage.content,
                            lastMessage.forwardFromConversation || "123123"
                          )
                        : decryptMessage(
                            lastMessage.content,
                            conversation?._id || "123123"
                          )}
                    </p>
                  )}

                {lastMessage.type === "TEXT" &&
                  isLocationMessage(lastMessage) && (
                    <p className="text-sm text-muted-foreground truncate">
                      {`Đã gửi một vị trí`}
                    </p>
                  )}
                {lastMessage.type === "AUDIO" &&
                  lastMessage.files &&
                  lastMessage.files.length > 0 && (
                    <p className="text-sm text-muted-foreground truncate">
                      {`Đã gửi một tin nhắn thoại`}
                    </p>
                  )}
                {lastMessage.type === "LOCATION" && lastMessage.content && (
                  <p className="text-sm text-muted-foreground truncate">
                    {`Đã gửi một vị trí`}
                  </p>
                )}
                {lastMessage.type === "CONTACT" && lastMessage.content && (
                  <p className="text-sm text-muted-foreground truncate">
                    {`Đã gửi một liên hệ`}
                  </p>
                )}
                {lastMessage.type === "STICKER" && lastMessage.content && (
                  <p className="text-sm text-muted-foreground truncate">
                    {`Đã gửi một sticker`}
                  </p>
                )}
                {lastMessage.type === "REACT" && lastMessage.content && (
                  <p className="text-sm text-muted-foreground truncate">
                    {`Đã thả cảm xúc ${lastMessage.content}`}
                  </p>
                )}
                {lastMessage.type === "CALL" && lastMessage.content && (
                  <p className="text-sm text-muted-foreground truncate">
                    {`Call ${lastMessage.content}`}
                  </p>
                )}
              </span>
            ) : (
              <p className="text-sm text-muted-foreground truncate">
                Cuộc trò chuyện mới!
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ConversationItem;
