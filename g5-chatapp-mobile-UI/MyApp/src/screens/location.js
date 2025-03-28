import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const LocationScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("đang lấy địa chỉ...");

  useEffect(() => {
    const getLocation = async () => {
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      console.log(
        "location latitude (vĩ độ - ngang): " + location.coords.latitude
      );
      console.log(
        "location longitude (kinh độ - dọc): " + location.coords.longitude
      );
      getAddress(location.coords.latitude, location.coords.longitude);
    };
    getLocation();
  }, []);

  const getAddress = async (lat, lon) => {
    try {
      let response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      let data = await response.json();
      console.log("data: ", data.display_name);
      setAddress(data.display_name || "Không tìm thấy địa chỉ");
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  if (!location) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={{ alignItems: "center", justifyContent: "center" }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => navigation.goBack()}
        >
          <Icon
            name="chevron-left"
            size={40}
            color="#fff"
            style={{ padding: 10 }}
          />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#fff",
              marginLeft: "38%"
        
            }}
          >
            Location
          </Text>
        </TouchableOpacity>
      </View>
      <MapView
        style={{ width: "100%", height: "100%" }}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Vị trí của bạn"
          description={address.toString()}
        />
      </MapView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#135caf",
    width: "100%",
    marginTop: 60,
  },
});

export default LocationScreen;
