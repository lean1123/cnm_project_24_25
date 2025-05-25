import React, { useEffect, useRef, useState } from "react";
import { useCallStore } from "@/store/useCallStore";
import { useAuthStore } from "@/store/useAuthStore";

const CALL_TIMEOUT = 30; // 30 giây đếm ngược

const VideoCall = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const zegoInstanceRef = useRef<any>(null); // Lưu instance ZegoUIKitPrebuilt
  const [callType, setCallType] = useState<"audio" | "video" | null>("video");
  const [countdown, setCountdown] = useState(CALL_TIMEOUT);

  const {
    isCallActive,
    isCallWaiting,
    isCallAccepted,
    handleEndCall,
    handleCancelCall,
    callConversationId,
    isCallGroup,
    isCallEnded,
  } = useCallStore();

  const { user, socket } = useAuthStore();
  const roomID = callConversationId || "demo-room";
  const userID = user?._id || "defaultUserID";
  const userName = user?.firstName + " " + user?.lastName || "defaultUserName";

  // Countdown timeout logic
  useEffect(() => {
    if (isCallActive && isCallWaiting && !isCallAccepted) {
      setCountdown(CALL_TIMEOUT);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimeout(() => {
              if (!isCallAccepted) {
                handleCancelCall(callConversationId!, isCallGroup);
              }
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [
    isCallActive,
    isCallWaiting,
    isCallAccepted,
    callConversationId,
    isCallGroup,
    handleCancelCall,
  ]);

  // Lắng nghe sự kiện endCall từ socket
  useEffect(() => {
    if (zegoInstanceRef.current && isCallEnded) {
      console.log("Call ended, cleaning up ZEGOCLOUD instance");
      zegoInstanceRef.current.hangUp();
      // zegoInstanceRef.current.destroyEngine();
      zegoInstanceRef.current = null;
    }
  }, [isCallEnded]);

  // Khởi tạo ZEGOCLOUD
  useEffect(() => {
    if (!isCallActive || !isCallAccepted) return;

    const appID = parseInt(import.meta.env.VITE_ZEGO_APP_ID || "0");
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET || "";

    if (!appID) {
      throw new Error("VITE_ZEGO_APP_ID is not defined or invalid.");
    }

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
      zegoInstanceRef.current = zp; // Lưu instance vào ref

      zp.joinRoom({
        container: containerRef.current!,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showTextChat: false,
        showLeaveRoomConfirmDialog: false,
        showRoomTimer: true,
        showPreJoinView: false,
        showLeavingView: false,
        onLeaveRoom() {
          console.log("User left room, cleaning up ZEGOCLOUD");
          if (zegoInstanceRef.current) {
            console.log("Ending call and cleaning up ZEGOCLOUD instance");
            zegoInstanceRef.current.hangUp();
            // zegoInstanceRef.current.destroyEngine();
            zegoInstanceRef.current = null;
          }
          handleEndCall(roomID, isCallGroup);
        },
      });
    };

    init().catch((error) => {
      console.error("Failed to initialize ZEGOCLOUD:", error);
    });

    // Dọn dẹp khi component unmount hoặc call kết thúc
    return () => {
      if (zegoInstanceRef.current) {
        console.log("Cleaning up ZEGOCLOUD on unmount");
        zegoInstanceRef.current.hangUp();
        // zegoInstanceRef.current.destroyEngine();
        zegoInstanceRef.current = null;
      }
    };
  }, [
    isCallActive,
    isCallAccepted,
    roomID,
    userID,
    userName,
    isCallGroup,
    handleEndCall,
  ]);

  const shouldShowWaiting = isCallActive && isCallWaiting && !isCallAccepted;

  if (shouldShowWaiting) {
    return (
      <div className="absolute top-0 left-0 w-full h-full flex flex-col gap-6 items-center justify-center bg-black bg-opacity-70 z-[9999]">
        <div className="flex flex-col items-center">
          <p className="text-white text-lg mb-2 animate-pulse">
            Waiting for the other person to join...
          </p>
          <div className="text-yellow-400 text-4xl font-bold">{countdown}s</div>
        </div>
        <button
          className="bg-red-600 hover:bg-red-700 transition p-3 rounded-full shadow-lg"
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

  if (!isCallActive || !isCallAccepted) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 w-full h-full z-[9999]"
    />
  );
};

export default VideoCall;
