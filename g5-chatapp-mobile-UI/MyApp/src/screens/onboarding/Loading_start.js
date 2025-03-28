import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';

const Loading_start = ({ navigation }) => {
 return (
    <View style={styles.container}>
      {/* Ảnh có thể nhấn vào */}
      <TouchableOpacity onPress={() => navigation.navigate('Loading_Middle')}>
        <Image
          source={require('../../../assets/onboadrding/logo-chat-1.png')}
          style={styles.image}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
 container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 180,  
    height: 180, 
    marginBottom: 100, 
    borderRadius: 10, 
  },
});

export default Loading_start;
