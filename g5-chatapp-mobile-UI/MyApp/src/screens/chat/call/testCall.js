import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Alert,
  BackHandler,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";
import Icon from "react-native-vector-icons/FontAwesome5";
import useCallStore from "../../../store/useCallStore";
import useAuthStore from "../../../store/useAuthStore";
import NetInfo from "@react-native-community/netinfo";
import {
  getSocket,
  emitJoinCall,
  emitEndCall,
  emitAcceptCall,
  initSocket,
  subscribeToChatEvents,
  unsubscribeFromChatEvents,
  emitJoinConversation,
} from "../../../services/socket";
import { navigationRef } from "../../../navigation/Navigator";

let ZegoExpressEngine = null;

const appID = 1228124979;
const serverSecret = "85ba963fbab3739f726baef3e69ee66a";

const ZEGO_SCENARIO = {
  GENERAL: 0,
  COMMUNICATION: 1,
  LIVE: 2,
  CUSTOM: 3,
};

const { width, height } = Dimensions.get("window");

const TestCall = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [networkAvailable, setNetworkAvailable] = useState(true);
  const [callConnected, setCallConnected] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const intervalRef = useRef(null);
  const socketRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [zegoFailedButProceed, setZegoFailedButProceed] = useState(false);
  const [zegoEngine, setZegoEngine] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [zegoInitialized, setZegoInitialized] = useState(false);

  const {
    roomID = "demo-room",
    userID = "defaultUserID",
    userName = "Guest",
    callType = "video",
  } = route.params || {};

  const { user } = useAuthStore();
  const {
    isCallActive,
    isCallAccepted,
    callConversationId,
    isCallGroup,
    handleEndCall,
    setIncomingCall,
    setCallAccepted,
    setCallRejected,
    setCallEnded,
    setCallCancelled,
  } = useCallStore();

  const handleZegoFailure = () => {
    console.log(
      "[TestCall] Proceeding with socket-only call as ZegoExpressEngine failed"
    );
    setZegoFailedButProceed(true);
    setLoading(false);

    const socket = getSocket();
    if (socket) {
      handleCallSocket(socket);
      setCallConnected(true);
      setCallStartTime(new Date());
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setError("No socket connection available for audio-only call");
    }
  };

  useEffect(() => {
    const importZego = async () => {
      try {
        console.log("[TestCall] Attempting to import ZegoExpressEngine...");
        const ZegoModule = await import("zego-express-engine-reactnative");
        console.log("[TestCall] Imported module:", ZegoModule);
        ZegoExpressEngine = ZegoModule?.default;
        console.log("[TestCall] ZegoExpressEngine:", ZegoExpressEngine);

        if (!ZegoExpressEngine) {
          throw new Error("ZegoExpressEngine import returned undefined");
        }

        const version = await ZegoExpressEngine.getVersion();
        console.log(`[TestCall] ZegoExpressEngine version: ${version}`);
        setZegoInitialized(true);
      } catch (err) {
        console.error("[TestCall] Failed to import ZegoExpressEngine:", err);
        if (callType === "audio") {
          console.log(
            "[TestCall] Audio call will proceed without ZegoExpressEngine"
          );
          handleZegoFailure();
        } else {
          Alert.alert(
            "Video Call Issue",
            `Cannot initialize video call: ${err.message}. Would you like to continue with an audio-only call?`,
            [
              {
                text: "Cancel Call",
                onPress: () => {
                  setError(`Call engine error: ${err.message}`);
                  setLoading(false);
                },
                style: "cancel",
              },
              {
                text: "Continue with Audio",
                onPress: () => handleZegoFailure(),
              },
            ]
          );
        }
      }
    };

    importZego();

    const importTimeout = setTimeout(() => {
      if (!zegoInitialized && !zegoFailedButProceed) {
        console.warn("[TestCall] Zego initialization timeout");
        Alert.alert(
          "Call Connection Timeout",
          "Could not establish a video call connection. Would you like to continue with an audio call?",
          [
            {
              text: "Cancel",
              onPress: () => {
                setError("Timeout establishing video connection");
                setLoading(false);
              },
              style: "cancel",
            },
            {
              text: "Continue with Audio",
              onPress: () => handleZegoFailure(),
            },
          ]
        );
      }
    }, 20000);

    return () => clearTimeout(importTimeout);
  }, []);

  useEffect(() => {
    if (!zegoInitialized) return;

    const initZegoEngine = async () => {
      try {
        if (!ZegoExpressEngine) {
          throw new Error("ZegoExpressEngine is not available");
        }

        console.log(
          "[TestCall] Initializing ZegoExpressEngine with appID:",
          appID
        );
        const profile = {
          appID,
          appSign: serverSecret,
          scenario: ZEGO_SCENARIO.CUSTOM,
        };

        console.log(
          "[TestCall] Creating engine with profile:",
          JSON.stringify(profile)
        );
        const engine = await ZegoExpressEngine.createEngineWithProfile(profile);

        if (!engine) {
          throw new Error(
            "Failed to create Zego engine, result is null or undefined"
          );
        }

        console.log("[TestCall] ZegoExpressEngine created successfully");
        setZegoEngine(engine);

        engine.on(
          "roomStateUpdate",
          (roomID, state, errorCode, extendedData) => {
            console.log(
              `[Zego] Room state updated: ${roomID}, state: ${state}, error: ${errorCode}`
            );
            if (state === "CONNECTED") {
              setCallConnected(true);
              setLoading(false);
            } else if (state === "DISCONNECTED") {
              setCallConnected(false);
            }
          }
        );

        engine.on("roomUserUpdate", (roomID, updateType, userList) => {
          console.log(
            `[Zego] Room user updated: ${roomID}, type: ${updateType}, users:`,
            userList
          );
        });

        engine.on(
          "roomStreamUpdate",
          async (roomID, updateType, streamList) => {
            console.log(
              `[Zego] Stream updated: ${roomID}, type: ${updateType}, streams:`,
              streamList
            );
            if (updateType === "ADD") {
              const newStreams = { ...remoteStreams };
              for (const stream of streamList) {
                if (stream.user.userID !== userID) {
                  console.log(
                    `[Zego] Playing remote stream: ${stream.streamID}`
                  );
                  try {
                    const remoteView = await engine.createRemoteView(
                      stream.streamID
                    );
                    await engine.startPlayingStream(stream.streamID);
                    newStreams[stream.streamID] = { stream, view: remoteView };
                  } catch (err) {
                    console.error(
                      `[Zego] Error playing stream ${stream.streamID}:`,
                      err
                    );
                  }
                }
              }
              setRemoteStreams(newStreams);
            } else if (updateType === "DELETE") {
              const newStreams = { ...remoteStreams };
              for (const stream of streamList) {
                if (newStreams[stream.streamID]) {
                  await engine.stopPlayingStream(stream.streamID);
                  delete newStreams[stream.streamID];
                }
              }
              setRemoteStreams(newStreams);
            }
          }
        );

        return engine;
      } catch (error) {
        console.error(
          "[TestCall] Failed to initialize ZegoExpressEngine:",
          error
        );
        setError(`Failed to initialize video call engine: ${error.message}`);
        return null;
      }
    };

    initZegoEngine().catch((err) => {
      console.error("[TestCall] Error in Zego initialization:", err);
      setError(`Error initializing call: ${err.message}`);
    });

    return () => {
      if (zegoEngine) {
        try {
          zegoEngine.stopPublishingStream();
          Object.keys(remoteStreams).forEach((streamID) => {
            zegoEngine.stopPlayingStream(streamID);
          });
          zegoEngine.logoutRoom(roomID);
          zegoEngine.destroyEngine();
        } catch (error) {
          console.error("[TestCall] Error cleaning up Zego:", error);
        }
      }
    };
  }, [zegoInitialized]);

  useEffect(() => {
    console.log("[TestCall] Initializing socket connection");
    const setupSocket = async () => {
      try {
        const socket = await initSocket();
        socketRef.current = socket;
        if (socket && socket.connected) {
          console.log("[TestCall] Socket initialized successfully:", socket.id);
          setSocketConnected(true);
          const callCallbacks = {
            onCall: (data) => {
              console.log("[TestCall] Received call event:", data);
              setIncomingCall(data);
            },
            onNewMessage: (data) => {
              console.log("[TestCall] Received newMessage event:", data);
            },
            onAcceptCall: (data) => {
              console.log("[TestCall] Call accepted:", data);
              setCallAccepted();
              setCallConnected(true);
              setLoading(false);
              if (!callStartTime) {
                setCallStartTime(new Date());
                startCallTimer();
              }
            },
            onRejectCall: (data) => {
              console.log("[TestCall] Call rejected:", data);
              setCallRejected();
              Alert.alert(
                "Call Rejected",
                "The other person rejected your call"
              );
              navigation.goBack();
            },
            onEndCall: (data) => {
              console.log("[TestCall] Call ended:", data);
              setCallEnded();
              Alert.alert("Call Ended", "The call has ended");
              navigation.goBack();
            },
            onCancelCall: (data) => {
              console.log("[TestCall] Call cancelled:", data);
              setCallCancelled();
              Alert.alert("Call Cancelled", "The call was cancelled");
              navigation.goBack();
            },
            onJoinCall: (data) => {
              console.log("[TestCall] User joined call:", data);
              setCallConnected(true);
              setLoading(false);
              if (!callStartTime) {
                setCallStartTime(new Date());
                startCallTimer();
              }
            },
          };
          subscribeToChatEvents(callCallbacks);
          socket.on("goingCall", (data) => {
            console.log(
              "[TestCall] Received goingCall event from website:",
              data
            );
            setIncomingCall(data);
          });
        } else {
          console.error("[TestCall] Socket initialization failed");
          setError("Failed to connect to chat server. Please try again.");
        }
      } catch (error) {
        console.error("[TestCall] Error setting up socket:", error);
        setError("Error connecting to chat server: " + error.message);
      }
    };

    setupSocket();

    return () => {
      console.log("[TestCall] Cleaning up socket connection");
      if (intervalRef.current) clearInterval(intervalRef.current);
      const socket = getSocket();
      if (socket) socket.off("goingCall");
      unsubscribeFromChatEvents();
    };
  }, []);

  const startCallTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected;
      console.log("Internet connection available:", isConnected);
      setNetworkAvailable(!!isConnected);
      if (!isConnected && !error) {
        setError(
          "No internet connection. Please check your network and try again."
        );
      } else if (
        isConnected &&
        error ===
          "No internet connection. Please check your network and try again."
      ) {
        setError(null);
      }
    });
    return () => unsubscribe();
  }, [error]);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status: cameraStatus } =
          await Camera.requestCameraPermissionsAsync();
        const { status: micStatus } = await Audio.requestPermissionsAsync();
        console.log("Camera and mic permissions:", { cameraStatus, micStatus });
        if (cameraStatus === "granted" && micStatus === "granted") {
          setPermissionsGranted(true);
        } else {
          setError("Camera and microphone permissions are required for calls");
          Alert.alert(
            "Permissions Required",
            "Camera and microphone access are needed for video calls.",
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
        }
      } catch (error) {
        console.error("Permission request error:", error);
        setError("Failed to request permissions: " + error.message);
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    const joinRoom = async () => {
      if (permissionsGranted && zegoEngine && networkAvailable) {
        try {
          console.log(
            `[TestCall] Joining Zego room: ${roomID}, user: ${userID}, name: ${userName}`
          );
          await zegoEngine.loginRoom(
            roomID,
            { userID, userName },
            { userUpdate: true }
          );
          const localStreamID = `${userID}_stream`;
          if (callType === "video") {
            try {
              const localView = await zegoEngine.createLocalView();
              setLocalStream(localView);
              await zegoEngine.startPreview({
                viewMode: 0,
                viewPosition: localView,
                background: "#000000",
              });
              await zegoEngine.startPublishingStream(localStreamID, {
                camera: true,
                microphone: true,
              });
            } catch (err) {
              console.error("[TestCall] Error setting up video:", err);
              setError(`Video setup error: ${err.message}`);
            }
          } else {
            await zegoEngine.startPublishingStream(localStreamID, {
              camera: false,
              microphone: true,
            });
          }
          emitJoinCall(
            user?._id || userID,
            callConversationId || roomID,
            isCallGroup
          );
          setCallConnected(true);
          setCallStartTime(new Date());
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = setInterval(() => {
            setCallDuration((prev) => prev + 1);
          }, 1000);
          setLoading(false);
        } catch (error) {
          console.error("[TestCall] Error joining Zego room:", error);
          setError(`Failed to join call: ${error.message}`);
        }
      } else if (
        permissionsGranted &&
        !zegoEngine &&
        networkAvailable &&
        !zegoFailedButProceed
      ) {
        setError("Failed to initialize call engine. Please try again.");
      }
    };

    if (zegoEngine) {
      joinRoom();
    } else {
      const engineTimeout = setTimeout(() => {
        if (!zegoEngine && !error && !zegoFailedButProceed) {
          setError(
            "Timeout waiting for call engine to initialize. Please try again."
          );
          setLoading(false);
        }
      }, 10000);
      return () => clearTimeout(engineTimeout);
    }
  }, [permissionsGranted, zegoEngine, networkAvailable]);

  useEffect(() => {
    const checkSocketStatus = () => {
      const socket = getSocket();
      if (socket && socket.connected) {
        console.log("[TestCall] Socket status check: Connected");
        setSocketConnected(true);
        return true;
      } else {
        console.log("[TestCall] Socket status check: Disconnected");
        setSocketConnected(false);
        return false;
      }
    };

    const isConnected = checkSocketStatus();
    if (isConnected) {
      const callTimer = setTimeout(() => {
        if (!callConnected && !error && !zegoFailedButProceed) {
          console.log("[TestCall] Call timeout - no one answered");
          Alert.alert("No Answer", "No one answered the call");
          navigation.goBack();
        }
      }, 30000);
      return () => clearTimeout(callTimer);
    } else {
      console.log("[TestCall] Socket not connected, attempting to reconnect");
      initSocket()
        .then((socket) => {
          socketRef.current = socket;
          const reconnectTimer = setTimeout(() => {
            if (!checkSocketStatus() && !zegoFailedButProceed) {
              setError(
                "Could not connect to chat server. Please check your internet connection and try again."
              );
            } else {
              const socket = getSocket();
              if (socket) {
                console.log(
                  "[TestCall] Connected after reconnection, handling call"
                );
                handleCallSocket(socket);
              }
            }
          }, 3000);
          return () => clearTimeout(reconnectTimer);
        })
        .catch((err) => {
          console.error("[TestCall] Socket reconnection error:", err);
          if (!zegoFailedButProceed) {
            setError("Could not connect to chat server: " + err.message);
          }
        });
    }
  }, []);

  useEffect(() => {
    if (socketConnected && permissionsGranted) {
      console.log(
        "[TestCall] Socket ready and permissions granted, handling call"
      );
      const socket = getSocket();
      console.log(
        `[TestCall] Joining conversation: ${callConversationId || roomID}`
      );
      emitJoinConversation(callConversationId || roomID);
      handleCallSocket(socket);
    }
  }, [socketConnected, permissionsGranted]);

  const handleCallSocket = (socket) => {
    if (!socket) {
      console.error("[TestCall] Socket is not available");
      return;
    }
    if (isCallAccepted) {
      console.log(
        `[TestCall] Accepting call - emitting acceptCall event for conversation: ${
          callConversationId || roomID
        }`
      );
      emitAcceptCall(
        user?._id || userID,
        callConversationId || roomID,
        isCallGroup
      );
      socket.emit("acceptCall", {
        conversationId: callConversationId || roomID,
        userId: user?._id || userID,
        isGroup: isCallGroup,
      });
    } else {
      console.log(
        `[TestCall] Initiating call - emitting call event for conversation: ${
          callConversationId || roomID
        }`
      );
      const callData = {
        conversationId: callConversationId || roomID,
        sender: user || {
          _id: userID,
          firstName: userName.split(" ")[0],
          lastName: userName.split(" ")[1] || "",
        },
        type: callType || "video",
        isGroup: isCallGroup,
      };
      socket.emit("call", callData);
      emitJoinCall(
        user?._id || userID,
        callConversationId || roomID,
        isCallGroup
      );
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isCallActive) {
          endCall();
          return true;
        }
        return false;
      }
    );
    return () => backHandler.remove();
  }, [isCallActive]);

  useEffect(() => {
    return () => {
      if (isCallActive) endCall();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const endCall = () => {
    console.log(
      `[TestCall] Ending call for conversation: ${callConversationId || roomID}`
    );
    emitEndCall(user?._id || userID, callConversationId || roomID, isCallGroup);
    const socket = getSocket();
    if (socket) {
      socket.emit("endCall", {
        conversationId: callConversationId || roomID,
        userId: user?._id || userID,
        isGroup: isCallGroup,
      });
    }
    if (zegoEngine && !zegoFailedButProceed) {
      try {
        zegoEngine.stopPublishingStream();
        Object.keys(remoteStreams).forEach((streamID) => {
          zegoEngine.stopPlayingStream(streamID);
        });
        zegoEngine.logoutRoom(roomID);
        zegoEngine.destroyEngine();
      } catch (error) {
        console.error("[TestCall] Error stopping Zego:", error);
      }
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    navigation.goBack();
  };

  const toggleMic = async () => {
    if (zegoEngine) {
      try {
        await zegoEngine.muteMicrophone(!isMicOn);
        setIsMicOn(!isMicOn);
      } catch (error) {
        console.error("[TestCall] Error toggling mic:", error);
      }
    }
  };

  const toggleCamera = async () => {
    if (zegoEngine && callType === "video") {
      try {
        await zegoEngine.enableCamera(!isCameraOn);
        setIsCameraOn(!isCameraOn);
      } catch (error) {
        console.error("[TestCall] Error toggling camera:", error);
      }
    }
  };

  const switchCamera = async () => {
    if (zegoEngine && callType === "video") {
      try {
        await zegoEngine.useFrontCamera(!isFrontCamera);
        setIsFrontCamera(!isFrontCamera);
      } catch (error) {
        console.error("[TestCall] Error switching camera:", error);
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!permissionsGranted) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Waiting for camera and microphone permissions...
        </Text>
        <ActivityIndicator size="large" color="#3498db" />
      </SafeAreaView>
    );
  }

  if (!networkAvailable) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon
          name="wifi-slash"
          size={50}
          color="#e74c3c"
          style={styles.errorIcon}
        />
        <Text style={styles.errorText}>No internet connection available</Text>
        <Text style={styles.errorSubtext}>
          Please check your network settings and try again
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon
          name="exclamation-triangle"
          size={50}
          color="#e74c3c"
          style={styles.errorIcon}
        />
        <Text style={styles.errorText}>{error}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.retryButton]}
            onPress={() => setError(null)}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!zegoEngine && !zegoFailedButProceed && loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>
            {!zegoEngine
              ? "Initializing video call..."
              : "Connecting to call..."}
          </Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {zegoFailedButProceed ? (
        <View style={styles.audioOnlyContainer}>
          <Icon
            name="phone"
            size={50}
            color="#2ecc71"
            style={styles.audioIcon}
          />
          <Text style={styles.audioOnlyText}>Audio Call In Progress</Text>
          <Text style={styles.audioOnlySubtext}>Video is unavailable</Text>
          <Text style={styles.callDurationText}>
            {formatDuration(callDuration)}
          </Text>
        </View>
      ) : (
        <>
          {Object.keys(remoteStreams).length > 0 ? (
            <View style={styles.remoteContainer}>
              {Object.values(remoteStreams).map((remoteData, index) => (
                <View key={index} style={styles.remoteVideo}>
                  {remoteData.view}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>
                {callConnected
                  ? "Waiting for other participants..."
                  : "Connecting..."}
              </Text>
              <Text style={styles.roomIdText}>Room ID: {roomID}</Text>
              <Text style={styles.callTypeText}>
                {callType === "video" ? "Video Call" : "Audio Call"}
              </Text>
            </View>
          )}
          {localStream && callType === "video" && (
            <View style={styles.localStreamContainer}>
              <View style={styles.localVideo}>
                {localStream}
                <TouchableOpacity
                  style={styles.switchCameraButton}
                  onPress={switchCamera}
                >
                  <Icon name="sync" size={15} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
      <View style={styles.callInfoOverlay}>
        <Text style={styles.callDurationText}>
          {formatDuration(callDuration)}
        </Text>
        <Text style={styles.callStatusText}>
          {callConnected ? "Connected" : "Connecting..."}
        </Text>
      </View>
      <View style={styles.controlsContainer}>
        {!zegoFailedButProceed && (
          <TouchableOpacity
            style={[
              styles.controlButton,
              !isMicOn && styles.controlButtonActive,
            ]}
            onPress={toggleMic}
          >
            <Icon
              name={isMicOn ? "microphone" : "microphone-slash"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        )}
        {!zegoFailedButProceed && callType === "video" && (
          <TouchableOpacity
            style={[
              styles.controlButton,
              !isCameraOn && styles.controlButtonActive,
            ]}
            onPress={toggleCamera}
          >
            <Icon
              name={isCameraOn ? "video" : "video-slash"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={endCall}
        >
          <Icon name="phone-slash" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 30,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  errorSubtext: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    minWidth: 100,
    alignItems: "center",
  },
  retryButton: {
    backgroundColor: "#2ecc71",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  remoteContainer: {
    flex: 1,
    backgroundColor: "#222",
  },
  remoteVideo: {
    flex: 1,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
  },
  waitingText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10,
  },
  roomIdText: {
    color: "#bbb",
    fontSize: 14,
    marginBottom: 5,
  },
  callTypeText: {
    color: "#bbb",
    fontSize: 14,
  },
  localStreamContainer: {
    position: "absolute",
    top: 30,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 8,
    overflow: "hidden",
    zIndex: 5,
  },
  localVideo: {
    width: "100%",
    height: "100%",
    backgroundColor: "#333",
  },
  switchCameraButton: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  callInfoOverlay: {
    position: "absolute",
    top: 30,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 10,
    zIndex: 10,
  },
  callDurationText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  callStatusText: {
    color: "#bbb",
    fontSize: 12,
    textAlign: "center",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
  },
  controlButtonActive: {
    backgroundColor: "#e74c3c",
  },
  endCallButton: {
    backgroundColor: "#e74c3c",
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  audioOnlyContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  audioIcon: {
    marginBottom: 20,
  },
  audioOnlyText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  audioOnlySubtext: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
  },
});

export default TestCall;
