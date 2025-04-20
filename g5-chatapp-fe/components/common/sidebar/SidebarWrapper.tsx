"use client";
import React, { useState } from "react";
import MobileNav from "./nav/MobileNav";
import DesktopNav from "./nav/DesktopNav";
import RingCall from "../call/RingCall";
import VideoCall from "@/app/(root)/_components/VideoCall";
import VoiceCall from "@/app/(root)/_components/VoiceCall";

type Props = React.PropsWithChildren<{}>;

const SidebarWrapper = ({ children }: Props) => {
  const [showRingCall, setShowRingCall] = useState(true);
  return (
    <div className="h-full w-full p-4 flex flex-col lg:flex-row gap-4 relative">
      <MobileNav />
      <DesktopNav />
      <main className="h-[calc(100%-80px)] lg:h-full w-full flex gap-4">
        {children}
        <RingCall
          showRingCall={showRingCall}
          setShowRingCall={setShowRingCall}
        />
      </main>
      {/* <CallContainer /> */}
      <VideoCall />
      {/* <VoiceCall /> */}
      {/* <CallContainer /> */}
    </div>
  );
};

export default SidebarWrapper;
