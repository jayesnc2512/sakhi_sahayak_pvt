import React, { useState,useEffect } from 'react';
import Map from './Map';
import StatsPanel from './StatsPanel';
import Charts from './Charts';
import {
    Collapse,
    Row,
    Col,
    Card,
    CardBody,
    CardHeader

} from "reactstrap";
import TransparentButton from './TransparentButton';
import "./index.css";

const CityWiseAnalysis = () => {
    const [cityData, setCityData] = useState([]);
    const [stats, setStats] = useState({});
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [hotspots, setHotspots] = useState([]);


    const handleCityClick = (city) => {
        fetch(`http://127.0.0.1:8000/hotspot/city-stats/${city.name}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                data.name = city.name;
                data.totalCount = city.count;
                data.rate = city.population_crime_ratio;
                setCityData(data);
                setStats(data.stats);
                setIsPanelOpen(true);
            })
            .catch(error => {
                console.error('Error fetching city data:', error);
            });
    };


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

    const togglePanel = () => setIsPanelOpen(!isPanelOpen);

    return (
        <div className='content'>
            <Row>
                <Col md="12" >
                <Card>
                    <CardHeader>
                        Statistics
                    </CardHeader>
                    {/* <CardBody> */}
                        <StatsPanel hotspots={hotspots} />
                    {/* </CardBody> */}
                    </Card>
                    </Col>
                <Col md="12">
                    <Card>
                        <CardHeader>Maps</CardHeader>
                        <CardBody>
                            <p >*Click on hostspot to get detailed analysis</p>

                            <Map onCityClick={handleCityClick} hotspots={hotspots} />
                            <Collapse isOpen={isPanelOpen}>
                                <div className={`side-panel ${isPanelOpen ? 'slide-in' : 'slide-out'}`}>
                                    <TransparentButton togglePanel={togglePanel} />
                                    <CardHeader style={{ padding: "0 px" }}>
                                        <h3>{cityData.name}</h3>
                                    </CardHeader>
                                    <CardBody>
                                        <Row>
                                            <Col md="6" >
                                                 Total Crimes: <h5>{cityData.totalCount}</h5>
                                            </Col>

                                            {/* <Col md="6">
                                                Crime Rate Per Population: <h5>{cityData.rate ? cityData.rate : "1111"}</h5>
                                            </Col> */}
                                        </Row>


                                        <Charts data={stats} name={cityData.name} totalCount={cityData.totalCount} />
                                        <p style={{fontSize:"10px"}}>
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

export default CityWiseAnalysis;
