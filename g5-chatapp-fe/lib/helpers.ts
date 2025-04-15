export default function getIceServer() {
  return {
    iceServers: [
      {
        urls: ["stun:stun.l.google.com:19302"],
      },
      {
        urls: ["stun:stun1.l.google.com:19302"],
      },
      {
        urls: ["stun:stun2.l.google.com:19302"],
      },
      {
        urls: ["stun:stun3.l.google.com:19302"],
      },
      {
        urls: ["stun:stun4.l.google.com:19302"],
      },
    ],
  };
}

function userMediaAvailable() {
  return (
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function"
  );
}

export function getUserFullMedia() {
    if (userMediaAvailable()) {
      return navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
    } else {
      throw new Error("User media not available");
    }
  }

export function getUserAudio() {
  if (userMediaAvailable()) {
    return navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
  } else {
    throw new Error("User media not available");
  }
}

export function replaceTrack(stream: any, recipientPeer: any) {
  let sender = recipientPeer.getSenders
    ? recipientPeer
        .getSenders()
        .find(
          (s: { track: { kind: any } }) =>
            s.track && s.track.kind === stream.kind
        )
    : false;

  sender ? sender.replaceTrack(stream) : "";
}

export function maximiseStream(e: any) {
    let elem = e.target.parentElement.previousElementSibling;
  
    elem.requestFullscreen() ||
      elem.mozRequestFullScreen() ||
      elem.webkitRequestFullscreen() ||
      elem.msRequestFullscreen();
  }
  
  export function adjustVideoElemSize() {
    let elem = document.getElementsByClassName( 'card' );
    let totalRemoteVideosDesktop = elem.length;
    let newWidth = totalRemoteVideosDesktop <= 2 ? '50%' : (
        totalRemoteVideosDesktop == 3 ? '33.33%' : (
            totalRemoteVideosDesktop <= 8 ? '25%' : (
                totalRemoteVideosDesktop <= 15 ? '20%' : (
                    totalRemoteVideosDesktop <= 18 ? '16%' : (
                        totalRemoteVideosDesktop <= 23 ? '15%' : (
                            totalRemoteVideosDesktop <= 32 ? '12%' : '10%'
                        )
                    )
                )
            )
        )
    );
  
  
    for ( let i = 0; i < totalRemoteVideosDesktop; i++ ) {
        (elem[i] as HTMLElement).style.width = newWidth;
    }
  }
  
  export function closeVideo(elemId: string) {
    const element = document.getElementById(elemId);
    if (element) {
      console.log(`Closing video: ${elemId}`);
      element.remove();
      adjustVideoElemSize();
    } else {
      console.warn(`Element with ID '${elemId}' not found.`);
    }
  }
  
  
  export function shareScreen() {
    if (userMediaAvailable()) {
      return navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });
    }
    else {
      throw new Error("User media not available");
    }
  }