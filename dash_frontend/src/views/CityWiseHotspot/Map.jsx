import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ onCityClick }) => {
    const [hotspots, setHotspots] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/hotspot/get-hotspots')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setHotspots(data.hotspots);
            })
            .catch(error => {
                console.error('Error fetching hotspots:', error);
            });
    }, []);

    return (
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '500px', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
            />
            {hotspots.map((hotspot, index) => {
                const randomRadius = Math.random() * 20000 + 5000;  // Random radius between 5000 and 25000 meters
                return (
                    <React.Fragment key={index}>
                        <Circle
                            center={[hotspot.latitude, hotspot.longitude]}
                            radius={randomRadius}
                            color="red"
                            fillOpacity={0.3}
                            eventHandlers={{
                                click: () => onCityClick({ name:hotspot.City,count:hotspot["Crime Count"] }),  // Using eventHandlers for onClic
                            }}
                        >
                            <Popup>
                                <strong>{hotspot.City}</strong><br />
                                Total Crimes: {hotspot["Crime Count"]}
                            </Popup>
                        </Circle>
                    </React.Fragment>
                );
            })}
        </MapContainer>
    );
};

export default Map;
