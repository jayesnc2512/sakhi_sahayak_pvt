import React, { useState, useEffect } from "react";
import L from "leaflet";
import styled from "styled-components";
import "leaflet/dist/leaflet.css";
import { useAlerts } from "../../context/AlertContext"; // Import the custom hook


// Import custom icons
import markerIconUrl from "../../../node_modules/leaflet/dist/images/marker-icon.png"; // Default marker icon for user location
import cameraIconUrl from "./camera-icon.png"; // Camera icon
import alertIconUrl from "./alert-icon.png"; // Alert icon

// Create icons
const userMarkerIcon = L.icon({
  iconUrl: markerIconUrl,
  iconSize: [25, 41], // Default size
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const cameraIcon = L.icon({
  iconUrl: cameraIconUrl,
  iconSize: [30, 30], // Adjust size for cameras
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const alertIcon = L.divIcon({
  className: "blinking-icon", // Use CSS for blinking effect
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const GmapsWrap = styled.div`
  position: relative;

  .control-panel {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: white;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .tile-toggle {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background-color: #fff;
    color: #333;
    font-size: 14px;
    font-weight: bold;
    padding: 8px 12px;
    border: 2px solid #333;
    border-radius: 5px;
    cursor: pointer;
    text-align: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    z-index: 1000;

    &:hover {
      background-color: #f0f0f0;
    }
  }

  #map {
    height: 75vh; /* Ensure the map container has a visible height */
    width: 100%; /* Full width for the map container */
  }

    .blinking-icon {
    background-image: url(${alertIconUrl});
    background-size: cover;
    width: 30px;
    height: 30px;
    animation: blink 1s infinite;
    z-index:10000;
  }

  @keyframes blink {
    50% {
      opacity: 0.5;
    }
  }
`;

const Gmaps = ({ cameras }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(15000);
  const [showNearbyCameras, setShowNearbyCameras] = useState(false);
  const [map, setMap] = useState(null);
  const [circleLayer, setCircleLayer] = useState(null);
  const [tileLayer, setTileLayer] = useState(null);
  const [alertMarkers, setAlertMarkers] = useState([]);
  const { alerts } = useAlerts(); // Consume alerts from context


  useEffect(() => {
    // Get user location
    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting user's location:", error.message);
        }
      );
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (userLocation && !map) {
      const mapInstance = L.map("map").setView(userLocation, 13);

      const defaultTileLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "© OpenStreetMap contributors",
        }
      );
      defaultTileLayer.addTo(mapInstance);

      setTileLayer(defaultTileLayer);

      // Add user location marker with the user icon
      L.marker(userLocation, { icon: userMarkerIcon })
        .addTo(mapInstance)
        .bindPopup("Your Location")
        .openPopup();

      setMap(mapInstance);
    }
  }, [userLocation, map]);

  useEffect(() => {
    // Add camera markers once the map is initialized and cameras data is available
    if (map && cameras) {
      cameras.forEach((camera) => {
        const cameraLatLng = [camera.lat, camera.lon];
        L.marker(cameraLatLng, { icon: cameraIcon }) // Use the camera icon here
          .addTo(map)
          .bindPopup(`
            <div>
              <h4>${camera.Name}</h4>
              <p>Status: ${camera.status}</p>
              <p>Latitude: ${camera.lat || "No information available"}</p>
              <p>Longitude: ${camera.lon || "No information available"}</p>
              <p>Link: <a href="${camera.link}" target="_blank">${camera.link || "No link"}</a></p>
            </div>
          `);
      });
    }
  }, [map, cameras]);


  useEffect(() => {
    if (map && alerts) {
      // Clear existing alert markers
      alertMarkers.forEach((marker) => map.removeLayer(marker));

      // Add new alert markers
      const newMarkers = alerts.map((alert) => {
        const marker = L.marker([alert.lat, alert.lon], { icon: alertIcon })
          .addTo(map)
          .bindPopup(`
            <div>
              <h4>${alert.sourceName}</h4>
              <p>${alert.message}</p>
              <p>Latitude: ${alert.lat}</p>
              <p>Latitude: ${alert.lon}</p>
            </div>
          `);
        return marker;
      });

      setAlertMarkers(newMarkers);
    }
  }, [map, alerts]);

  const handleRadiusChange = (event) => {
    const newRadius = Number(event.target.value);
    setRadius(newRadius);

    if (circleLayer) {
      circleLayer.setRadius(newRadius);
    }
  };

  const handleToggleNearbyCameras = () => {
    setShowNearbyCameras((prevState) => {
      if (prevState && circleLayer) {
        map.removeLayer(circleLayer);
        setCircleLayer(null);
      }
      return !prevState;
    });

    if (!showNearbyCameras && map && userLocation) {
      const newCircle = L.circle(userLocation, {
        radius,
        color: "red",
        fillColor: "pink",
        fillOpacity: 0.5,
      }).addTo(map);

      setCircleLayer(newCircle);
    }
  };

  const toggleTileColor = () => {
    if (tileLayer) {
      map.removeLayer(tileLayer);
    }

    const newTileLayerUrl =
      tileLayer._url === "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const newTileLayer = L.tileLayer(newTileLayerUrl, {
      attribution: "© OpenStreetMap contributors",
    });

    newTileLayer.addTo(map);
    setTileLayer(newTileLayer);
  };

  return (
    <GmapsWrap>
      <div id="map"></div>
      <div className="control-panel">
        <label>Radius:</label>
        <input
          type="range"
          min="15000"
          max="1500000"
          value={radius}
          onChange={handleRadiusChange}
        />
        <button onClick={handleToggleNearbyCameras}>
          {showNearbyCameras ? "Hide Nearby Cameras" : "Show Nearby Cameras"}
        </button>
      </div>
      <div className="tile-toggle" onClick={toggleTileColor}>
        Toggle Map Tile
      </div>
    </GmapsWrap>
  );
};

export default Gmaps;
