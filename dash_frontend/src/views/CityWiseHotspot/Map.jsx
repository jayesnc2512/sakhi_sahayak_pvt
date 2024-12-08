import React from 'react';
import { MapContainer, TileLayer, Polygon, Popup, CircleMarker } from 'react-leaflet';
import { LatLngBounds } from 'leaflet'; 
import MarkerClusterGroup from 'react-leaflet-markercluster'; 
import 'leaflet/dist/leaflet.css';
import './reactleaf.css'; 

const Map = ({ onCityClick, hotspots, crimeData, onCrimeClick }) => {
    const isCrimeInsideCity = (crime, city) => {
        if (!city || !city.coordinates || city.coordinates.length === 0) return false;

        const bounds = new LatLngBounds(city.coordinates);
        return bounds.contains([crime.latitude, crime.longitude]);
    };

    return (
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '500px', width: '100%' }}>
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
                            radius={10}
                            color="red"
                            fillColor="red"
                            fillOpacity={0.5}
                            eventHandlers={{
                                click: () =>
                                    onCrimeClick(crime),
                            }}
                        >
                            <Popup>
                                <strong>{crime.crime_type}</strong>
                                <br />
                                Age of Victim: {crime.age_victim}
                                <br />
                                Timestamp: {crime.timestamp}
                            </Popup>
                        </CircleMarker>
                    ) : null;
                })}
            </MarkerClusterGroup>
        </MapContainer>
    );
};

export default Map;