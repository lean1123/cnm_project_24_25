import React from "react";

type Props = {
  isRoom: boolean;
  myStream: MediaStream | null;
};

const Room = ({ isRoom, myStream }: Props) => {
  return (
    <div className="w-full h-screen flex flex-col" hidden={!isRoom}>
      {/* local video */}
      <div>
        <video
          ref={(video) => {
            if (video && myStream) {
              video.srcObject = myStream;
            }
          }}
          className="bottom-0 left-0 fixed w-xs mirror-mode"
          autoPlay
          muted
        ></video>
      </div>
      {/* remote */}
      <div>
        <div className="w-full h-screen">
          <div className="flex" id="videos"></div>
        </div>
      </div>
    </div>
  );
};

export default Room;
