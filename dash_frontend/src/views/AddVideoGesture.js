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
  const [socket, setSocket] = useState(null);
  const [outputFrame, setOutputFrame] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const triggerToast = useToast();

  // Initialize WebSocket connection
  const startWebSocketConnection = () => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/video-analysis");

    ws.onopen = () => {
      console.log("WebSocket connected.");
      triggerToast("WebSocket connected.", "success");
    };

    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        if (response.image) {
          setOutputFrame(response.image);
        }
      } catch (e) {
        console.error("Error parsing server response:", e);
        triggerToast("Error parsing server response.", "error");
      }
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);

    ws.onclose = () => {
      console.log("WebSocket disconnected.");
      triggerToast("WebSocket disconnected.", "info");
    };

    setSocket(ws);
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsAnalyzing(true);
      startWebSocketConnection();
    } catch (err) {
      console.error("Error accessing camera:", err);
      triggerToast("Failed to access camera. Please check permissions.", "error");
    }
  };

  // Capture frames and send to backend
  const captureFrames = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video && socket && socket.readyState === WebSocket.OPEN) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frameData = canvas.toDataURL("image/jpeg");
      socket.send(JSON.stringify({ image: frameData }));
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (socket) {
      socket.close();
    }
    setIsAnalyzing(false);
    triggerToast("Camera stopped and WebSocket closed.", "info");
  };

  // Capture frames periodically
  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      interval = setInterval(captureFrames, 100); // Send frames every 100ms
    }
    return () => clearInterval(interval);
  }, [isAnalyzing, socket]);

  return (
    <div className="content">
      <Row>
        <Col md="8">
          <Card className="card-user">
            <CardHeader>
              <CardTitle tag="h5">Camera Analysis</CardTitle>
            </CardHeader>
            <CardBody>
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
              {outputFrame ? (
                <img
                  src={`data:image/jpg;base64,${outputFrame}`}
                  alt="Analyzed Frame"
                  style={{ width: "100%", height: "auto", marginTop: "20px" }}
                />
              ) : (
                <p style={{ marginTop: "20px" }}>No output frame available.</p>
              )}

              <div className="update ml-auto mr-auto" style={{ marginTop: "20px" }}>
                {!isAnalyzing ? (
                  <Button
                    onClick={startCamera}
                    className="btn-round"
                    color="primary"
                  >
                    Start Analysis
                  </Button>
                ) : (
                  <Button
                    onClick={stopCamera}
                    className="btn-round"
                    color="danger"
                  >
                    Stop Analysis
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AddVideoGesture;
