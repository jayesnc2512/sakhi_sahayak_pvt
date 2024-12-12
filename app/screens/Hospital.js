import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';
// import { Map, TileLayer, Marker, Popup } from 'expo-leaflet';
const HospitalScreen = () => {
  const [policeStations, setPoliceStations] = useState([]);
  const [location, setLocation] = useState({
    latitude: 19.025288,
    longitude: 72.853413,
  });

//   useEffect(() => {
//     const getLocation = async () => {
//       const { status } = await Location.requestPermissionsAsync();
//       if (status !== 'granted') {
//         console.log('Permission not granted');
//         return;
//       }

//       const location1 = await Location.getCurrentPositionAsync();
//       setLocation(location1.coords);

//       console.log('Current location:', location1.coords);
//     };

//     getLocation();
//   }, []);

 
useEffect(() => {
  if (location) {
    const getNearbyPoliceStations = async () => {
      try {
        const headers = {
          'User -Agent': 'YourAppName/1.0 (your.email@example.com)', // Replace with your app name and contact email
          'Accept': 'application/json',
        };

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=hospital+mumbai&limit=10&lat=19.025288&lon=72.853413`;
        const response = await axios.get(url, { headers });
        const data = response.data;

        const policeStations = data.map((result) => ({
          name: result.name,
          address: result.display_name,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),

        }));

        setPoliceStations(policeStations);
      } catch (error) {
        console.error('Error fetching police stations:', error);
      }
    };

    getNearbyPoliceStations();
  }
}, [location]);
  return (
    <View style={styles.container}>
      {/* {location && policeStations.length > 0 ? (
        <Map
          style={styles.map}
          center={[location.latitude, location.longitude]}
          zoom={13}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          {policeStations.map((station, index) => (
            <Marker
              key={index}
              coordinate={[parseFloat(station.latitude), parseFloat(station.longitude)]}
            >
              <Popup>
                <Text>{station.name}</Text>
              </Popup>
            </Marker>
          ))}
        </Map>
      ) : (
        <Text>Loading...</Text>
      )} */}
      <View style={styles.titleContainer}>
      <FlatList
        data={policeStations}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => {
            // const address = item.address.replace(item.name, '').trim();
            return (
            <TouchableOpacity style={styles.policeStation}>
                <View style={styles.stationInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.address}>{item.address}</Text>
                <Text style={styles.phone}>+91 9322342311</Text>
                </View>
                <TouchableOpacity style={styles.callButton}>
                <Ionicons name="call" size={24} color="#fff" />
                </TouchableOpacity>
            </TouchableOpacity>
            );
        }}
        />
</View>
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#fff',
    padding: 30,
  },
  titleContainer: {
    padding: 10,
    paddingTop: 30
  },
  map: {
    height: 300,
    marginBottom: 20,
  },
  policeStation: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  stationInfo: {
    flex: 1,
  },

  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  address: {
    fontSize: 16,
    color: '#666',
  },

  phone: {
    fontSize: 16,
    color: '#666',
  },

  callButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
});

export default HospitalScreen;