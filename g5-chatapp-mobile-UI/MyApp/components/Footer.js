import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Footer = () => {
  const [selectedTab, setSelectedTab] = useState('Chats');

  const tabs = [
    { name: 'Chats', icon: 'message-text' },
    { name: 'Guest', icon: 'account-box' },
    { name: 'Profile', icon: 'account-circle' },
    { name: 'More', icon: 'dots-horizontal-circle' }
  ];

  return (
    <View style={styles.footer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.footerButton}
          onPress={() => setSelectedTab(tab.name)}
        >
          <Icon
            name={tab.icon}
            size={24}
            color={selectedTab === tab.name ? '#135CAF' : '#000'}
          />
          <Text style={[styles.footerText, selectedTab === tab.name && styles.selectedText]}>
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
