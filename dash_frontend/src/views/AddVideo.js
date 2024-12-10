import React, { useState, useEffect, useRef } from "react";
import { useToast } from "../context/ToastContext";
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
  const [inference, setInference] = useState([]);
  const [socket, setSocket] = useState(null);
  const [outputFrame, setOutputFrame] = useState();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const triggerToast = useToast();

  // Initiate WebSocket connection
  const startWebSocketConnection = () => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/video-analysis");

    ws.onopen = () => {
      console.log("WebSocket connected.");
      triggerToast("WebSocket connected.", "success");
      sendVideoPath(ws); // Send the video path when the WebSocket is open
    };

    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        console.log("Received response from server:", response);
        if (response.image) {
          setOutputFrame(response.image)
          console.log(response.image)
        }
        if (response.message) {
          setInference(infer => [response.message, ...infer])
          let alertArray = ["lone women at night", "Woman surrounded by multiple men detected.", "Violence Detected"]
          if (alertArray.includes(response.message)) {
            triggerToast(response.message, "error")
          }
          
        }
      } catch (e) {
        console.error("Error parsing server response:", e);
        triggerToast("Error parsing server response.", "error");
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
      // triggerToast(`Video uploaded: ${file.name}`, "info");
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
      // triggerToast("Please upload a video before starting analysis.", "warning");
      return;
    }
    setInference([]);
    setImages([]);
    // triggerToast("Analysis started. Processing the video...", "info");
    startWebSocketConnection();
  };

  // New function to send the video path
  const sendVideoPath = (ws) => {
    if (videoFile) {
      // Sending the absolute file path to the backend || videoFile.name
      const absolutePath = `data\\${videoFile.name}`;
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
              {outputFrame ? (
                <>
                  <img
                    src={`data:image/jpg;base64,${outputFrame}`}
                    alt={`frame`}
                    style={{ width: "100%", height: "auto" }}
                  />
                </>
              ) : "NO OUTPUT FRAME"}

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

                {videoFile && (
                  <div style={{ marginTop: "10px", fontSize: "16px" }}>
                    <strong>Selected Video: </strong>{videoFile.name}
                  </div>
                )}

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
          <Card style={{ maxHeight: '70vh', overflowY: "auto" }}>
            <CardHeader>
              <CardTitle tag="h5">Analysis Results</CardTitle>
            </CardHeader>
            <CardBody style={{ marginLeft: '20px' }}>
              <Row>
                {inference.length > 0 ? (
                  inference.map((item, index) => (
                    <div key={index}>
                      <span>{typeof (item) === String ? item : JSON.stringify(item)}</span>
                      <br />
                    </div>
                  ))
                ) : (
                  <p>Loading...</p>
                )}
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AddVideo;
