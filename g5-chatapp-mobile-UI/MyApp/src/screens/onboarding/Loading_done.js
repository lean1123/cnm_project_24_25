import React from 'react';
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native';

const Loading_done = ({ navigation }) => {
 return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.header}>
         <Image
          source={require('../../../assets/onboadrding/logo-mini.png')}
          style={styles.image_logo}
         />
        <Text style={styles.text_logo}>E-Chat</Text>
      </View>

      {/* body */}
      <TouchableOpacity onPress={() => navigation.navigate('Introduce')}>
        <Image
          source={require('../../../assets/onboadrding/Vector.png')}
          style={styles.image}
        />
        <View style={styles.container_text_body}>
          <Text style={styles.text_body}>Stay Connected</Text>
          <Text style={styles.text_body}>Stay Chatting</Text>
        </View>
      </TouchableOpacity>

      {/* footer */}
      <View style={styles.footer}>
        <Text style={styles.text_footer}>Version 1.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
 container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '55%',
    justifyContent: 'space-between',
    paddingTop: '20%'
  },
  footer: {
    alignItems: 'center',
    paddingBottom: '10%'
  },
  text_logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#0F4888'
  },
  image_logo: {
    width: 70,  
    height: 70, 
  },
  image: {
    width: 250,  
    height: 250, 
    marginBottom: 10, 
    borderRadius: 10, 
  },
  text_footer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F4888'
  },
  container_text_body: {
    flex: 1,
    alignItems: 'center',
    zIndex: 99,
    position: 'absolute',
    top: '35%',
    bottom: 0,
    left: '10%'

  },
  text_body: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F4888'
  },
});

export default Loading_done;
