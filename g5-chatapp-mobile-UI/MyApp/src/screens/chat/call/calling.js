import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  PanResponder,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

const CallingScreen = ({ navigation }) => {
  const userData = {
    id: 1,
    name: "Nguyen Duc Nhat",
    phone: "(+84) 123 456 789",
  };

  const [time, setTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isCameraMuted, setIsCameraMuted] = useState(false);
  const [isCallFullScreen, setIsCallFullScreen] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 50, y: 50 });

  const timerRef = useRef(null);

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, []);

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const handleCancelCall = () => {
    stopTimer();
    Alert.alert("Cancel Call", "Are you sure you want to cancel this call?", [
      { text: "Cancel", style: "cancel" },
      { text: "OK", onPress: () => navigation.navigate("Home_Chat") },
    ]);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        setDragPosition({
          x: gestureState.moveX,
          y: gestureState.moveY,
        });
      },
    })
  ).current;


  const toggleMute = () => {
    setIsMuted(!isMuted);
    Alert.alert("Microphone", `Microphone is now ${isMuted ? "unmuted" : "muted"}`);
  };

  const toggleAudioMute = () => {
    setIsAudioMuted(!isAudioMuted);
    Alert.alert("Audio", `Audio is now ${isAudioMuted ? "unmuted" : "muted"}`);
  };

  const toggleCameraMute = () => {
    setIsCameraMuted(!isCameraMuted);
    Alert.alert("Camera", `Camera is now ${isCameraMuted ? "unmuted" : "muted"}`);
  };

  const toggleFullScreen = () => {
    setIsCallFullScreen(!isCallFullScreen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.text_header}>
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.phone}>{userData.phone}</Text>
        </View>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.mainVideoContainer}>
          <Image
            source={{ uri: "https://i.imgur.com/hxdrcDj.jpeg" }}
            style={styles.mainVideo}
          />

          <View style={styles.timeCallingContainer}>
            <Text style={styles.timeCallingText}>{formatTime(time)}</Text>
          </View>
        </View>

        {!isCallFullScreen && (
          <View
            style={[
              styles.smallVideoContainer,
              { left: dragPosition.x, top: dragPosition.y },
            ]}
            {...panResponder.panHandlers}
          >
            <Image
              source={{ uri: "https://i.imgur.com/K9yxphq.jpeg" }}
              style={styles.smallVideo}
            />
          </View>
        )}

        <View style={styles.callOptions}>
          <TouchableOpacity onPress={toggleMute} style={styles.callCancel}>
            <Icon
              name={isMuted ? "microphone-slash" : "microphone"}
              size={30}
              color="black"
              style={styles.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleAudioMute} style={styles.callCancel}>
            <Icon
              name={isAudioMuted ? "volume-mute" : "volume-up"}
              size={30}
              color="black"
              style={styles.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleCameraMute}
            style={styles.callCancel}
          >
            <Icon
              name={isCameraMuted ? "video-slash" : "video"}
              size={30}
              color="black"
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleFullScreen}
            style={styles.callCancel}
          >
            <Icon
              name={isCallFullScreen ? "compress" : "expand"}
              size={30}
              color="black"
              style={styles.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCancelCall}
            style={styles.callCancel}
          >
            <Image
              source={require("../../../../assets/call/call-cancel.png")}
              style={styles.iconCallCancel}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    width: "100%",
    height: "100%",
    marginTop: 20,
  },
  header: {
    width: "100%",
    height: 60,
    backgroundColor: "#135CAF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    position: "absolute",
    top: 0,
    zIndex: 100,
  },
  text_header: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "25%",
  },
  avatarSection: {
    alignItems: "center",
    height: "100%",
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    position: "absolute",
    top: 60,
    width: "100%",
  },
  mainVideoContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  mainVideo: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
  smallVideoContainer: {
    position: "absolute",
    width: 140,
    height: 100,
    borderRadius: 10,
    backgroundColor: "gray",
    borderWidth: 2,
    borderColor: "white",
    bottom: 10,
    left: 10,
    zIndex: 200,
  },
  smallVideo: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    objectFit: "cover",
  },
  timeCallingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ccc",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 7,
    position: "absolute",
    top: "0%",
    left: "57%",
    transform: [{ translateX: -75 }],
    zIndex: 300,
  },
  timeCallingText: {
    fontSize: 20,
    color: "#000",
    fontWeight: "bold",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  phone: {
    fontSize: 16,
    color: "#888",
  },
  callOptions: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    position: "absolute",
    bottom: "10%",
    left: 0,
    right: 0,
    zIndex: 400,
    backgroundColor: "#fff",
  },
  callCancel: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  iconCallCancel: {
    width: 40,
    height: 40,
  },
  icon: {
    width: 34,
    height: 30,
    resizeMode: "contain",
    alignSelf: "center",
  },
});

export default CallingScreen;
