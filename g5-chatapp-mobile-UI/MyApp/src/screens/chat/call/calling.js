import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  Alert,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

const callingScreen = ({ navigation }) => {
  const userData = {
    id: 1,
    name: "Nguyen Duc Nhat",
    phone: "(+84) 123 456 789",
    avata: "",
  };

  //   time calling run
  // set time calling increse 1s
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimer = () => {
    setIsRunning(true);
    setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
  };
  const stopTimer = () => {
    setIsRunning(false);
    clearInterval();
  };
  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
  };
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  // handel click cancel call
  const handleCancelCall = () => {
    stopTimer();
    Alert.alert("Cancel Call", "Are you sure you want to cancel this call?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => console.log("OK Pressed"),
      },
    ]);
  };

  // handle press and move image to any position in screen
  const handlePress = () => {
    Alert.alert("Image Pressed", "You pressed the image!");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.text_header}>Calling ...</Text>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=5" }}
          style={styles.avatarLarge}
        />
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.phone}>{userData.phone}</Text>

        {/* image call of user  */}
        <TouchableOpacity
          style={{ position: "absolute", top: "42%", left: "67%" }}
          onPress={handlePress}
        >
          <Image
            source={{ uri: "https://i.imgur.com/v6T9FGz.jpeg" }}
            style={{
              width: 120,
              height: 150,
              position: "absolute",
              resizeMode: "cover",
              borderWidth: 3,
              borderColor: "#ccc",
            }}
          />
        </TouchableOpacity>

        {/*time calling*/}
        <View style={styles.timeCallingContainer}>
          <Text style={styles.timeCallingText}>{formatTime(time)}</Text>
        </View>

        {/* Call Options */}
        <View style={styles.callOptions}>
          {/* micophone icon */}

          <TouchableOpacity
            onPress={() => Alert.alert("Muted microphone")}
            style={styles.callCancel}
          >
            <View style={styles.btnContainer}>
              <Icon name="microphone" size={30} color="black" />
            </View>
          </TouchableOpacity>
          {/* volume icon */}

          <TouchableOpacity
            onPress={() => Alert.alert("Volume muted")}
            style={styles.callCancel}
          >
            <View style={styles.btnVolumeContainer}>
              <Icon name="volume-off" size={30} color="black" />
            </View>
          </TouchableOpacity>
          {/* video icon */}

          <TouchableOpacity
            onPress={() => Alert.alert("Video muted")}
            style={styles.callCancel}
          >
            <View style={styles.btnVideoContainer}>
              <Icon name="video" size={30} color="black" />
            </View>
          </TouchableOpacity>
          {/* cancel icon */}
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
  },
  text_header: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 24,
    marginRight: "37%",
  },
  avatarSection: {
    alignItems: "center",
    height: "100%",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  avatarLarge: {
    width: 150,
    height: 150,
    borderRadius: "100%",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#007AFF",
    marginTop: "15%",
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
  callOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingHorizontal: 20,
    height: 85,
    width: "75%",
    marginTop: "5%",
  },
  callCancel: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
  },
  iconCallCancel: {
    width: 50,
    height: 50,
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "100%",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
  },
  btnVideoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "100%",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
  },
  btnVolumeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "100%",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
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
    marginTop: "50%",
    maxHeight: 40,
    width: "25%",
  },
  timeCallingText: {
    fontSize: 20,
    color: "#000",
    fontWeight: "bold",
  },
});
export default callingScreen;
