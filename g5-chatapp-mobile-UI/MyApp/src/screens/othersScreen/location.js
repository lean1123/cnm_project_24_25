import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from "react-native";
import { WebView } from 'react-native-webview';
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const LocationScreen = ({ navigation, route }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("đang lấy địa chỉ...");
  const initialLocation = route.params?.initialLocation;
  const [isLoading, setIsLoading] = useState(true);

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
          getAddress(initialLocation.latitude, initialLocation.longitude);
          return;
        }

        // Otherwise get current location (for sending new location)
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('Permission to access location was denied');
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        getAddress(loc.coords.latitude, loc.coords.longitude);
      } catch (error) {
        console.error("Error getting location:", error);
        alert("Không thể lấy vị trí. Vui lòng thử lại.");
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
      alert("Không thể lấy vị trí. Vui lòng thử lại.");
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
      </View>

      {!initialLocation && (
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSendLocation}
        >
          <Text style={styles.sendButtonText}>Gửi vị trí</Text>
        </TouchableOpacity>
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
  },
  sendButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#135CAF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
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
  }
});

export default LocationScreen;
