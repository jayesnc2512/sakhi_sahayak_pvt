import React, { useState, useEffect } from "react";
import L from "leaflet";
import styled from "styled-components";
import "leaflet/dist/leaflet.css";
import { Circle } from "./circle";
import markerIcon from "../../../node_modules/leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Marker.prototype.setIcon(
  L.icon({
    iconUrl: markerIcon,
  //  shadowUrl: markerShadow,
  iconSize: [18, 30], // New icon size (width, height)
  iconAnchor: [9, 30], // Anchor point at the bottom center of the icon
  popupAnchor: [1, -28], // Adjust popup anchor accordingly
  tooltipAnchor: [16, -28], // Adjust tooltip anchor accordingly
  //shadowSize: [41, 41] // Size of the shadow
  })
);



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
`;

const Gmaps = ({ cameras }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(15000);
  const [showNearbyCameras, setShowNearbyCameras] = useState(false);
  const [map, setMap] = useState(null);
  const [circleLayer, setCircleLayer] = useState(null);
  const [tileLayer, setTileLayer] = useState(null);

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

      L.marker(userLocation)
        .addTo(mapInstance)
        .bindPopup("Your Location")
        .openPopup();

      setMap(mapInstance);
    }
  }, [userLocation, map]);

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
