import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
} from "reactstrap";

import { format } from "date-fns";
import emailjs from "emailjs-com";
import Swal from "sweetalert2";
import "semantic-ui-css/semantic.min.css";

function AddVideo() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);

  // Handle video upload and set local state
  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoURL(URL.createObjectURL(file)); // Generate video preview URL
    }
  };

  // Handle video submission to the backend
  const handleSubmit = async () => {
    if (!videoFile) {
      alert("Please upload a video first!");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      const response = await axios.post(
        "http://your-backend-url/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Video uploaded successfully!");
      console.log("Server Response:", response.data);
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Error uploading video. Please try again.");
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
                <video controls style={styles.video}>
                  <source src={videoURL} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
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
                  style={{ backgroundColor: "#007bff" }}
                  // color="danger"
                  type="upload"
                >
                  Upload Video
                </Button>

                <Button
                  className="btn-round"
                  color="primary"
                  type="submit"
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              </div>
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
