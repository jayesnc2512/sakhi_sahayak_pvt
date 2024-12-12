import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  CircleMarker,
  Marker,
} from 'react-leaflet';
import { LatLngBounds, Icon } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useAlerts } from '../../context/AlertContext';  // Import the custom hook for alerts
import 'leaflet/dist/leaflet.css';
import './reactleaf.css';

// Create Icons
const blueIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',  // Default Leaflet blue marker
  iconSize: [25, 41], // Size of the marker
  iconAnchor: [12, 41], // Anchor point for the marker
  popupAnchor: [1, -34], // Anchor point for the popup
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',  // Shadow for the marker
  shadowSize: [41, 41], // Size of the shadow
});

const redIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',  // Red marker icon from Leaflet
  iconSize: [25, 41], // Size of the marker
  iconAnchor: [12, 41], // Anchor point for the marker
  popupAnchor: [1, -34], // Anchor point for the popup
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',  // Shadow for the marker
  shadowSize: [41, 41], // Size of the shadow
});

// Custom icon for user's current location
const userLocationIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png', // You can use a different icon or color for this
  iconSize: [30, 50], // Larger size for the user's location marker
  iconAnchor: [15, 50], // Anchor it properly at the bottom
  popupAnchor: [1, -40], // Anchor point for the popup
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [50, 50], // Shadow size
});

const Map = ({
  onCityClick,
  hotspots,
  crimeData,
  onCrimeClick,
  filteredCentroids,
  cameras,
  userLocation, // Assuming you pass user's location as props
}) => {
  const isCrimeInsideCity = (crime, city) => {
    if (!city || !city.coordinates || city.coordinates.length === 0) return false;

    const bounds = new LatLngBounds(city.coordinates);
    return bounds.contains([crime.latitude, crime.longitude]);
  };

  const { alerts } = useAlerts(); // Access alerts from context
  const [activeMarkers, setActiveMarkers] = useState({}); // Track active markers and their colors
  const [colorToggle, setColorToggle] = useState(false); // For toggling the colors (blue-red-blue-red)
  
  // Update camera marker color on alert detection
  useEffect(() => {
    if (alerts.length > 0) {
      const intervalId = setInterval(() => {
        setColorToggle((prev) => !prev);
      }, 1000);

      // Stop the toggling after 10 seconds
      setTimeout(() => {
        clearInterval(intervalId);
        setColorToggle(false); // Reset color toggle
      }, 10000);
    }
  }, [alerts]); // When alerts change, the effect runs

  // Function to get the correct icon based on color toggle
  const getMarkerIcon = () => (colorToggle ? redIcon : blueIcon);

  return (

    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
      />

      {/* Render Hotspot Polygons */}
      {hotspots.length > 0 &&
        hotspots.map((hotspot, index) => (
          <Polygon
            key={index}
            positions={hotspot.coordinates}
            color="blue"
            weight={3}
            fillColor="transparent"
            fillOpacity={0}
            eventHandlers={{
              click: () =>
                onCityClick({
                  name: hotspot.name,
                  totalCount: hotspot.totalCount || 0,
                  crime_rate: hotspot.crime_rate || 0,
                }),
            }}
          >
            <Popup>
              <strong>{hotspot.name}</strong>
              <br />
              Total Crimes: {hotspot.totalCount || 'N/A'}
              <br />
              Crime Rate: {hotspot.crime_rate?.toFixed(2) || 'N/A'}
            </Popup>
          </Polygon>
        ))}

      {/* Render Crime CircleMarkers if they are within city bounds */}
      <MarkerClusterGroup>
        {crimeData.map((crime) => {
          let isInside = false;
          for (const city of hotspots) {
            if (isCrimeInsideCity(crime, city)) {
              isInside = true;
              break;
            }
          }

          return isInside ? (
            <CircleMarker
              key={crime.id}
              center={[crime.latitude, crime.longitude]}
              radius={5}
              fillColor="red"
              color="red"
              weight={1}
              fillOpacity={0.8}
              eventHandlers={{
                click: () => onCrimeClick(crime),
              }}
            >
              <Popup>
                <strong>{crime.name}</strong>
                <br />
                {crime.details}
              </Popup>
            </CircleMarker>
          ) : null;
        })}
      </MarkerClusterGroup>

      {/* Render Camera Markers */}
      <MarkerClusterGroup>
        {cameras.map((camera) => (
          <Marker
            key={camera.id}
            position={[camera.lat, camera.lon]}
            icon={getMarkerIcon()}  // Change icon based on the color toggle state
          >
            <Popup>
              <strong>{camera.name}</strong>
              <br />
              Status: {camera.status}
              <br />
              <a href={camera.link} target="_blank" rel="noopener noreferrer">
                View Camera
              </a>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      {/* Render User's Location Marker */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lon]}
          icon={userLocationIcon} // Custom icon for user's location
        >
          <Popup>
            <strong>Your Current Location</strong>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default Map;
