import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const Footer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedTab, setSelectedTab] = useState('Chats');

  useEffect(() => {
    setSelectedTab(route.name);
  }, [route.name]);

  const handlePress = (tabName, screen) => {
    setSelectedTab(tabName);
    navigation.navigate(screen);
  };

  const tabs = [
    { name: 'Chats', icon: 'message-text', screen: 'Home_Chat' },
    { name: 'Contacts', icon: 'account-box', screen: 'FriendsList' },
    { name: 'Profile', icon: 'account-circle', screen: 'Profile' },
    { name: 'More', icon: 'dots-horizontal-circle', screen: 'Settings' }
  ];

  return (
    <View style={styles.footer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.footerButton}
          onPress={() => handlePress(tab.name, tab.screen)}
        >
          <Icon
            name={tab.icon}
            size={24}
            color={selectedTab === tab.screen ? '#135CAF' : '#000'}
          />
          <Text style={[styles.footerText, selectedTab === tab.screen && styles.selectedText]}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEEEEE',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderTopWidth: 0.5,
    borderColor: '#ccc',
    height: 55,
  },
  footerButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 11,
    marginTop: 2,
  },
  selectedText: {
    color: '#135CAF',
    fontWeight: 'bold',
  },
});

export default Footer;
