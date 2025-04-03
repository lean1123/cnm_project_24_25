import React, { useState } from "react";
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

const callScreen = ({navigation}) => {
  const userData = {
    id: 1,
    name: "Nguyen Duc Nhat",
    phone: "(+84) 123 456 789",
    avata: "",
  };

  {/* handle accept call */}
  const handleAcceptCall = () => {
    // awai 2s to go screen 
    setTimeout(() => {
    navigation.navigate("callingScreen", { userData });
    }, 700);
  };
  {/* handle cancel call */}
  const handleCancelCall = () => {
    // awai 2s to go screen 
    setTimeout(() => {
    navigation.goBack();
    }, 500);
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

        {/* Call Options */}

        <View style={styles.callOptions}>
          <TouchableOpacity
            onPress={handleCancelCall}
            style={styles.callCancel}
          >
            <Image
              source={require("../../../../assets/call/call-cancel.png")}
              style={styles.iconCallCancel}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAcceptCall}
            style={styles.callCancel}

          >
            <Image
              source={require("../../../../assets/call/call-accept.png")}
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
    height: 65,
    width: "75%",
    marginTop: "20%",
  },
  callCancel: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
  },
  iconCallCancel: {
    width: 60,
    height: 60,
  },
});
export default callScreen;
