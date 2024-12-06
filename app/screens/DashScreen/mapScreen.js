import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { ExpoLeaflet } from 'expo-leaflet';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

const mapLayers = [
  {
    attribution: '&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    baseLayerIsChecked: true,
    baseLayerName: 'OpenStreetMap',
    layerType: 'TileLayer',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
];

const mapOptions = {
  attributionControl: false,
  zoomControl: false,
};

const initialPosition = {
  lat: 51.4545,
  lng: 2.5879,
};

const MapScreen = ({ navigation }) => {
  const [zoom, setZoom] = useState(7);
  const [mapCenterPosition, setMapCenterPosition] = useState(initialPosition);
  const [ownPosition, setOwnPosition] = useState(null);
  const [userHeading, setUserHeading] = useState(0);
  const [showOptionButtons, setShowOptionButtons] = useState(false);
  const [markers, setMarkers] = useState([]);  
  const [nearbyVisible, setNearbyVisible] = useState(false);
  const [hotspotVisible, setHotspotVisible] = useState(false); 
  const [mapShapes, setMapShapes] = useState([]);
  const OPENROUTE_API_KEY = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    if (hotspotVisible) {
      setMapShapes([
        {
          shapeType: 'circle',
          color: '#EB3223',
          id: 'hotspot-1',
          center: { lat: 18.9977445, lng: 73.1228996 },
          radius: 500,
        },
        {
          shapeType: 'circle',
          color: '#EB3223',
          id: 'hotspot-2',
          center: { lat: 18.9977445, lng: 73.1228996 },
          radius: 250,
        },
        {
          shapeType: 'circle',
          color: '#EB3223',
          id: 'hotspot-3',
          center: { lat: 18.9977445, lng: 73.1228996 },
          radius: 1000,
        },
      ]);
    } else {
      setMapShapes([]);
    }
  }, [hotspotVisible]);
  

  useEffect(() => {
    const getLocationAsync = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      if (location.coords) {
        const { latitude, longitude } = location.coords;
        setOwnPosition([
          {
            id: '1',
            position: { 
              lat: latitude, lng: longitude 
            },
            icon: '📍',
            size: [32, 32],        
          }
        ]);
        setMapCenterPosition({ lat: latitude, lng: longitude });
      }
    };

    getLocationAsync().catch((error) => {
      console.error(error);
    });

    const watchHeading = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      Location.watchHeadingAsync((heading) => {
        setUserHeading(heading.trueHeading);
      });
    };

    watchHeading();
  }, []);

  const toggleOptions = () => {
    setShowOptionButtons(!showOptionButtons);
  };
  const fetchRoute = async (destination) => {
    if (!ownPosition) return;
  
    const start = ownPosition[0].position;
    const end = destination;

    const apiKey = OPENROUTE_API_KEY;
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data?.features?.[0]?.geometry?.coordinates) {
        const coordinates = data.features[0].geometry.coordinates;
        const polyline = coordinates.map(([lng, lat]) => ({ lat, lng }));
  
        setMapShapes((prevShapes) => [
          ...prevShapes,
          {
            shapeType: 'polyline',
            color: '#3388FF',
            id: 'route',
            positions: polyline,
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };
  
  const handleNearbyClick = () => {
    setTimeout(() => {
    setNearbyVisible(!nearbyVisible);
    const safePlace = { lat: 18.9977445 + 0.001, lng: 73.1228996 + 0.001 };
    if (!nearbyVisible) {
      const newMarker = {
        id: 'safe-place',
        position: safePlace,
        icon: '🔹',
        size: [32, 32],
      };
      setMarkers((prev) => [...prev, newMarker]);
      fetchRoute(safePlace);
    } else {
      setMapShapes((prevShapes) => prevShapes.filter((shape) => shape.id !== 'route'));
      setMarkers((prev) => prev.filter((marker) => marker.id !== 'safe-place'));
    }
  }, 500); 
  };
  
  const handleHotspotClick = () => {
    setTimeout(() => {
    setHotspotVisible(!hotspotVisible);
  }, 500); 
  };

  const mapMarkers = ownPosition ? [...ownPosition, ...markers] : markers;


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapheader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Dash')}>
          <Image source={require('../../assets/backbutton.png')} style={styles.settingsIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsButton} onPress={toggleOptions}>
          <Image source={require('../../assets/settings.png')} style={styles.settingsIcon} />
        </TouchableOpacity>

        {showOptionButtons && (
          <View style={styles.optionButtons}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                nearbyVisible && styles.activeButton, 
              ]}
              onPress={handleNearbyClick}
            >
              <Text style={styles.optionButtonText}>
                {nearbyVisible ? 'Safe Places Active' : 'Nearby Safe Places'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                hotspotVisible && styles.activeButton, // Use a different style for active state
              ]}
              onPress={handleHotspotClick}
            >
              <Text style={styles.optionButtonText}>
                {hotspotVisible ? 'Hotspot Active' : 'Hotspot Areas'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={{ flex: 1, position: 'relative' }}>
        <ExpoLeaflet
          loadingIndicator={() => <ActivityIndicator />}
          mapCenterPosition={mapCenterPosition}
          mapLayers={mapLayers}
          mapMarkers={mapMarkers}  
          mapShapes={mapShapes}
          mapOptions={mapOptions}
          zoom={zoom}
          onMessage={(message) => {
            // Handle map messages (like zoom or click events)
          }}
        />
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomButton} onPress={() => Alert.alert('Police Stations')}>
          <Text style={styles.bottomButtonText}>Police Stations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={() => Alert.alert('Hospitals')}>
          <Text style={styles.bottomButtonText}>Hospitals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={() => Alert.alert('Medical')}>
          <Text style={styles.bottomButtonText}>Medical</Text>
        </TouchableOpacity>
      </View>
     </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  mapheader: {
    position: 'absolute',
    top: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    borderRadius: 25,
    padding: 5,
    elevation: 1,
  },
  settingsButton: {
    padding: 10,
    borderRadius: 25,
    elevation: 10,
  },
  settingsIcon: {
    width: 40,
    height: 40,
  },
  optionButtons: {
    position: 'absolute',
    top: 50,
    right: 60,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    zIndex: 20,
  },
  optionButton: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#9150E4',
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: '#C5A7EC', 
  },
  optionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#ddd',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  bottomButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  bottomButtonText: {
    fontSize: 16,
    color: '#9150E4',
    fontWeight: '600',
  },
});

export default MapScreen;
