import React, { useState, useEffect } from 'react';
import Map from './Map';
import StatsPanel from './StatsPanel';
import Charts from './Charts';
import { Collapse, Row, Col, Card, CardBody, CardHeader } from "reactstrap";
import TransparentButton from './TransparentButton';
import cityHotspotData from './easy_coordinates.json';
import "./index.css";
import crimeData from './crimeData1.json';

const CityWiseHotspot = () => {
    const [cityData, setCityData] = useState({});
    const [stats, setStats] = useState({});
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [hotspots, setHotspots] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedCrime, setSelectedCrime] = useState(null); // State for selected crime

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

    const handleCityClick = (city) => {
        const data = {
            name: city.name,
            totalCount: cityHotspotData[city.name]?.totalCount || 0,
            rate: cityHotspotData[city.name]?.population_crime_ratio || 0,
            stats: cityHotspotData[city.name]?.stats || {},
        };
        setCityData(data);
        setStats(data.stats);
        setIsPanelOpen(true);
        setSelectedCrime(null); 
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
                        <StatsPanel hotspots={hotspots} onCitySelect={handleCitySelect} />
                    </Card>
                </Col>
                <Col md="12">
                    <Card>
                        <CardHeader>Maps</CardHeader>
                        <CardBody>
                            <p>*Click on a hotspot to get detailed analysis</p>
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
                                        <h3>{selectedCrime ? selectedCrime.crime_type : cityData.name}</h3>
                                    </CardHeader>
                                    <CardBody>
                                        {selectedCrime ? (
                                            <Row>
                                                <Col md="6">
                                                    <h5>Crime ID: {selectedCrime.id}</h5>
                                                    <h5>Crime Type: {selectedCrime.crime_type}</h5>
                                                    <h5>Timestamp: {selectedCrime.timestamp}</h5>
                                                    <h5>Age of Victim: {selectedCrime.age_victim}</h5>
                                                    <img src={selectedCrime.image_url} alt="Crime" style={{ width: '100%', height: 'auto' }} />
                                                </Col>
                                            </Row>
                                        ) : (
                                            <Row>
                                                <Col md="6">
                                                    Total Crimes: <h5>{cityData.totalCount}</h5>
                                                </Col>
                                            </Row>
                                        )}
                                        <Charts data={stats} name={cityData.name} totalCount={cityData.totalCount} />
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