import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from "react-native";
import { WebView } from 'react-native-webview';
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const LocationScreen = ({ navigation, route }) => {  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("đang lấy địa chỉ...");
  const initialLocation = route.params?.initialLocation;
  const [isLoading, setIsLoading] = useState(true);
  const [hasLocationError, setHasLocationError] = useState(false);
  useEffect(() => {
    const getLocation = async () => {
      try {
        // If we have an initial location (viewing existing), use that
        if (initialLocation) {
          setLocation({
            coords: {
              latitude: initialLocation.latitude,
              longitude: initialLocation.longitude
            }
          });
          await getAddress(initialLocation.latitude, initialLocation.longitude);
          setIsLoading(false);
          return;
        }

        // Otherwise get current location (for sending new location)
        console.log("Requesting location permissions...");
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          console.log("Location permission denied");
          alert('Cần quyền truy cập vị trí để gửi vị trí. Vui lòng cấp quyền trong cài đặt.');
          setIsLoading(false);
          return;
        }

        console.log("Getting current location...");
          // For Android emulator, use a more relaxed accuracy setting
        let loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 10000, // Reduced timeout
          maximumAge: 60000, // Allow cached location up to 1 minute old
        });
        
        console.log("Location obtained:", loc);
        setLocation(loc);
        await getAddress(loc.coords.latitude, loc.coords.longitude);
      } catch (error) {
        console.error("Error getting location:", error);
          // Provide fallback location for emulators (Hanoi, Vietnam)
        console.log("Using fallback location for emulator...");
        setHasLocationError(true);
        const fallbackLocation = {
          coords: {
            latitude: 21.0285,
            longitude: 105.8542
          }
        };
        setLocation(fallbackLocation);
        await getAddress(fallbackLocation.coords.latitude, fallbackLocation.coords.longitude);
        
        // Show a more user-friendly message
        alert("Không thể lấy vị trí chính xác, đang sử dụng vị trí mẫu (Hà Nội). Bạn có thể gửi vị trí này hoặc thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    getLocation();
  }, [initialLocation]);

  const getAddress = async (lat, lon) => {
    try {
      let response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      let data = await response.json();
      const displayAddress = data.display_name || "Không tìm thấy địa chỉ";
      setAddress(displayAddress);
      return displayAddress;
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Không thể lấy địa chỉ");
      return "Không thể lấy địa chỉ";
    }
  };

  const handleSendLocation = async () => {
    if (location) {
      try {
        // Get the current address before sending
        const currentAddress = await getAddress(
          location.coords.latitude,
          location.coords.longitude
        );

        const locationData = {
          content: `${location.coords.latitude},${location.coords.longitude}`,
          type: "TEXT",
          address: currentAddress,
          isLocation: true // Add this flag to identify location messages
        };

        // Preserve the original conversation parameter when navigating back
        const originalConversation = route.params?.conversation;
        
        console.log("Sending location data:", {
          locationData,
          conversation: originalConversation
        });

        // First navigate back
        navigation.goBack();
        
        // Then update the params of ChatDetailScreen
        navigation.navigate("ChatDetail", {
          conversation: originalConversation,
          locationMessage: locationData
        });
      } catch (error) {
        console.error("Error sending location:", error);
        alert("Không thể gửi vị trí. Vui lòng thử lại.");
      }
    } else {
      alert("Không thể lấy vị trí. Vui lòng thử lại.");    }
  };

  const useSampleLocation = async () => {
    try {
      setIsLoading(true);
      const sampleLocation = {
        coords: {
          latitude: 21.0285,
          longitude: 105.8542
        }
      };
      setLocation(sampleLocation);
      await getAddress(sampleLocation.coords.latitude, sampleLocation.coords.longitude);
      setHasLocationError(false);
    } catch (error) {
      console.error("Error setting sample location:", error);
      alert("Không thể thiết lập vị trí mẫu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const retryLocation = async () => {
    setIsLoading(true);
    setHasLocationError(false);
    setLocation(null);
    
    try {
      console.log("Retrying location...");
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setHasLocationError(true);
        alert('Cần quyền truy cập vị trí để gửi vị trí. Vui lòng cấp quyền trong cài đặt.');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
        maximumAge: 60000,
      });
      
      setLocation(loc);
      await getAddress(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      console.error("Retry location error:", error);
      setHasLocationError(true);
      alert("Vẫn không thể lấy vị trí chính xác. Bạn có thể sử dụng vị trí mẫu bên dưới.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={30} color="white" />
            <Text style={styles.headerTitle}>Location</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0099ff" />
          <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!location) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={30} color="white" />
            <Text style={styles.headerTitle}>Location</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Không thể tải bản đồ</Text>
        </View>
      </SafeAreaView>
    );
  }

  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          #map {
            width: 100%;
            height: 100%;
            background: #f0f0f0;
          }
          .leaflet-control-container {
            display: none;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', {
            zoomControl: false,
            attributionControl: false
          }).setView([${location.coords.latitude}, ${location.coords.longitude}], 15);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);
          
          L.marker([${location.coords.latitude}, ${location.coords.longitude}])
            .addTo(map)
            .bindPopup('${address}')
            .openPopup();
        </script>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={30} color="white" />
          <Text style={styles.headerTitle}>Location</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          source={{ html: mapHTML }}
          style={styles.map}
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onError={(error) => console.error("Error loading map:", error)}
          androidHardwareAccelerationDisabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.mapLoadingContainer}>
              <ActivityIndicator size="large" color="#0099ff" />
            </View>
          )}
        />
      </View>      {!initialLocation && (
        <View style={styles.bottomContainer}>
          {hasLocationError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                ⚠️ Đang sử dụng vị trí mẫu (Hà Nội)
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.retryButton]}
                  onPress={retryLocation}
                >
                  <Icon name="refresh" size={20} color="#135CAF" />
                  <Text style={styles.retryButtonText}>Thử lại</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.sampleButton]}
                  onPress={useSampleLocation}
                >
                  <Icon name="map-marker" size={20} color="#ff6b35" />
                  <Text style={styles.sampleButtonText}>Dùng vị trí mẫu</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSendLocation}
          >
            <Icon name="send" size={20} color="white" />
            <Text style={styles.sendButtonText}>
              {hasLocationError ? "Gửi vị trí mẫu" : "Gửi vị trí hiện tại"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#135CAF",
    height: 60,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 15,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  mapLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },  sendButton: {
    backgroundColor: '#135CAF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  errorContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  errorText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  retryButton: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#135CAF',
  },
  retryButtonText: {
    color: '#135CAF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  sampleButton: {
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: '#ff6b35',
  },
  sampleButtonText: {
    color: '#ff6b35',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  }
});

export default LocationScreen;
