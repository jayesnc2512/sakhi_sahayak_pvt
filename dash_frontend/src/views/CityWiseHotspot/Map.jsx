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
import 'leaflet/dist/leaflet.css';
import './reactleaf.css';
import axios from 'axios'; // Import axios for API calls

// Create Icons
const blueIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const redIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const userLocationIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconSize: [30, 50],
  iconAnchor: [15, 50],
  popupAnchor: [1, -40],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [50, 50],
});

const Map = ({
  onCityClick,
  hotspots,
  crimeData,
  onCrimeClick,
  filteredCentroids,
  userLocation,
}) => {
  const [cameras, setCameras] = useState([]); // State for camera data
  const [selectedCamera, setSelectedCamera] = useState(null); // State for the selected camera
  const [colorToggle, setColorToggle] = useState(false);
//http://127.0.0.1:8000/cameras/getCameras
useEffect(() => {
  const fetchCameras = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/cameras/getCameras'); // Replace with your API endpoint
      const data = Array.isArray(response.data) ? response.data : []; // Ensure it's an array
      setCameras(data);
    } catch (error) {
      console.error('Error fetching camera data:', error);
      setCameras([]); // Fallback to empty array on error
    }
  };

  fetchCameras();
}, []);

  useEffect(() => {
    if (cameras.some((camera) => camera.alert)) {
      const intervalId = setInterval(() => {
        setColorToggle(alerts);
      }, 1000);
      console.log("alert", alerts)

      setTimeout(() => {
        clearInterval(intervalId);
        setColorToggle(false);
      }, 10000);
    }
  }, [cameras]);

  const getMarkerIcon = () => (colorToggle ? redIcon : blueIcon);

  const closeModal = () => setSelectedCamera(null);

  return (
    <div>
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
        {Array.isArray(hotspots) &&
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


        {/* Render Camera Markers */}
        <MarkerClusterGroup>
  {Array.isArray(cameras) &&
    cameras.map((camera) =>
      camera.lat && camera.lon ? (
        <Marker
          key={camera.id}
          position={[camera.lat, camera.lon]}
          icon={getMarkerIcon()}
          eventHandlers={{
            click: () => setSelectedCamera(camera),
          }}
        />
      ) : null
    )
    }
</MarkerClusterGroup>

        {/* Render User's Location Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lon]}
            icon={userLocationIcon}
          >
            <Popup>
              <strong>Your Current Location</strong>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Modal for Selected Camera */}
      {selectedCamera && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '8px',
              width: '400px',
            }}
          >
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
            >
              &times;
            </button>
            <h3>{selectedCamera.name}</h3>
            <p>Status: {selectedCamera.status}</p>
            <p>Location: {selectedCamera.lat}, {selectedCamera.lon}</p>
            <a
              href={selectedCamera.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Camera Stream
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;