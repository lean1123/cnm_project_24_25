import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const friendsList = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
  { id: '4', name: 'David' },
  { id: '5', name: 'Emma' },
  { id: '6', name: 'Frank' },
];

const GroupCallScreen = ({ navigation }) => {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const maxSelection = 5;

  const toggleSelection = (id) => {
    if (selectedFriends.includes(id)) {
      setSelectedFriends(selectedFriends.filter((fid) => fid !== id));
    } else {
      if (selectedFriends.length >= maxSelection) {
        Alert.alert('Limit Reached', `You can select up to ${maxSelection} members.`);
      } else {
        setSelectedFriends([...selectedFriends, id]);
      }
    }
  };

  const handleStartCall = () => {
    if (selectedFriends.length === 0) {
      Alert.alert('No Members Selected', 'Please select at least one member to start a call.');
      return;
    }
    console.log('Starting call with:', selectedFriends);
    // Implement call functionality here
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Start Group Call</Text>
      </View>

      <FlatList
        data={friendsList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.friendItem}
            onPress={() => toggleSelection(item.id)}
          >
            <Text style={styles.friendName}>{item.name}</Text>
            <Icon
              name={selectedFriends.includes(item.id) ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={24}
              color="#135CAF"
            />
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.callButton} onPress={handleStartCall}>
        <Text style={styles.buttonText}>Start Call</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginHorizontal: 20,
  },
  friendName: {
    fontSize: 16,
    color: '#000',
  },
  callButton: {
    backgroundColor: '#135CAF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default GroupCallScreen;