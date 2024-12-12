
import React, { useState } from "react";
import { useEffect } from "react";
// reactstrap components
import { Card, CardHeader, CardBody, Row, Col } from "reactstrap";
import GeotagPage from "../components/Geotagging/GeotagPage";
import GoogleMap from "../components/Geotagging/GooogleMap";



const MapWrapper = () => {
  

  return (
    <>
      <div style={{ height: `100%` }} >
          {/* <GeotagPage/> */}
      </div>
    </>
  );
};

function Map() {
  return (
    <>
      <div className="content">
        <Row>
          <Col md="12" >
            <Card>
              <CardHeader>Maps</CardHeader>
              <CardBody>
                <div
                  id="map"
                  className="map"
                  style={{ position: "relative" }}
                >
          <GeotagPage/>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Map;
