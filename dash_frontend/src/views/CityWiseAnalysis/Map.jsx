import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ onCityClick,hotspots }) => {
   

    return (
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '500px', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
            />
            {hotspots.map((hotspot, index) => {
                return (
                    <React.Fragment key={index}>
                        <Polygon
                            positions={hotspot.coordinates[0]}
                            color="red"
                            fillOpacity={0.3}
                            eventHandlers={{
                                click: () => onCityClick({ name: hotspot.City, count: hotspot.crime_count }), // Using eventHandlers for onClick
                            }}
                        >
                            <Popup>
                                <strong>{hotspot.City}</strong><br />
                                Total Crimes: {hotspot.crime_rate.toFixed(2)}
                            </Popup>
                        </Polygon>
                    </React.Fragment>
                );
            })}
        </MapContainer>
    );
};

export default Map;
