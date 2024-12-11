import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import "leaflet/dist/leaflet.css";

const LiveLocationMap = () => {
  const [location, setLocation] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    // Connect to the WebSocket for live location updates
    ws.current = new WebSocket('ws://127.0.0.1:8000/ws/live-loc');

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLocation(data); // Update location with the incoming data
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => ws.current.close(); // Clean up the WebSocket connection when the component unmounts
  }, []);

  return (
    <MapContainer
      center={location ? [location.latitude, location.longitude] : [0, 0]}
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {location && (
        <Marker position={[location.latitude, location.longitude]}>
          <Popup>
            Current Location<br />
            Lat: {location.latitude}<br />
            Lng: {location.longitude}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default LiveLocationMap;
