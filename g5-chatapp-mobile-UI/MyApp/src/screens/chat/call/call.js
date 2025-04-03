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

const CallScreen = ({ navigation }) => {
  const userData = {
    id: 1,
    name: "Nguyen Duc Nhat",
    phone: "(+84) 123 456 789",
  };

  const [sound, setSound] = useState(null);
  const [scaleValue] = useState(new Animated.Value(1));

  useEffect(() => {
    // Bắt đầu phát nhạc chuông
    playRingtone();
    // Bắt đầu rung (dừng khi người dùng chấp nhận/từ chối cuộc gọi)
    Vibration.vibrate([1000, 500, 1000], true);
    animateAvatar();

    return () => {
      Vibration.cancel();
      stopRingtone();
    };
  }, []);

  // Hiệu ứng sáng avatar
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

  // Phát nhạc chuông
  const playRingtone = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../../../assets/sounds/ringtone.mp3"),
        { shouldPlay: true, isLooping: true }
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error("Lỗi phát nhạc chuông:", error);
    }
  };

  // Dừng nhạc chuông
  const stopRingtone = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
  };

  // Chấp nhận cuộc gọi
  const handleAcceptCall = () => {
    stopRingtone();
    Vibration.cancel();
    navigation.navigate("CallingScreen", { userData });
  };

  // Từ chối cuộc gọi
  const handleCancelCall = () => {
    stopRingtone();
    Vibration.cancel();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text>
            <Icon name="chevron-left" size={24} color="#fff" />
          </Text>
        </TouchableOpacity>
        <Text style={styles.text_header}>Incoming Call...</Text>
      </View>

      {/* Avatar với hiệu ứng sáng */}
      <View style={styles.avatarSection}>
        <Animated.View style={[{ transform: [{ scale: scaleValue }] }]}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=5" }}
            style={styles.avatarLarge}
          />
        </Animated.View>
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.phone}>{userData.phone}</Text>

        {/* Hiệu ứng chữ Ringing... */}
        <Animatable.Text
          animation="pulse"
          iterationCount="infinite"
          style={styles.ringingText}
        >
          Ringing...
        </Animatable.Text>

        {/* Nút chấp nhận & từ chối */}
        <View style={styles.callOptions}>
          <TouchableOpacity
            onPress={handleCancelCall}
            style={styles.callCancel}
          >
            <Image
              source={require("../../../../assets/call/call-cancel.png")}
              style={styles.iconCall}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAcceptCall}
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
    backgroundColor: "#black",
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
    backgroundColor: "#fff",
  },
  avatarLarge: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#007AFF",
    marginTop: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  phone: {
    fontSize: 16,
    color: "#888",
    marginTop: 3,
  },
  ringingText: {
    fontSize: 18,
    color: "red",
    fontWeight: "bold",
    marginTop: 10,
  },
  callOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    width: "80%",
  },
  callCancel: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 50,
  },
  callAccept: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 50,
  },
  iconCall: {
    width: 70,
    height: 70,
  },
});

export default CallScreen;
