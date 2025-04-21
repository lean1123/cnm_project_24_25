import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { useRoute } from "@react-navigation/native";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { useStore } from "zustand"; // Adjust based on your store setup

const appID = 922999375;
const serverSecret = "4104c8e96601c2e216fd754c3020e9c3";

const TestCall = () => {
  const route = useRoute();
  const { roomID = "demo-room", userID = "defaultUserID", userName = "Guest" } = route.params;
  const [localScript, setLocalScript] = useState("");

  // Replace with your Zustand store for call state
  const { isCallActive, isCallAccepted } = { isCallActive: true, isCallAccepted: true }; // Placeholder

  console.log("TestCall params:", { roomID, userID, userName });

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
        const { status: micStatus } = await Audio.requestPermissionsAsync();
        console.log("Permissions:", { cameraStatus, micStatus });
        if (cameraStatus !== "granted" || micStatus !== "granted") {
          Alert.alert("Permission Denied", "Camera and microphone permissions are required.");
        }
      } catch (error) {
        console.error("Permission request error:", error);
        Alert.alert("Permissions Error", "Please grant camera and microphone permissions in settings.");
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    const loadZegoScript = async () => {
      try {
        const asset = Asset.fromModule(require("../assets/zego-sdk.js"));
        await asset.downloadAsync();
        const scriptContent = await FileSystem.readAsStringAsync(asset.localUri);
        setLocalScript(scriptContent);
      } catch (error) {
        console.error("Failed to load local Zego script:", error);
        Alert.alert("Script Error", "Failed to load local Zego SDK script.");
      }
    };
    loadZegoScript();
  }, []);

  // Hide if call is not active or accepted (match web app)
  if (!isCallActive || !isCallAccepted) return null;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          html, body, #root { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script>
          ${localScript}
          window.onerror = function(message, source, lineno, colno, error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ error: message, source, lineno, colno, stack: error?.stack }));
          };

          let retryCount = 0;
          const maxRetries = 10;
          function waitForZegoSDK() {
            if (retryCount >= maxRetries) {
              window.ReactNativeWebView.postMessage("Failed to load ZegoUIKitPrebuilt after " + maxRetries + " retries");
              return;
            }
            if (window.ZegoUIKitPrebuilt) {
              try {
                const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
                  ${appID},
                  "${serverSecret}",
                  "${roomID}",
                  "${userID}",
                  "${userName}"
                );
                const zp = window.ZegoUIKitPrebuilt.create(kitToken);
                zp.joinRoom({
                  container: document.getElementById("root"),
                  scenario: { mode: window.ZegoUIKitPrebuilt.OneONoneCall },
                  turnOnCameraWhenJoining: true,
                  showMyCameraToggleButton: true,
                  showScreenSharingButton: true,
                  showTextChat: false,
                  showLeaveRoomConfirmDialog: false,
                  showRoomTimer: true,
                  showPreJoinView: false,
                  showLeavingView: false,
                  onLeaveRoom: () => {
                    window.ReactNativeWebView.postMessage("Left room");
                  },
                  onJoinRoom: () => {
                    window.ReactNativeWebView.postMessage("Joined room");
                  }
                });
                window.ReactNativeWebView.postMessage("Zego SDK initialized successfully");
              } catch (e) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ error: e.message, stack: e.stack }));
              }
            } else {
              window.ReactNativeWebView.postMessage("ZegoUIKitPrebuilt not loaded yet, retrying (" + (retryCount + 1) + "/" + maxRetries + ")...");
              retryCount++;
              setTimeout(waitForZegoSDK, 500);
            }
          }

          document.addEventListener("DOMContentLoaded", () => {
            waitForZegoSDK();
          });
        </script>
      </body>
    </html>
  `;

  const handleWebViewLoad = () => {
    console.log("WebView has loaded.");
  };

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error:", nativeEvent);
    Alert.alert("WebView Error", `Code: ${nativeEvent.code}\nDescription: ${nativeEvent.description}`);
  };

  const handleMessage = (event) => {
    console.log("WebView message:", event.nativeEvent.data);
    const message = event.nativeEvent.data;
    if (message === "Left room") {
      // Handle call end (e.g., update Zustand state, navigate back)
      console.log("Call ended, navigating back...");
      // route.navigation.goBack(); // Uncomment and adjust based on your navigation setup
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        setSupportMultipleWindows={false}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        onLoad={handleWebViewLoad}
        onError={handleWebViewError}
        onMessage={handleMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 30 : 0,
  },
});

export default TestCall;