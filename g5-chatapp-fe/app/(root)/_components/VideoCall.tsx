"use client";

import React, { useEffect, useRef } from "react";
import { useCallStore } from "@/store/useCallStore";
import { useAuthStore } from "@/store/useAuthStore";

const VideoCall = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [callType, setCallType] = React.useState<"audio" | "video" | null>(
    "video"
  );

  const {
    isCallActive,
    isCallWaiting,
    isCallAccepted,
    handleEndCall,
    handleCancelCall,
    callConversationId,
    isCallGroup
  } = useCallStore();
  const { user } = useAuthStore();
  const roomID = callConversationId || "demo-room"; // Sử dụng ID cuộc gọi thực tế từ store
  const userID = user?._id || "defaultUserID"; // Thay thế bằng ID người dùng thực tế
  const userName = user?.firstName + " " + user?.lastName || "defaultUserName"; // Thay thế bằng tên người dùng thực tế

  useEffect(() => {
    if (!isCallActive || !isCallAccepted) return;

    const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "0");
    if (!appID) {
      throw new Error("NEXT_PUBLIC_ZEGO_APP_ID is not defined or invalid.");
    }
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "";

    const init = async () => {
      const { ZegoUIKitPrebuilt } = await import(
        "@zegocloud/zego-uikit-prebuilt"
      );

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: containerRef.current!,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        // turnOnCameraWhenJoining: callType === "video",
        // showMyCameraToggleButton: callType === "video",
        // showScreenSharingButton: callType === "video",
        showTextChat: false,
        showLeaveRoomConfirmDialog: false,
        showRoomTimer: true,
        showPreJoinView: false,
        showLeavingView: false,
        onLeaveRoom() {
          handleEndCall(roomID, isCallGroup); // Gọi hàm kết thúc cuộc gọi khi rời phòng
        },
        onJoinRoom() {},
      });
    };

    init();
  }, [isCallActive, isCallAccepted, isCallWaiting]); // gọi lại khi trạng thái thay đổi

  const shouldShowWaiting = isCallActive && isCallWaiting && !isCallAccepted;

  if (shouldShowWaiting) {
    return (
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
        <p className="text-white">Waiting for the other person to join...</p>
        <button
          className="bg-red-500 p-2 rounded-full"
          onClick={() => handleCancelCall(callConversationId!, isCallGroup)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    );
  }
  // ⛔️ Ẩn component hoàn toàn nếu không active hoặc chưa accept
  if (!isCallActive || !isCallAccepted) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 w-full h-full z-[9999]"
    />
  );
};

export default VideoCall;
