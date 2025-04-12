import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Footer from "../../components/Footer";
import Header from "../../components/Header";
const friends = [
  { id: '1', name: 'Alice Johnson', avatar: require("../../../assets/chat/man2.png"), online: true },
  { id: '2', name: 'Bob Smith', avatar: require("../../../assets/chat/man2.png"), online: false },
  { id: '3', name: 'Charlie Brown', avatar: require("../../../assets/chat/man2.png"), online: true },
  { id: '4', name: 'Diana Prince', avatar: require("../../../assets/chat/man2.png"), online: false },
];

const FriendsListScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
    <Header />
      <Text style={styles.title}>List Friend</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.friendItem} onPress={() => navigation.navigate("ChatDetail", { friend: item })}>
            <Image source={ item.avatar} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={item.online ? styles.online : styles.offline}>{item.online ? 'Online' : 'Offline'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
    
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 15,
    color: "#135CAF",
    backgroundColor: "rgba(221, 236, 247, 0.5)",
    paddingBottom: 10,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  info: {
    marginLeft: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  online: {
    color: 'green',
  },
  offline: {
    color: 'gray',
  },
});

export default FriendsListScreen;
