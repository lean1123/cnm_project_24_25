import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Vibration,
  Platform,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import useCallStore from '../../../store/useCallStore';

const { width } = Dimensions.get('window');

const IncomingCall = ({ route }) => {
  const navigation = useNavigation();
  const { 
    handleAcceptCall, 
    handleRejectCall,
    setCallAccepted,
    setCallRejected,
    callType = 'video'
  } = useCallStore();

  const { caller = {}, conversationId } = route.params || {};
  const callerName = caller.firstName ? `${caller.firstName} ${caller.lastName || ''}` : 'Unknown';

  useEffect(() => {

    const pattern = [1000, 2000, 1000];
    const interval = setInterval(() => {
      Vibration.vibrate(pattern);
    }, 4000);

    // Play ringtone here if needed


    return () => {
      clearInterval(interval);
      Vibration.cancel();

    };
  }, []);

  const onAcceptCall = () => {

    Vibration.cancel();
    

    setCallAccepted();
    handleAcceptCall();

    navigation.replace('TestCall', {
      roomID: conversationId,
      userID: caller._id,
      userName: callerName,
      callType
    });
  };

  const onRejectCall = () => {

    Vibration.cancel();
    
    setCallRejected();
    handleRejectCall(conversationId);
    
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.callerInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {callerName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.callerName}>{callerName}</Text>
        <Text style={styles.callType}>
          Incoming {callType === 'video' ? 'Video' : 'Audio'} Call...
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={onRejectCall}
        >
          <Icon name="phone-slash" size={30} color="#fff" />
          <Text style={styles.actionText}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]}
          onPress={onAcceptCall}
        >
          <Icon name={callType === 'video' ? 'video' : 'phone'} size={30} color="#fff" />
          <Text style={styles.actionText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'space-between',
    padding: 20,
  },
  callerInfo: {
    alignItems: 'center',
    marginTop: 60,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  callerName: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  callType: {
    fontSize: 16,
    color: '#bbb',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    width: width,
    paddingHorizontal: 30,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  acceptButton: {
    backgroundColor: '#2ecc71',
  },
  actionText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 12,
  },
});

export default IncomingCall; 