import React, { useState, useEffect } from "react";
import {
  Card, CardBody, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input
} from "reactstrap";
import emailjs from "emailjs-com";
import Swal from "sweetalert2";
import "semantic-ui-css/semantic.min.css";


const Alerts = () => {
  const [modal, setModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [description, setDescription] = useState("");

  const SERVICE_ID = 'service_pwnn6cp';
  const TEMPLATE_ID = 'template_bev9uo7';
  const PUBLIC_KEY = '8pffsjHzyG5ndbW9t'; // Replace USER_ID with PUBLIC_KEY

  const toggleModal = () => setModal(!modal);

  const handleLodgeComplaint = (row) => {
    setSelectedRow(row);
    toggleModal();
  };

  useEffect(() => {
    emailjs.init({
      publicKey: '8pffsjHzyG5ndbW9t', // Replace with your actual public key
      blockHeadless: true, // Prevent headless browsers from sending emails
      limitRate: {
        id: 'app', // Identifier for rate limiting
        throttle: 10000, // Limit to 1 request per 10 seconds
      },
    });
  }, []);

  const handleSendEmail = () => {
    if (!selectedRow) return;

    // Validate description
    if (!description.trim()) {
      Swal.fire("Validation Error", "Please provide a description.", "warning");
      return;
    }

    const templateParams = {
      camera_id: selectedRow.cameraId,
      location: selectedRow.location,
      url: selectedRow.url,
      alert_type: selectedRow.alertType,
      timestamp: selectedRow.timestamp,
      description,
    };

    emailjs
      .send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Email Sent',
            text: 'Email sent successfully!',
            confirmButtonText: 'OK'
          });
          toggleModal();
          // Reset description after sending email
          setDescription('');
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Send Failed',
            text: 'Failed to send email. Please try again.',
            confirmButtonText: 'Close'
          });
          console.error('EmailJS Error:', error);
        }
      );
  };

  const dummyData = [
    {
      cameraId: 'CAM001',
      location: 'Entrance Gate',
      url: 'http://example.com/stream1',
      alertType: 'Intrusion',
      timestamp: '2024-12-12 10:15:00',
    },
    {
      cameraId: 'CAM002',
      location: 'Parking Lot',
      url: 'http://example.com/stream2',
      alertType: 'Motion Detected',
      timestamp: '2024-12-12 10:20:00',
    },
    {
      cameraId: 'CAM003',
      location: 'Lobby',
      url: 'http://example.com/stream3',
      alertType: 'Unauthorized Access',
      timestamp: '2024-12-12 10:25:00',
    },
  ];

  return (
    <Card style={{marginTop: '6rem', marginLeft:'1rem', marginRight:'1rem'}}>
      <CardBody>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Sr No.</th>
              <th>Camera ID</th>
              <th>Location</th>
              <th>URL</th>
              <th>Type of Alert</th>
              <th>Timestamp</th>
              <th>Lodge Complaint</th>
            </tr>
          </thead>
          <tbody>
            {dummyData.map((data, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{data.cameraId}</td>
                <td>{data.location}</td>
                <td>
                  <a href={data.url} target="_blank" rel="noopener noreferrer">
                    {data.url}
                  </a>
                </td>
                <td>{data.alertType}</td>
                <td>{data.timestamp}</td>
                <td>
                  <Button color="primary" size="sm" onClick={() => handleLodgeComplaint(data)}>
                    Lodge Complaint
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal isOpen={modal} toggle={toggleModal}>
          <ModalHeader toggle={toggleModal}>Lodge Complaint</ModalHeader>
          <ModalBody>
            {selectedRow && (
              <div>
                <p><strong>Camera ID:</strong> {selectedRow.cameraId}</p>
                <p><strong>Location:</strong> {selectedRow.location}</p>
                <p><strong>URL:</strong> <a href={selectedRow.url} target="_blank" rel="noopener noreferrer">{selectedRow.url}</a></p>
                <p><strong>Type of Alert:</strong> {selectedRow.alertType}</p>
                <p><strong>Timestamp:</strong> {selectedRow.timestamp}</p>
                <FormGroup>
                  <Label for="description">Description</Label>
                  <Input 
                    type="textarea" 
                    id="description" 
                    placeholder="Enter your description here" 
                    value={description} // Bind value to state
                    onChange={(e) => setDescription(e.target.value)} // Update state on change
                  />
                </FormGroup>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleSendEmail}>Send Mail</Button>{' '}
            <Button color="secondary" onClick={toggleModal}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default Alerts;
