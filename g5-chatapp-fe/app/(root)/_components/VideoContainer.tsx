import React from "react";

interface VideoContainerProps {
  stream: MediaStream | null;
  isLocalStream: boolean;
}

function VideoContainer({
  stream,
  isLocalStream,
}: VideoContainerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <video
      className={`rounded border  ${
        isLocalStream 
          ? "absolute w-[200px] h-auto border-primary border-2"
          : "w-[800px]"
      }`}
      autoPlay
      playsInline
      muted={isLocalStream}
      ref={videoRef}
    />
  );
}

export default VideoContainer;
