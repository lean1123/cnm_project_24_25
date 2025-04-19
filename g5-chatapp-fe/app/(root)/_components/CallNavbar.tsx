"use client";

import { Button } from "@/components/ui/button";
import { useCallStore } from "@/store/useCallStore";
import {
  Cctv,
  LogOut,
  MessageCircle,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import Link from "next/link";

type Props = {
  isNavbar: boolean;
  isCameraOpen?: boolean;
  isAudioOpen?: boolean;
  isScreenSharing?: boolean;
  isChatOpen?: boolean;
  isRecording?: boolean;
  setIsCameraOpen?: (value: boolean) => void;
  setIsAudioOpen?: (value: boolean) => void;
  setIsScreenSharing?: (value: boolean) => void;
  handleEndCall?: (conversationId: string) => void;
};

const CallNavbar = ({
  isNavbar,
  isCameraOpen,
  isAudioOpen,
  isScreenSharing,
  setIsCameraOpen,
  setIsAudioOpen,
  setIsScreenSharing,
    handleEndCall,
}: Props) => {
  return (
    <nav
      className=" text-white p-4 w-full flex justify-center"
      hidden={!isNavbar}
    >
      <div className="flex gap-6 card bg-white/10 backdrop-blur-sm rounded-lg p-2 shadow-md shadow-slate-800">
        <button
          className=""
          onClick={() => {
            if (setIsCameraOpen) setIsCameraOpen(!isCameraOpen);
          }}
        >
          {isCameraOpen ? (
            <Video className="w-4 h-4" />
          ) : (
            <VideoOff className="w-4 h-4" />
          )}
        </button>
        <button
          className=""
          onClick={() => {
            if (setIsAudioOpen) setIsAudioOpen(!isAudioOpen);
          }}
        >
          {isAudioOpen ? (
            <Mic className="w-4 h-4" />
          ) : (
            <MicOff className="w-4 h-4" />
          )}
        </button>
        <button
          className=""
          onClick={() => {
            if (setIsScreenSharing) setIsScreenSharing(!isScreenSharing);
          }}
        >
          <MonitorUp className="w-4 h-4" />
        </button>
        <button className="">
          <Cctv className="w-4 h-4" />
        </button>
        <button
          className=""
          onClick={() => {
            if (handleEndCall) handleEndCall("67fc19e48255723cbd575594");
          }}
        >
          {/* <Button variant={"ghost"} onClick={() => handleEndCall(conversationId)}> */}
          <PhoneOff className="w-4 h-4" />
          {/* </Button> */}
        </button>
      </div>
    </nav>
  );
};

export default CallNavbar;
