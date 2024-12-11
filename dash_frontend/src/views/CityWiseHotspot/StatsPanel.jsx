import React, { useState } from 'react';
import { Row, Col, Label } from "reactstrap";
import SmallCard from "../../components/SmallCard.js";
import { PiBuildingOffice } from "react-icons/pi";
import { FaPeopleGroup } from "react-icons/fa6";

const StatsPanel = ({ hotspots, onCitySelect, totalCrimes, mostCommonCrime }) => {
    const [city, setCity] = useState("");

    const handleCityChange = (e) => {
        const selectedCity = JSON.parse(e.target.value);
        setCity(selectedCity.name); 
        onCitySelect(selectedCity);
    };

    return (
        <>
            <Row className="justify-content-start m-3 mb-4">
                <Col sm="3">
                    <Label for="cityDropdown">City</Label>
                    <select
                        id="cityDropdown"
                        className="form-control"
                        value={city ? JSON.stringify(hotspots.find(h => h.name === city)) : ""} 
                        onChange={handleCityChange}
                    >
                        <option value="">Select City</option>
                        {hotspots.map((hotspot, index) => (
                            <option key={index} value={JSON.stringify(hotspot)}>
                                {hotspot.name}
                            </option>
                        ))}
                    </select>
                </Col>
                <SmallCard
                    head={"Total Crimes"}
                    number={totalCrimes || "..." }
                    Icon={<FaPeopleGroup />}
                />
                <SmallCard
                    head={"Most Common Crime"}
                    number={mostCommonCrime || "..." }
                    Icon={<FaPeopleGroup />}
                />
            </Row>
        </>
    );
};

export default StatsPanel;
