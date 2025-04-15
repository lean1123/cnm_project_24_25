"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CallNavbar from "./CallNavbar";
import { useCallStore } from "@/store/useCallStore";
import { useAuthStore } from "@/store/useAuthStore";
import getIceServer, {
  adjustVideoElemSize,
  closeVideo,
  getUserFullMedia,
  replaceTrack,
} from "@/lib/helpers";
import Room from "./Room";
import VideoContainer from "./VideoContainer";

type Props = {};

const CallContainer = (props: Props) => {
  const { isCallActive, handleEndCall } = useCallStore();
  const { socket, user } = useAuthStore();

  const pc = useRef<{ [key: string]: RTCPeerConnection }>({});
  const [screen, setScreen] = useState<MediaStream | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isCallActive) getAndSetUserStream();
    if (socket) {
      socket.on("newUser", (data) => {
        console.log("New user joined:", data);
        socket.emit("newUserJoinCall", {
          to: data.userId,
          sender: user?._id,
        });
        pc.current[data.userId] = new RTCPeerConnection(getIceServer());
        initPeer(true, data.userId, user?._id!);
      });

      socket.on("newUserJoinCall", (data) => {
        pc.current[data.sender] = new RTCPeerConnection(getIceServer());
        console.log("New user joined call:", data);
        initPeer(false, data.sender, user?._id!);
      });

      socket.on("iceCandidate", async (data) => {
        data.candidate
          ? await pc.current[data.sender].addIceCandidate(
              new RTCIceCandidate(data.candidate)
            )
          : "";
      });

      socket.on("sdp", async (data) => {
        if (!pc.current[data.sender]) {
          pc.current[data.sender] = new RTCPeerConnection(getIceServer());
        }
        if (data.description.type === "offer") {
          await pc.current[data.sender].setRemoteDescription(
            new RTCSessionDescription(data.description)
          );
          getUserFullMedia()
            .then(async (stream) => {
              setMyStream(stream);
              stream.getTracks().forEach((track) => {
                pc.current[data.sender].addTrack(track, stream);
              });
              let answer = await pc.current[data.sender].createAnswer();
              await pc.current[data.sender].setLocalDescription(answer);
              socket?.emit("sdp", {
                description: pc.current[data.sender].localDescription,
                to: data.sender,
                sender: user?._id,
              });
            })
            .catch((err) => {
              console.error("Error getting user media:", err);
            });
        } else if (data.description.type === "answer") {
          data.description
            ? await pc.current[data.sender].setRemoteDescription(
                new RTCSessionDescription(data.description)
              )
            : "";
        }
      });
    }
  }, [isCallActive]);

  function getAndSetUserStream() {
    getUserFullMedia()
      .then((stream) => {
        setMyStream(stream);
      })
      .catch((err) => {
        console.error("Error getting user media:", err);
      });
  }

  const broadcastNewTrack = useCallback(
    (stream: MediaStream, type: string, mirrorMode = true) => {
      setMyStream(stream);
      let track =
        type == "audio"
          ? stream.getAudioTracks()[0]
          : stream.getVideoTracks()[0];

      for (let p in Object.keys(pc.current)) {
        let pName = Object.keys(pc.current)[p];
        if (typeof pc.current[pName] == "object") {
          replaceTrack(track, pc.current[pName]);
        }
      }
    },
    [pc]
  );

  const initPeer = useCallback(
    (createOffer: boolean, partnerName: string, socketId: string) => {
      pc.current[partnerName] = new RTCPeerConnection(getIceServer());
      if (screen && screen.getTracks().length) {
        screen.getTracks().forEach((track) => {
          pc.current[partnerName].addTrack(track, screen);
        });
      } else if (myStream) {
        myStream.getTracks().forEach((track) => {
          pc.current[partnerName].addTrack(track, myStream);
        });
      } else {
        getUserFullMedia()
          .then(async (stream) => {
            setMyStream(stream);
            stream.getTracks().forEach((track) => {
              pc.current[partnerName].addTrack(track, stream);
            });
          })
          .catch((err) => {
            console.error("Error getting user media:", err);
          });
      }

      //create offer
      if (createOffer) {
        pc.current[partnerName].onnegotiationneeded = async () => {
          let offer = await pc.current[partnerName].createOffer();
          await pc.current[partnerName].setLocalDescription(offer);
          socket?.emit("sdp", {
            description: pc.current[partnerName].localDescription,
            to: partnerName,
            sender: socketId,
          });
        };
      } else {
        console.log("create offer false");
      }

      // add stream to video element
      pc.current[partnerName].ontrack = (event) => {
        if (!event.streams || event.streams.length === 0) return;
        let str = event.streams[0];
        if (document.getElementById(`${partnerName}-video`)) {
          const videoElement = document.getElementById(
            `${partnerName}-video`
          ) as HTMLVideoElement;
          if (videoElement) {
            videoElement.srcObject = str;
          }
        } else {
          // create new video element
          let newVideo = document.createElement("video");
          newVideo.id = `${partnerName}-video`;
          newVideo.autoplay = true;
          newVideo.srcObject = str;
          newVideo.className = "remote-video";

          // video controls
          let controls = document.createElement("div");
          controls.className = "remote-video-controls";
          controls.innerHTML = `
          <button class="btn btn-primary">Mute</button>
          <button class="btn btn-danger">Expand</button>
        `;

          // create video container
          let videoContainer = document.createElement("div");
          videoContainer.className = "card";
          videoContainer.id = partnerName;
          videoContainer.appendChild(newVideo);
          videoContainer.appendChild(controls);

          // append to body
          document.getElementById("videos")?.appendChild(videoContainer);

          adjustVideoElemSize();
        }
      };

      // sent ice candidate
      pc.current[partnerName].onicecandidate = ({ candidate }) => {
        if (candidate) {
          console.log(
            `📡 [ICE] Sending candidate to ${partnerName}:`,
            candidate
          );
          socket?.emit("iceCandidate", {
            candidate: candidate,
            to: partnerName,
            sender: socketId,
          });
        } else {
          console.log(`📡 [ICE] No more candidates (null) for ${partnerName}`);
        }
      };

      pc.current[partnerName].oniceconnectionstatechange = () => {
        console.log(
          `ICE State Change (${partnerName}):`,
          pc.current[partnerName].iceConnectionState
        );

        if (
          pc.current[partnerName].iceConnectionState === "disconnected" ||
          pc.current[partnerName].iceConnectionState === "failed" ||
          pc.current[partnerName].iceConnectionState === "closed"
        ) {
          console.log(`Calling closeVideo for ${partnerName}`);
          if (pc.current[partnerName]) {
            pc.current[partnerName].close();
            delete pc.current[partnerName];
          }
          closeVideo(partnerName);
        }
      };

      pc.current[partnerName].onsignalingstatechange = () => {
        console.log(
          `Signaling State Change (${partnerName}):`,
          pc.current[partnerName].signalingState
        );

        if (pc.current[partnerName].signalingState === "closed") {
          console.log(
            `Calling closeVideo from signalingStateChange for ${partnerName}`
          );
          closeVideo(partnerName);
        }
      };

      return () => {
        socket?.off("newUser");
        socket?.off("newUserJoinCall");
        socket?.off("iceCandidate");
        socket?.off("sdp");

        Object.values(pc.current).forEach((conn) => conn.close());
        pc.current = {};

        myStream?.getTracks().forEach((track) => track.stop());
        setMyStream(null);
      };
    },
    [pc, socket, user, myStream, screen]
  );

  const [isCameraOpen, setIsCameraOpen] = useState(true);
  const [isAudioOpen, setIsAudioOpen] = useState(true);

  const handleToggleVideo = () => {
    if (myStream && myStream.getVideoTracks()[0].enabled) {
      myStream.getVideoTracks()[0].enabled = false;
    } else {
      if (myStream) {
        myStream.getVideoTracks()[0].enabled = true;
      }
    }
    if (myStream) {
      broadcastNewTrack(myStream, "video");
      setIsCameraOpen(!isCameraOpen);
    }
  };

  const handleToggleAudio = () => {
    if (myStream && myStream.getAudioTracks()[0].enabled) {
      myStream.getAudioTracks()[0].enabled = false;
    } else {
      if (myStream) {
        myStream.getAudioTracks()[0].enabled = true;
      }
    }
    if (myStream) {
      broadcastNewTrack(myStream, "audio");
      setIsAudioOpen(!isAudioOpen);
    }
  };

  const handlEndCall = () => {
    console.log("👉 Ending call");
    cleanup();
    handleEndCall(user?._id || "");
  };

  const cleanup = () => {
    console.log("🧹 Running cleanup...");
  
    // 🔌 Đóng mọi kết nối peer
    Object.entries(pc.current).forEach(([peerId, connection]) => {
      try {
        connection.onicecandidate = null;
        connection.ontrack = null;
        connection.onnegotiationneeded = null;
        connection.oniceconnectionstatechange = null;
        connection.onsignalingstatechange = null;
  
        connection.getSenders().forEach((sender) => {
          try {
            sender.track?.stop();
          } catch (err) {
            console.warn("Error stopping sender track:", err);
          }
        });
  
        connection.close();
        delete pc.current[peerId];
      } catch (err) {
        console.warn(`Error closing connection to ${peerId}:`, err);
      }
    });
  
    pc.current = {};
  
    // 📵 Tắt tất cả track từ myStream
    if (myStream) {
      myStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (err) {
          console.warn("Error stopping myStream track:", err);
        }
      });
      setMyStream(null);
    }
  
    // 📵 Tắt screen share stream nếu có
    if (screen) {
      screen.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (err) {
          console.warn("Error stopping screen track:", err);
        }
      });
      setScreen(null);
    }
  
    // 🧹 Gỡ video element khỏi DOM
    document.querySelectorAll("video").forEach((video) => {
      try {
        video.pause();
        video.srcObject = null;
        video.remove();
      } catch (err) {
        console.warn("Error removing video element:", err);
      }
    });
  
    // 🔇 Clear toàn bộ video container
    const videoContainer = document.getElementById("videos");
    if (videoContainer) {
      videoContainer.innerHTML = "";
    }
  
    // 🔌 Gỡ toàn bộ socket events liên quan đến call
    if (socket) {
      socket.off("newUser");
      socket.off("newUserJoinCall");
      socket.off("iceCandidate");
      socket.off("sdp");
    }
  
    console.log("✅ Cleanup completed.");
  };
  

  // useEffect(() => {
  //   if (isCallActive) {
  //     getAndSetUserStream();
  //   }

  //   return () => {
  //     cleanup(); // gọi khi component bị unmount hoặc khi isCallActive chuyển false
  //   };
  // }, [isCallActive]);

  if (!isCallActive) return null;
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-opacity-90 bg-black flex-col items-center justify-center">
      <CallNavbar
        handleEndCall={handlEndCall}
        isNavbar={true}
        isCameraOpen={isCameraOpen}
        isAudioOpen={isAudioOpen}
        isScreenSharing={false}
        setIsCameraOpen={() => {
          handleToggleVideo();
        }}
        setIsAudioOpen={() => {
          handleToggleAudio();
        }}
        setIsScreenSharing={() => {}}
      />
      <Room isRoom={true} myStream={myStream} />
      {/* <div className="mt-4 relative max-w-[800px] mx-auto">
        {myStream && (
          <VideoContainer
            stream={myStream}
            isLocalStream={true}
            // isOnCall={isOnCall}
          />
        )}
        {screen && (
          <VideoContainer
            stream={screen}
            isLocalStream={false}
            // isOnCall={isOnCall}
          />
        )}
      </div> */}
    </div>
  );
};

export default CallContainer;
