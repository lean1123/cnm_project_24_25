import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Footer from "../../components/Footer";
import Header from "../../components/Header";
const friends = [
  { id: '1', name: 'Alice Johnson', avatar: 'https://randomuser.me/api/portraits/women/1.jpg', online: true },
  { id: '2', name: 'Bob Smith', avatar: 'https://randomuser.me/api/portraits/men/2.jpg', online: false },
  { id: '3', name: 'Charlie Brown', avatar: 'https://randomuser.me/api/portraits/men/3.jpg', online: true },
  { id: '4', name: 'Diana Prince', avatar: 'https://randomuser.me/api/portraits/women/4.jpg', online: false },
];

const FriendsListScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
    <Header />
      <Text style={styles.title}>Danh sách bạn bè</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.friendItem} onPress={() => navigation.navigate('FriendDetail', { friend: item })}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
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
    backgroundColor: '#fff',
    
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
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
