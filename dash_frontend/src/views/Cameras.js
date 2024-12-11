import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Table,
  Row,
  Col,
} from "reactstrap";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Player from "../components/CamPlay/player";
import styled from "styled-components";
import json1 from '../views/json1.json';
const PlayButton = styled.button`
  font-size: 1rem;
  cursor: pointer;
  margin-right: 10px;
`;

const StopButton = styled.button`
  font-size: 1rem;
  cursor: pointer;
`;
const CameraCell = styled.div`
border: 1px solid #ddd;
padding: 10px;
margin: 5px;
text-align: center;
position: relative;
padding-bottom: 56.25%; /* 16:9 aspect ratio */
overflow: hidden;
width: 100%;

.placeholder {
  background-color: #121212;
  color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
`;

const EmptyCell = styled.div`
border: 1px solid #ddd;
padding: 10px;
margin: 5px;
text-align: center;
position: relative;
padding-bottom: 56.25%; /* 16:9 aspect ratio */
overflow: hidden;
width: 100%;

.placeholder {
  background-color: #121212;
  color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
`;

const Cameras = () => {
  const [cameras, setCameras] = useState([]);
  const [uid, setUid] = useState(1);
  const [selectedCameras, setSelectedCameras] = useState({});
  const [gridSize, setGridSize] = useState(2);
//rtsp://admin:L23F18C4@192.168.173.191:554/cam/realmonitor?channel=1&subtype=0
//camera.link='https://192.168.173.179:8080/video';

  const fetchCameras = async () => {
    try {
     const response = await fetch('http://127.0.0.1:8000/cameras/getCameras');
     const json = await response.json();  // Read response as text
      console.log("Response text:",json.data);  // Log the response body
      setCameras(json.data);
      
     
    } catch (e) {
      console.error('Error fetching camera details:', e);
    }
  };
  useEffect(() => { 
      fetchCameras();
  }, []);

  const handlePlayButtonClick = (id) => {
    setSelectedCameras((prevSelectedCameras) => ({
      ...prevSelectedCameras,
      [id]: true,
    }));
  };

  const handleStopButtonClick = (id) => {
    setSelectedCameras((prevSelectedCameras) => ({
      ...prevSelectedCameras,
      [id]: false,
    }));
  };


  const renderGrid = () => {
    const cameraGrid = [];
    for (let i = 0; i < gridSize; i++) {
      const row = [];
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;
        const camera = cameras[index];
  
        if (camera) {
          const isPlaying = selectedCameras[camera.id];
          row.push(
            <Col key={camera.id}>
              <CameraCell>
                {isPlaying ? (
                  <Player videoUrl={`ws://localhost:9999/stream?url=${encodeURIComponent(camera.link)}`} />
                ) : (
                  <div className="placeholder">{camera.id}</div>
                )}
              </CameraCell>
            </Col>
          );
        } else {
          row.push(
            <Col key={`empty-${i}-${j}`}>
              <EmptyCell>
                <div className="placeholder">Camera Not Found</div>
              </EmptyCell>
            </Col>
          );
        }
      }
      cameraGrid.push(<Row key={`row-${i}`}>{row}</Row>);
    }
    return cameraGrid;
  };
  


  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Your Cameras</CardTitle>
              </CardHeader>
              <CardBody>
                <Table responsive>
                  <thead className="text-primary">
                    <tr>
                      <th>Name</th>
                      <th>Model</th>
                      <th>link</th>
                      <th>latitude</th>
                      <th>longitude</th>
                      <th>Stream</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cameras?.map((ele) => (
                      <tr key={ele.id}>
                        <td>{ele.Name}</td>
                        <td>{ele.modelNo}</td>
                        <td>{ele.link}</td>
                        <td>{ele.lat}</td>
                        <td>{ele.lon}</td>
                        <td>
                          {!selectedCameras[ele.id] && (
                            <PlayButton
                              onClick={() =>
                                handlePlayButtonClick(ele.id)
                              }
                            >
                              ▶️ Play
                            </PlayButton>
                          )}
                          {selectedCameras[ele.id] && (
                            <StopButton
                              onClick={() =>
                                handleStopButtonClick(ele.id)
                              }
                            >
                              ⏹️ Stop
                            </StopButton>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
        {renderGrid()}
      </div>
    </>
  );
};

export default Cameras;
