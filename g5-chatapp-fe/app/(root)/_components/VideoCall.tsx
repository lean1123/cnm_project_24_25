"use client";

import React, { useEffect, useRef } from "react";
import { useCallStore } from "@/store/useCallStore";
import { useAuthStore } from "@/store/useAuthStore";

const VideoCall = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [callType, setCallType] = React.useState<"audio" | "video" | null>(
    "video"
  );

  const { isCallActive, isCallAccepted, handleEndCall } = useCallStore();
  const { user } = useAuthStore();
  const roomID = "demo-room";
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
        turnOnCameraWhenJoining: callType === "video",
        showMyCameraToggleButton: callType === "video",
        showScreenSharingButton: callType === "video",
        showTextChat: false,
        showLeaveRoomConfirmDialog: false,
        showRoomTimer: true,
        showPreJoinView: false,
        showLeavingView: false,
        onLeaveRoom() {
          handleEndCall(roomID); // Gọi hàm kết thúc cuộc gọi khi rời phòng
        },
        onJoinRoom() {},
      });
    };

    init();
  }, [isCallActive, isCallAccepted]); // gọi lại khi trạng thái thay đổi

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
