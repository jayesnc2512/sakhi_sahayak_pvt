import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
} from "reactstrap";

function AddVideo() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [images, setImages] = useState([]);
  const [socket, setSocket] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Initiate WebSocket connection
  const startWebSocketConnection = () => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/video-analysis");
  
    ws.onopen = () => {
      console.log("WebSocket connected.");
      sendVideoPath(ws); // Send the video path when the WebSocket is open
    };
  
    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        console.log("Message from server:", response);
      } catch (e) {
        console.error("Error parsing server response:", e);
      }
    };
  
    ws.onerror = (error) => console.error("WebSocket error:", error);
  
    ws.onclose = () => {
      console.log("WebSocket disconnected.");
    };
  
    setSocket(ws); 
  };
  
  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoURL(URL.createObjectURL(file));
    }
  };

  const handleCloseConnection = () => {
    if (socket) {
      socket.close();  // Close the WebSocket connection
      console.log("WebSocket connection closed from the frontend.");
      alert("WebSocket connection closed from the frontend.");
    } else {
      console.log("WebSocket is not connected.");
      alert("WebSocket is not connected.");
    }
  };
  
  const handleSubmit = () => {
    if (!videoFile) {
      alert("Please upload a video first!");
      return;
    }
  
    startWebSocketConnection();
  };
  
  // New function to send the video path
  const sendVideoPath = (ws) => {
    if (videoFile) {
      // Sending the absolute file path to the backend || videoFile.name
      const absolutePath = `E:/SIH-SakhiSahayak/GDSCL.mp4` ; 
      console.log("Sending video path:", absolutePath);
  
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ path: absolutePath }));
        console.log('absolute path:', absolutePath);
        console.log("Video path sent to the backend.");
      } else {
        console.error("WebSocket is not open. Path not sent.");
      }
    } else {
      console.error("No video file available.");
    }
  };
  
  
  

  return (
    <div className="content">
      <Row>
        <Col md="8">
          <Card className="card-user">
            <CardHeader>
              <CardTitle tag="h5">Add Video</CardTitle>
            </CardHeader>
            <CardBody>
              {videoURL && (
                <>
                  <video
                    ref={videoRef}
                    controls
                    width="640"
                    height="360"
                    style={{ display: "block", marginBottom: "10px" }}
                  >
                    <source src={videoURL} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <canvas
                    ref={canvasRef}
                    width="640"
                    height="360"
                    style={{ display: "none" }}
                  />
                </>
              )}

              <div className="update ml-auto mr-auto">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  style={{ display: "none" }}
                  id="videoInput"
                />
                <Button
                  onClick={() => document.getElementById("videoInput").click()}
                  className="btn-round"
                  color="primary"
                >
                  Upload Video
                </Button>

                <Button
                  className="btn-round"
                  color="success"
                  onClick={handleSubmit}
                  style={{ marginLeft: "10px" }}
                >
                  Analyse Video
                </Button>
                <Button
                  className="btn-round"
                  color="success"
                  onClick={handleCloseConnection}
                  style={{ marginLeft: "10px" }}
                >
                  Stop Analysis
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
            <Col md="4">
                <Card>
                        <CardHeader>
                          <CardTitle tag="h5">Analysis Results</CardTitle>
                        </CardHeader>
                        <CardBody>
                          <Row>
                            {images.length > 0 ? (
                              images.map((image, index) => (
                                <Col md="3" key={index}>
                                  <Card className="card-image">
                                    <img
                                      src={`data:image/png;base64,${image.image_data}`}
                                      alt={`frame ${index}`}
                                      style={{ width: "100%", height: "auto" }}
                                    />
                                    <CardBody>
                                      <p>Timestamp: timestamp</p>
                                      <p>Analysis Result: Safe</p>
                                    </CardBody>
                                  </Card>
                                </Col>
                              ))
                            ) : (
                              <p>No frames received yet.</p>
                            )}
                          </Row>
                        </CardBody>
                      </Card>
                </Col>
      </Row>
    
    </div>
  );
}


const styles = {
  //   container: {
  //     display: "flex",
  //     justifyContent: "center",
  //     alignItems: "center",
  //     minHeight: "100vh",
  //     backgroundColor: "#f5f5f5",
  //   },
  card: {
    backgroundColor: "#fff",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    borderRadius: "10px",
    padding: "20px",
    width: "400px",
    textAlign: "center",
  },
  video: {
    width: "100%",
    height: "auto",
    marginBottom: "15px",
    borderRadius: "10px",
  },
  placeholder: {
    width: "100%",
    height: "200px",
    backgroundColor: "#dcdcdc",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "16px",
    color: "#888",
    marginBottom: "15px",
  },
  uploadSection: {
    alignItems: "center",
    marginBottom: "15px",
  },
  uploadButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    display: "inline-block",
  },
  //   submitButton: {
  //     backgroundColor: "#28a745",
  //     color: "#fff",
  //     padding: "10px 20px",
  //     borderRadius: "5px",
  //     cursor: "pointer",
  //     border:"none",
  //   },
};

export default AddVideo;
