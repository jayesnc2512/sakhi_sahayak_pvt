import React, { useState, useEffect } from 'react';
import SmallCard from "../../components/SmallCard.js";
import { Bs0Square } from "react-icons/bs";
import { PiBuildingOffice } from "react-icons/pi";
import { FaPeopleGroup } from "react-icons/fa6";
import { PiMathOperationsThin } from "react-icons/pi";
import { GiHandcuffed } from "react-icons/gi";
import { RiWomenLine } from "react-icons/ri";
import { GiHandcuffs } from "react-icons/gi";




import {
    Collapse,
    Row,
    Col,
    Card,
    CardBody,
    CardHeader,
    Button,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Label
} from "reactstrap";

const StatsPanel = ({ hotspots }) => {
    const [year, setYear] = useState("2020");
    const [city, setCity] = useState();
    // const [selectedCity, setSelectedCity] = useState({});
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const handleYearChange = (e) => {
        setYear(e.target.value);
    };

    const handleCityChange = (e) => {
        setCity(JSON.parse(e.target.value));
        // console.log(e.target.value);
    };

    return (
        <>
            <Row className="justify-content-start m-3 mb-4">
                {/* Year Dropdown */}
                <Col sm="3">
                    <Label for="yearDropdown">Year</Label>
                    <select
                        id="yearDropdown"
                        className="form-control"
                        value={year}
                        onChange={handleYearChange}
                    >
                        <option value="2020">2020</option>
                    </select>
                </Col>

                {/* City Dropdown */}
                <Col sm="3">
                    <Label for="cityDropdown">City</Label>
                    <select
                        id="cityDropdown"
                        className="form-control"
                        value={city}
                        onChange={handleCityChange}
                    >
                        <option value="">{city ? city.City:"Select City"}</option>
                        {hotspots && hotspots.map((hotspot, index) => (
                            <option key={index} value={JSON.stringify(hotspot)}>{hotspot.City}</option>
                        ))}
                    </select>
                </Col>
                <SmallCard head={"State"} number={city ? city.admin_name : "...."} Icon={<PiBuildingOffice color='orange' />} />
                <SmallCard head={"Population"} number={city ? city.population : "..."} Icon={<FaPeopleGroup />} />
            </Row>

            <Row className="justify-content-center">
                <SmallCard head={"Crime Rate"} number={city ? city.crime_rate?.toFixed(2) :"...."} Icon={<PiMathOperationsThin />} />
                <SmallCard head={"Total Crimes"} number={city ? city.crime_count:"...."}Icon={<GiHandcuffed color='red' />} />
                <SmallCard head={"Against Women"} number={city ? city.against_women : "...."} Icon={<RiWomenLine color='red' />} />
                <SmallCard head={"Other Crimes"} number={city ? (city.crime_count-city.against_women):"...."} Icon={<GiHandcuffs />} />
            </Row>
        </>
    );
};

export default StatsPanel;
