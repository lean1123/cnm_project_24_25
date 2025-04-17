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
    { name: 'Chats', icon: 'message-text-outline', screen: 'Home_Chat' },
    { name: 'Contacts', icon: 'account-multiple-outline', screen: 'FriendsList' },
    { name: 'Profile', icon: 'account-circle-outline', screen: 'Profile' },
    { name: 'Settings', icon: 'cog-outline', screen: 'Settings' }
  ];

  return (
    <View style={styles.footerContainer}>
      <View style={styles.footer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={[
              styles.footerButton,
              selectedTab === tab.screen && styles.selectedButton
            ]}
            onPress={() => handlePress(tab.name, tab.screen)}
          >
            <Icon
              name={tab.icon}
              size={24}
              color={selectedTab === tab.screen ? '#135CAF' : '#666'}
            />
            <Text 
              style={[
                styles.footerText,
                selectedTab === tab.screen && styles.selectedText
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectedButton: {
    backgroundColor: 'rgba(19, 92, 175, 0.1)',
  },
  footerText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
    fontWeight: '500',
  },
  selectedText: {
    color: '#135CAF',
    fontWeight: '600',
  },
});

export default Footer;
