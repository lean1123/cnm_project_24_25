"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCallStore } from "@/store/useCallStore";
import { useAuthStore } from "@/store/useAuthStore";

const CALL_TIMEOUT = 30; // 30 giây đếm ngược

const VideoCall = () => {
  const containerRef = useRef<HTMLDivElement>(null);
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
  } = useCallStore();

  const { user } = useAuthStore();
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

            // Đặt trong setTimeout để tránh update khi đang render
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
  }, [isCallActive, isCallWaiting, isCallAccepted]);

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
        showTextChat: false,
        showLeaveRoomConfirmDialog: false,
        showRoomTimer: true,
        showPreJoinView: false,
        showLeavingView: false,
        onLeaveRoom() {
          handleEndCall(roomID, isCallGroup);
        },
      });
    };

    init();
  }, [isCallActive, isCallAccepted]);

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
