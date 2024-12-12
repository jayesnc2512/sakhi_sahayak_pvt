import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, Vibration } from 'react-native';
import { ExpoLeaflet } from 'expo-leaflet';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
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
  const [modalVisible, setModalVisible] = useState(false); 
  const OPENROUTE_API_KEY = '5b3ce3597851110001cf6248d441e502ecae4e58832a077c03f07dfd';

  const hotspots = [
    { center: { lat: 19.0295559 + 0.04, lng: 72.8506955 + 0.04 }, radius: 500 },
    { center: { lat: 19.0295559, lng: 72.8506955 }, radius: 700 },
    { center: { lat: 19.085559, lng: 72.8606955 }, radius: 500 },
    { center: { lat: 19.0495559, lng: 72.8906955 }, radius: 500 },

  ];
  const polygonHotspots = [
    {
      id: "polygon-1",
      coordinates: [
        { lat: 19.0295559, lng: 72.8506955 },
        { lat: 19.0299559, lng: 72.8919955 },
        { lat: 19.0308559, lng: 72.8516955 },
        { lat: 19.0365559, lng: 72.8506955 },
        { lat: 19.0295559, lng: 72.8506955 }, // Closing the polygon
      ],
      color: "#EB3223",
    },
  ];
  // useEffect(() => {
  //   if (hotspotVisible) {
  //     setMapShapes(
  //       polygonHotspots.map((polygon) => ({
  //         shapeType: "polygon",
  //         id: polygon.id,
  //         positions: polygon.coordinates,
  //         color: polygon.color,
  //       }))
  //     );
  //   } else {
  //     setMapShapes([]);
  //   }
  // }, [hotspotVisible]);
    
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    };

    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (hotspotVisible) {
      setMapShapes(hotspots.map((hotspot, index) => ({
        shapeType: 'circle',
        color: '#EB3223',
        id: `hotspot-${index + 1}`,
        center: hotspot.center,
        radius: hotspot.radius,
      })));
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
            position: { lat: latitude, lng: longitude },
            icon: '📍',
            size: [32, 32],
          }
        ]);
        setMapCenterPosition({ lat: latitude, lng: longitude });

        checkIfInHotspot(latitude, longitude);
      }
    };

    getLocationAsync().catch((error) => {
      console.error(error);
    });

    const watchHeading = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
      }

      Location.watchHeadingAsync((heading) => {
        setUserHeading(heading.trueHeading);
      });
    };

    watchHeading();
  }, []);

  const checkIfInHotspot = (latitude, longitude) => {
    hotspots.forEach((hotspot) => {
      const distance = getDistance(
        { lat: latitude, lng: longitude },
        hotspot.center
      );
      if (distance <= hotspot.radius) {
        sendNotification();
        Vibration.vibrate(3000);
        setModalVisible(true); // Show the modal when entering a hotspot
      }
    });
  };

  const getDistance = (point1, point2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(point2.lat - point1.lat);
    const dLon = toRad(point2.lng - point1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Distance in meters
  };

  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hotspot Alert",
        body: "You are entering a hotspot location!",
      },
      trigger: null,
    });
  };

  const handleModalResponse = (response) => {
    setModalVisible(false); // Close the modal
    if (response === 'yes') {
      navigation.navigate('SafeMode'); // Navigate to SafeMode page
    }
  };

  const toggleOptions = () => {
    setShowOptionButtons(!showOptionButtons);
  };

  const fetchRoute = async (destination) => {
    if (!ownPosition) return;
  
    const start = ownPosition[0].position;
    const end = destination;
  
    // Prepare the avoid polygons in the correct format
    const avoidPolygons = polygonHotspots.map((polygon) => ({
      type: "Polygon",
      coordinates: [
        polygon.coordinates.map(({ lat, lng }) => [lng, lat]), // Note the order: [lng, lat]
      ],
    }));
  
    // Construct the URL with the avoid_polygons parameter
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${OPENROUTE_API_KEY}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}&avoid_polygons=${encodeURIComponent(JSON.stringify(avoidPolygons))}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data?.features?.[0]?.geometry?.coordinates) {
        const coordinates = data.features[0].geometry.coordinates;
        const polyline = coordinates.map(([lng, lat]) => ({ lat, lng }));
  
        setMapShapes((prevShapes) => [
          ...prevShapes,
          {
            shapeType: "polyline",
            color: "#3388FF",
            id: "route",
            positions: polyline,
          },
        ]);
        console.log("Route fetched:", polyline);
      } else {
        console.error("No route found or invalid response:", data);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };
  

  const handleNearbyClick = () => {
    setTimeout(() => {
      setNearbyVisible(!nearbyVisible);
      const safePlace = { lat: 19.0295559 + 0.004, lng: 72.8506955 + 0.009 };
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
              <Text style={[styles.optionButtonText, nearbyVisible && styles.activeButtonText]}>
                Nearby Safe Places
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[
                styles.optionButton,
                hotspotVisible && styles.activeButton,
              ]}
              onPress={handleHotspotClick}
            >
              <Text style={[styles.optionButtonText, hotspotVisible && styles.activeButtonText]}>
                Hotspot Areas
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

      {/* Modal for Safe Mode Alert */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Safe Mode?</Text>
            <Text style={styles.modalMessage}>You are entering a hotspot location!</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => handleModalResponse('yes')}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => handleModalResponse('no')}>
                <Text style={styles.modalButtonText}>Ignore</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#9150E4',
  },
  activeButton: {
    backgroundColor: '#9150E4',
  },
  activeButtonText: {
    color: '#fff',
  },
  optionButtonText: {
    color: '#9150E4',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#9150E4',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default MapScreen;