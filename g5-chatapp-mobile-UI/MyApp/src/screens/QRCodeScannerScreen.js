import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

const QRCodeScannerScreen = () => {
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      // Parse QR code data - expected format: app://qr-login?sessionId=xxx
      if (data.startsWith('app://qr-login?sessionId=')) {
        const sessionId = data.split('sessionId=')[1];
        
        if (!sessionId) {
          Alert.alert('Lỗi', 'Mã QR không hợp lệ', [
            { text: 'OK', onPress: () => setScanned(false) }
          ]);
          return;
        }        // Get current user token for authentication
        const userToken = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('userData');
        
        if (!userToken) {
          Alert.alert('Lỗi', 'Bạn cần đăng nhập trước khi quét mã QR', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
          return;
        }

        console.log('QR Scanner - Using token:', userToken.substring(0, 20) + '...');
        console.log('QR Scanner - Session ID:', sessionId);        try {
          // Call verify QR code API
          console.log('QR Scanner - Making API call to:', `${API_URL}/auth/verify-qr-code`);
          const response = await fetch(`${API_URL}/auth/verify-qr-code`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify({ sessionId }),
          });

          console.log('QR Scanner - Response status:', response.status);
          console.log('QR Scanner - Response headers:', response.headers);

          if (response.ok) {
            const successData = await response.json();
            console.log('QR Scanner - Success response:', successData);
            Alert.alert(
              'Thành công',
              'Đăng nhập web thành công!',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack()
                }
              ]
            );
          } else {
            const errorData = await response.json();
            console.error('QR Scanner - Error response:', errorData);
            Alert.alert('Lỗi', errorData.message || 'Đăng nhập thất bại', [
              { text: 'OK', onPress: () => setScanned(false) }
            ]);
          }
        } catch (apiError) {
          console.error('API call error:', apiError);
          Alert.alert('Lỗi', 'Không thể kết nối đến server', [
            { text: 'OK', onPress: () => setScanned(false) }
          ]);
        }
      } else {
        Alert.alert('Lỗi', 'Mã QR không hợp lệ', [
          { text: 'OK', onPress: () => setScanned(false) }
        ]);
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert('Lỗi', 'Không thể xử lý mã QR', [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
    }
  };
  const handleScanAgain = () => {
    setScanned(false);
  };
  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Đang yêu cầu quyền truy cập camera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="camera-off" size={64} color="#666" />
        <Text style={styles.errorText}>
          Ứng dụng cần quyền truy cập camera để quét mã QR
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quét mã QR</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={toggleFlash}
        >
          <Icon 
            name={flashOn ? "flash" : "flash-off"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>      {/* Scanner */}
      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          enableTorch={flashOn}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          {/* Custom scanning overlay */}
          <View style={styles.overlay}>
            <View style={styles.unfocusedContainer} />
            <View style={styles.middleContainer}>
              <View style={styles.unfocusedContainer} />
              <View style={styles.focusedContainer}>
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
              </View>
              <View style={styles.unfocusedContainer} />
            </View>
            <View style={styles.unfocusedContainer} />
          </View>            {/* Bottom content overlay */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Đưa mã QR vào khung để quét
            </Text>
            <Text style={styles.subInstructionsText}>
              Quét mã QR trên màn hình web để đăng nhập
            </Text>
            
            {scanned && (
              <TouchableOpacity 
                style={styles.scanAgainButton}
                onPress={handleScanAgain}
              >
                <Text style={styles.scanAgainText}>Quét lại</Text>
              </TouchableOpacity>
            )}
          </View>
        </CameraView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#135CAF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleContainer: {
    flexDirection: 'row',
    height: 250,
  },
  focusedContainer: {
    width: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 220,
    height: 220,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },  instructionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  instructionsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subInstructionsText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  scanAgainButton: {
    backgroundColor: '#135CAF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRCodeScannerScreen;
