import ConversationContainer from "@/components/common/conversation/ConversationContainer";
import { useAuthStore } from "@/store/useAuthStore";
import { useCallStore } from "@/store/useCallStore";
import { useConversationStore } from "@/store/useConversationStore";
import { Info, Loader2, Video } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "./Header";
import Body from "./body/Body";
import ConversationInfo from "./info/ConversationInfo";
import ChatInput from "./input/ChatInput";

type Props = {};

function ConversationPage(props: Props) {
  const { selectedConversation, getConversation, setSelectedUser } =
    useConversationStore();

  const [conversationId, setConversationId] = useState<string | null>(
    selectedConversation?._id || null
  );

  useEffect(() => {
    setConversationId(selectedConversation?._id || null);
  }, [selectedConversation]);

  const { user } = useAuthStore();

  const { handleCall } = useCallStore();
  const [isOpenRightBar, setIsOpenRightBar] = useState(false);

  useEffect(() => {
    console.log("Conversation ID:", conversationId);
    if (conversationId) {
      getConversation(conversationId);
    }
  }, [conversationId, getConversation]);

  useEffect(() => {
    setIsOpenRightBar(false);
  }, [selectedConversation]);

  const userSelected = selectedConversation?.members.find(
    (member) => member.user._id !== user?._id
  );

  // setSelectedUser(userSelected?.user || null);
  useEffect(() => {
    if (userSelected) {
      setSelectedUser(userSelected.user);
    }
  }, [selectedConversation]);

  const [removeFriendDialogOpen, setRemoveFriendDialogOpen] = useState(false);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [leaveGroupDialogOpen, setLeaveGroupDialogOpen] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video" | null>(null);

  //   if (conversationId === null) {
  //     return (
  //       <div className="w-full h-full flex items-center justify-center">
  //         <Loader2 className="w-8 h-8 animate-spin" />
  //       </div>
  //     );
  //   }

  if (conversationId === null) {
    return (
      <p className="w-full h-full flex items-center justify-center">
        Chọn một cuộc trò chuyện để bắt đầu!
      </p>
    );
  }

  return (
    <ConversationContainer>
      {/* <RemoveFriendDialog
        conversationId={conversationId}
        open={removeFriendDialogOpen}
        setOpen={setRemoveFriendDialogOpen}
      /> */}
      <div
        className={`flex flex-col justify-between ${
          isOpenRightBar ? "col-span-6" : "col-span-9"
        }`}
      >
        {selectedConversation?.isGroup ? (
          <Header
            isGroup={selectedConversation?.isGroup || false}
            name={selectedConversation?.name}
            imageUrl={selectedConversation?.profilePicture || ""}
            numMembers={selectedConversation?.members.length}
            options={[
              // {
              //   label: "Voice call",
              //   icon: <Phone />,
              //   onClick: () =>
              //     handleCall(conversationId, selectedConversation.isGroup),
              // },
              {
                label: "Video call",
                icon: <Video />,
                onClick: () =>
                  handleCall(conversationId, selectedConversation.isGroup),
              },
              {
                label: "Info",
                icon: <Info />,
                onClick: () => setIsOpenRightBar(!isOpenRightBar),
              },
            ]}
          />
        ) : (
          <Header
            isGroup={selectedConversation?.isGroup || false}
            userId={userSelected?.user._id || ""}
            firstName={userSelected?.user.firstName || ""}
            lastName={userSelected?.user.lastName || ""}
            imageUrl={userSelected?.user.avatar || ""}
            options={[
              // {
              //   label: "Voice call",
              //   icon: <Phone />,
              //   onClick: () =>
              //     handleCall(conversationId, selectedConversation!.isGroup),
              // },
              {
                label: "Video call",
                icon: <Video />,
                onClick: () =>
                  handleCall(conversationId, selectedConversation!.isGroup),
              },
              {
                label: "Info",
                icon: <Info />,
                onClick: () => setIsOpenRightBar(!isOpenRightBar),
              },
            ]}
          />
        )}

        <Body />
        <ChatInput />
      </div>
      {selectedConversation?.isGroup ? (
        <ConversationInfo
          isOpen={isOpenRightBar}
          setOpen={setIsOpenRightBar}
          isGroup={true}
        />
      ) : (
        <ConversationInfo
          isOpen={isOpenRightBar}
          setOpen={setIsOpenRightBar}
          isGroup={false}
        />
      )}
    </ConversationContainer>
  );
}

export default ConversationPage;
