import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Table,
  Row,
  Col,
  Button,
} from "reactstrap";
import styled from "styled-components";
import Player from "../components/CamPlay/player";
import json1 from '../views/json1.json';
import AddCameraModal from "../views/AddCamera";

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
  padding-bottom: 56.25%;
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

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Cameras = () => {
  const [cameras, setCameras] = useState([]);
  const [selectedCameras, setSelectedCameras] = useState({});
  const [gridSize, setGridSize] = useState(2);
  const [isAddCameraModalOpen, setIsAddCameraModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchCameras = async () => {
    try {
      console.log("Response text:", json1.data);
      setCameras(json1.data);
    } catch (e) {
      setError(e.message);
      console.error("Error fetching camera details:", e);
    }
  };

  useEffect(() => {
    fetchCameras();

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
              <CameraCell>
                <div className="placeholder">Camera Not Found</div>
              </CameraCell>
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
        {error && <p style={{ color: "red" }}>{error}</p>}
        <Row>
          <Col md="12">
            <Card>
            <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardTitle tag="h4">Your Cameras</CardTitle>
              <Button
                className="btn-round"
                color="primary"
                onClick={() => setIsAddCameraModalOpen(true)}
              >
                Add Camera
              </Button>
              {isAddCameraModalOpen && (
                <Overlay>
                  <AddCameraModal
                    toggleModal={() => setIsAddCameraModalOpen(false)}
                  />
                </Overlay>
              )}
            </CardHeader>

              <CardBody>
                <Table responsive>
                  <thead className="text-primary">
                    <tr>
                      <th>Name</th>
                      <th>Model</th>
                      <th>Link</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                      <th>Link</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                      <th>Stream</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cameras.map((ele) => (
                      <tr key={ele.id}>
                        <td>{ele.Name}</td>
                        <td>{ele.modelNo}</td>
                        <td>{ele.link}</td>
                        <td>{ele.lat}</td>
                        <td>{ele.lon}</td>
                        <td>
                          {!selectedCameras[ele.id] && (
                            <PlayButton onClick={() => handlePlayButtonClick(ele.id)}>▶️ Play</PlayButton>
                          )}
                          {selectedCameras[ele.id] && (
                            <StopButton onClick={() => handleStopButtonClick(ele.id)}>⏹️ Stop</StopButton>
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
