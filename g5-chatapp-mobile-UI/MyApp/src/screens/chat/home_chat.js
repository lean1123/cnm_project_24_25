import React from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const navigation = useNavigation(); // Hook điều hướng

  const friends = [
    {
      id: "1",
      name: "Steve Jobs",
      lastMessage: "Good job, bro!",
      avatar: require("../../../assets/chat/man.png"),
    },
    {
      id: "2",
      name: "Elon Musk",
      lastMessage: "Great, thanks so much!",
      avatar: require("../../../assets/chat/man2.png"),
    },
    {
      id: "3",
      name: "Bill Gates",
      lastMessage: "Thanks a bunch!",
      avatar: require("../../../assets/chat/man.png"),
    },
    {
      id: "4",
      name: "Mark Zuckerberg",
      lastMessage: "I'm sorry, I can't help you!",
      avatar: require("../../../assets/chat/man2.png"),
    },
  ];

  const renderFriend = ({ item }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => navigation.navigate("ChatDetail", { friend: item })}
    >
      <Image source={item.avatar} style={styles.avatar} />
      <View>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.id}
        style={styles.friendList}
      />
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  friendList: {
    flex: 1,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  friendName: {
    fontWeight: "bold",
  },
  lastMessage: {
    color: "gray",
  },
});

export default HomeScreen;
