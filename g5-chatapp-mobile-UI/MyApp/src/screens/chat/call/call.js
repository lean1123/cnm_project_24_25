import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Vibration,
  Animated,
  StyleSheet,
} from "react-native";
import { Audio } from "expo-av";
import * as Animatable from "react-native-animatable";
import Icon from "react-native-vector-icons/FontAwesome5";
import useCallStore from "../../../store/useCallStore";

const CallScreen = ({ navigation, route }) => {
  const { conversationData } = route.params || {};
  const { ongoingCall, callConversationId, isCallGroup, handleAcceptCall, handleRejectCall } = useCallStore();

  const [sound, setSound] = useState(null);
  const [scaleValue] = useState(new Animated.Value(1));

  // Get caller info either from ongoingCall or passed params
  const callerName = ongoingCall?.sender?.firstName 
    ? `${ongoingCall.sender.firstName} ${ongoingCall.sender.lastName}` 
    : conversationData?.name || "Unknown";
  
  const callerAvatar = ongoingCall?.sender?.avatar || conversationData?.profilePicture || "https://i.pravatar.cc/150?img=5";
  const callType = ongoingCall?.type || "video";

  useEffect(() => {
    // Play ringtone
    playRingtone();
    // Start vibration
    Vibration.vibrate([1000, 500, 1000], true);
    animateAvatar();

    return () => {
      Vibration.cancel();
      stopRingtone();
    };
  }, []);

  // Avatar pulse animation
  const animateAvatar = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Play ringtone
  const playRingtone = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../../../assets/sounds/ringtone.mp3"),
        { shouldPlay: true, isLooping: true }
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing ringtone:", error);
    }
  };

  // Stop ringtone
  const stopRingtone = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
  };

  // Accept call
  const handleAccept = () => {
    stopRingtone();
    Vibration.cancel();
    
    if (callConversationId) {
      handleAcceptCall(callConversationId, isCallGroup);
      
      // Navigate to TestCall screen with the proper parameters
      navigation.replace('TestCall', {
        roomID: callConversationId,
        userID: ongoingCall?.sender?._id || conversationData?.id,
        userName: callerName,
        callType: callType
      });
    }
  };

  // Reject call
  const handleReject = () => {
    stopRingtone();
    Vibration.cancel();
    
    if (callConversationId) {
      handleRejectCall(callConversationId, isCallGroup);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleReject}>
          <Icon name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.text_header}>
          {callType === 'video' ? 'Video Call' : 'Voice Call'}
        </Text>
      </View>

      {/* Avatar with pulse animation */}
      <View style={styles.avatarSection}>
        <Animated.View style={[{ transform: [{ scale: scaleValue }] }]}>
          <Image
            source={{ uri: callerAvatar }}
            style={styles.avatarLarge}
          />
        </Animated.View>
        <Text style={styles.name}>{callerName}</Text>

        {/* Animated "Ringing..." text */}
        <Animatable.Text
          animation="pulse"
          iterationCount="infinite"
          style={styles.ringingText}
        >
          Ringing...
        </Animatable.Text>

        {/* Accept & reject buttons */}
        <View style={styles.callOptions}>
          <TouchableOpacity
            onPress={handleReject}
            style={styles.callCancel}
          >
            <Image
              source={require("../../../../assets/call/call-cancel.png")}
              style={styles.iconCall}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAccept}
            style={styles.callAccept}
          >
            <Image
              source={require("../../../../assets/call/call-accept.png")}
              style={styles.iconCall}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    width: "100%",
    height: "100%",
  },
  header: {
    width: "100%",
    height: 60,
    backgroundColor: "#135CAF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  text_header: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 24,
    marginRight: "30%",
  },
  avatarSection: {
    alignItems: "center",
    height: "100%",
    backgroundColor: "#1a1a1a",
    paddingTop: 50,
  },
  avatarLarge: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#3498db",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
  },
  ringingText: {
    fontSize: 18,
    color: "#e74c3c",
    fontWeight: "bold",
    marginTop: 30,
  },
  callOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 50,
    width: "80%",
  },
  callCancel: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e74c3c",
    padding: 20,
    borderRadius: 50,
  },
  callAccept: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2ecc71",
    padding: 20,
    borderRadius: 50,
  },
  iconCall: {
    width: 50,
    height: 50,
    tintColor: "#fff",
  },
});

export default CallScreen;
