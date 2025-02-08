import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const Introduce = ({navigation}) => {
  const [currentScreen, setCurrentScreen] = useState(0);

  const screenData = [
    {
      image: require('../../assets/onboadrding/Introduce.png'),
      title: 'Group Chatting',
      description: 'Connect with multiple members in group chats.',
    },
    {
      image: require('../../assets/onboadrding/Introduce-2.png'),
      title: 'Video And Voice Calls',
      description: 'Instantly connect via video and voice calls.',
    },
    {
      image: require('../../assets/onboadrding/Introduce-3.png'),
      title: 'Message Encryption',
      description: 'Ensure privacy with encrypted messages.',
    },
    {
      image: require('../../assets/onboadrding/Introduce-4.png'),
      title: 'Cross-Platform Compatibility',
      description: 'Access chats on any device seamlessly.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Phần trên: Image, Title và Description */}
      <View style={styles.topContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={screenData[currentScreen].image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{screenData[currentScreen].title}</Text>
          <Text style={styles.description}>{screenData[currentScreen].description}</Text>
        </View>
      </View>

      {/* Phần dưới: Dot, Skip và Next */}
      <View style={styles.bottomContainer}>
        <View style={styles.pagination}>
          {screenData.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentScreen ? styles.activeDot : null]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {/* Nút Skip */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              console.log("Skipped!");
            }}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          {/* Nút Next */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (currentScreen < screenData.length - 1) {
                setCurrentScreen(currentScreen + 1);
              }
            }}
          >
            <Text style={styles.buttonText} onPress={() => {navigation.navigate('Home_Chat')}}>
              {currentScreen < screenData.length - 1 ? 'Next' : 'Get Started'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFF',
    alignItems: 'center',
  },
  topContainer: {
    flex: 2, // Phần trên chiếm 2 phần của màn hình
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  bottomContainer: {
    flex: 1, // Phần dưới chiếm 1 phần của màn hình
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 30,
  },
  imageContainer: {
    marginTop: 30,
    marginBottom: 20,
    width: '80%',
    height: '30%',
    maxHeight: 300,
    alignItems: 'center',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00008B',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#00008B',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D3D3D3',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#007BFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#007BFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Introduce;
