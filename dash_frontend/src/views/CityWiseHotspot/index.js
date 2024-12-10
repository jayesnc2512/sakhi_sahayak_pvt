import React, { useState, useEffect } from 'react';
import Map from './Map';
import StatsPanel from './StatsPanel';
import Charts from './Charts';
import { Collapse, Row, Col, Card, CardBody, CardHeader } from "reactstrap";
import TransparentButton from './TransparentButton';
import cityHotspotData from './easy_coordinates.json';
import "./index.css";
import crimeData from './updated_crime_data.json'; 
import { LatLngBounds } from 'leaflet'; 

const CityWiseHotspot = () => {
    const [cityData, setCityData] = useState({});
    const [stats, setStats] = useState({});
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [hotspots, setHotspots] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedCrime, setSelectedCrime] = useState(null); 
    const [crimeAnalysis, setCrimeAnalysis] = useState({ totalCrimes: 0, highestCrime: null });
    const [centroids, setCentroids] = useState({}); // To store centroids by cluster
    const [highestCluster, setHighestCluster] = useState(null); // To store the cluster with the highest points
    const [highestClusterAddress, setHighestClusterAddress] = useState(null); // To store the address of the cluster with the highest points

    useEffect(() => {
        const formattedHotspots = Object.keys(cityHotspotData).map(cityName => ({
            name: cityName,
            coordinates: cityHotspotData[cityName].coordinates,
            admin_name: cityHotspotData[cityName]?.admin_name || "Unknown",
            population: cityHotspotData[cityName]?.population || "Unknown",
        }));
        const sortedHotspots = formattedHotspots.sort((a, b) => a.name.localeCompare(b.name));

        setHotspots(sortedHotspots);
    }, []);

    const isCrimeInsideCity = (crime, city) => {
        if (!city || !city.coordinates || city.coordinates.length === 0) return false;

        const bounds = new LatLngBounds(city.coordinates);
        return bounds.contains([crime.latitude, crime.longitude]);
    };

    const handleCityClick = (city) => {
        // Filter crimes that are inside the city
        const cityCrimes = crimeData.filter(crime => crime.city.toLowerCase() === city.name.toLowerCase() && isCrimeInsideCity(crime, city));

        const totalCrimes = cityCrimes.length;

        // Analyze the most common crime type
        const crimeCount = {};
        cityCrimes.forEach(crime => {
            crimeCount[crime.crime_type] = (crimeCount[crime.crime_type] || 0) + 1;
        });

        const highestCrimeType = Object.keys(crimeCount).reduce((a, b) => crimeCount[a] > crimeCount[b] ? a : b, null);

        setCrimeAnalysis({ totalCrimes, highestCrime: highestCrimeType });
        
        const data = {
            name: city.name,
            totalCount: totalCrimes,
            rate: cityHotspotData[city.name]?.population_crime_ratio || 0,
            stats: cityHotspotData[city.name]?.stats || {},
        };
        setCityData(data);
        setStats(data.stats);
        setIsPanelOpen(true);
        setSelectedCrime(null); 

        // Calculate centroids for the crimes in the city
        calculateCentroids(cityCrimes);
    };

    const calculateCentroids = (crimes) => {
        const clusters = {};
        const clusterCounts = {}; // To keep track of the number of crimes in each cluster

        // Group crimes by cluster
        crimes.forEach(crime => {
            if (!clusters[crime.cluster]) {
                clusters[crime.cluster] = [];
                clusterCounts[crime.cluster] = 0; // Initialize count for this cluster
            }
            clusters[crime.cluster].push(crime);
            clusterCounts[crime.cluster] += 1; // Increment count for this cluster
        });

        // Calculate centroids
        const centroids = {};
        let maxCount = 0;
        let maxCluster = null;

        for (const cluster in clusters) {
            const clusterCrimes = clusters[cluster];
            const latSum = clusterCrimes.reduce((sum, crime) => sum + crime.latitude, 0);
            const lngSum = clusterCrimes.reduce((sum, crime) => sum + crime.longitude, 0);
            const centroidLat = latSum / clusterCrimes.length;
            const centroidLng = lngSum / clusterCrimes.length;
            centroids[cluster] = { latitude: centroidLat, longitude: centroidLng };

            if (clusterCounts[cluster] > maxCount) {
                maxCount = clusterCounts[cluster];
                maxCluster = cluster;
            }
        }

        setCentroids(centroids);
        setHighestCluster(maxCluster);

        // Fetch address for the highest cluster centroid
        if (maxCluster) {
            const { latitude, longitude } = centroids[maxCluster];
            fetchAddress(latitude, longitude);
        }
    };

    const fetchAddress = async (latitude, longitude) => {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await response.json();
        if (data.display_name) {
            setHighestClusterAddress(data.display_name);
        } else {
            setHighestClusterAddress("Address not found");
        }
    };

    const handleCrimeClick = (crime) => {
        setSelectedCrime(crime); 
        setIsPanelOpen(true); 
    };

    const handleCitySelect = (selectedCity) => {
        setSelectedCity(selectedCity);
        handleCityClick(selectedCity);
    };

    const togglePanel = () => setIsPanelOpen(!isPanelOpen);

    return (
        <div className="content">
            <Row>
                <Col md="12">
                    <Card>
                        <CardHeader>Statistics</CardHeader>
                        <StatsPanel
                            hotspots={hotspots}
                            onCitySelect={handleCitySelect}
                            totalCrimes={crimeAnalysis.totalCrimes}
                            mostCommonCrime={crimeAnalysis.highestCrime} 
                        />
                    </Card>
                </Col>
                <Col md="12">
                    <Card>
                        <CardHeader>Maps</CardHeader>
                        <CardBody style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
                        <p style={{ fontWeight: 'bold', color: '#333' }}>*Click on a hotspot to get detailed analysis</p>
                        <Map
                            onCityClick={handleCityClick}
                            onCrimeClick={handleCrimeClick} 
                            hotspots={selectedCity ? [selectedCity] : ''} 
                            crimeData={crimeData} 
                        />
                        <Collapse isOpen={isPanelOpen}>
                            <div className={`side-panel ${isPanelOpen ? 'slide-in' : 'slide-out'}`}>
                                <TransparentButton togglePanel={togglePanel} />
                                <CardHeader>
                                    <h3 style={{ color: '#007bff' }}>{selectedCrime ? selectedCrime.crime_type : cityData.name}</h3>
                                </CardHeader>
                                <CardBody style={{ backgroundColor: '#ffffff', borderRadius: '5px' }}>
                                    {selectedCrime ? (
                                        <Row>
                                            <Col md="6">
                                                <h5>Crime ID: {selectedCrime.id}</h5>
                                                <h5>Crime Type: {selectedCrime.crime_type}</h5>
                                                <h5>Timestamp: {selectedCrime.timestamp}</h5>
                                                <h5>Age of Victim: {selectedCrime.age_victim}</h5>
                                                <img src={selectedCrime.image_url} alt="Crime" style={{ width: '100%', height: 'auto', borderRadius: '5px' }} />
                                            </Col>
                                        </Row>
                                    ) : (
                                        <Row>
                                            <Col md="6">
                                                Total Crimes: <h5>{crimeAnalysis.totalCrimes}</h5>
                                                Most Common Crime: <h5>{crimeAnalysis.highestCrime}</h5>
                                                <br />
                                            </Col>
                                        </Row>
                                    )}
                                        {/* {Object.keys(centroids).length > 0 && (
                                            <Row>
                                                <Col md="6">
                                                    <h5>Cluster Centroids:</h5>
                                                    {Object.keys(centroids).map(cluster => (
                                                        <p key={cluster}>
                                                            Cluster {cluster}: ({centroids[cluster].latitude}, {centroids[cluster].longitude})
                                                        </p>
                                                    ))}
                                                </Col>
                                            </Row>
                                        )} */}
                                        {highestCluster !== null && (
                                            <Row>
                                                <Col md="6">
                                                    <h5>Cluster with the highest number of crimes:</h5>
                                                    <p>
                                                        Cluster {highestCluster}: ({centroids[highestCluster].latitude}, {centroids[highestCluster].longitude})
                                                    </p>
                                                    {highestClusterAddress && (
                                                        <p>Address: {highestClusterAddress}</p>
                                                    )}
                                                </Col>
                                            </Row>
                                        )}
                                        <p style={{ fontSize: "10px" }}>
                                            *hover over each section to get the counts
                                        </p>
 </CardBody>
                                </div>
                            </Collapse>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    ); 
};

export default CityWiseHotspot;