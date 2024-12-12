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

function AddVideoGesture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inference, setInference] = useState([]);
  const [processedFrame, setProcessedFrame] = useState(null);
  const websocketRef = useRef(null);
  const triggerToast = useToast();


  // Start the camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsAnalyzing(true);
      startWebSocket();
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Failed to access camera. Please check permissions.");
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    stopWebSocket();
    setIsAnalyzing(false);
  };

  // Start the WebSocket connection
  const startWebSocket = () => {
    websocketRef.current = new WebSocket("ws://127.0.0.1:8000/gesture/gesture-analysis");

    websocketRef.current.onopen = () => {
      console.log("WebSocket connection established.");
    };

    websocketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.error) {
        console.error("WebSocket error:", data.error);
      } else {
        // console.log(data.inference);
        if (data.inference[0] === "Wrist Formed Detected") {
          triggerToast(data.inference[0], "error")

        }
        if (data.inference?.length !== 0) {
          setInference(prev => [data.inference[0], ...prev]);
        }
        setProcessedFrame(data.processed_frame);
      }
    };

    websocketRef.current.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    websocketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  // Stop the WebSocket connection
  const stopWebSocket = () => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  };

  // Capture and send frames periodically
  const sendFrames = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video && websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frameData = canvas.toDataURL("image/jpeg").split(",")[1]; // Base64 frame data
      websocketRef.current.send(JSON.stringify({ frame: frameData }));
    }
  };

  // Periodically capture and send frames when analyzing
  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      interval = setInterval(sendFrames, 100); // Send frames every 100ms
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  return (
    <div className="content">
      <Row>
        <Col md="8">
          <Card className="card-user">
            <CardHeader>
              <CardTitle tag="h5">Camera Analysis</CardTitle>
            </CardHeader>
            <CardBody>
                <Row>
                    <Col md="6">
                    <div style={{ display: "flex", justifyContent: "center" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: "100%", height: "auto" }}
                ></video>
                <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
              </div>
                    </Col>
                    <Col md="6">
                            {processedFrame ? (
                        <img
                        src={`data:image/jpeg;base64,${processedFrame}`}
                        alt="Processed Frame"
                        style={{ width: "100%", height: "auto", marginTop: "20px" }}
                        />
                    ) : (
                        <p style={{ marginTop: "20px" }}>No processed frame available.</p>
                    )}

                    </Col>
                </Row>
             

           
              <div className="update ml-auto mr-auto" style={{ marginTop: "20px" }}>
                {!isAnalyzing ? (
                  <Button onClick={startCamera} className="btn-round" color="primary">
                    Start Analysis
                  </Button>
                ) : (
                  <Button onClick={stopCamera} className="btn-round" color="danger">
                    Stop Analysis
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="4">
          <Card style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <CardHeader>
              <CardTitle tag="h5">Analysis Results</CardTitle>
            </CardHeader>
            <CardBody style={{ marginLeft: "20px" }}>
              <Row>
                {inference.length > 0 ? (
                  inference.map((item, index) => (
                    <div key={index}>
                      <span>{typeof item === "string" ? item : JSON.stringify(item)}</span>
                      <br />
                    </div>
                  ))
                ) : (
                  <p>No inferences available.</p>
                )}
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AddVideoGesture;
