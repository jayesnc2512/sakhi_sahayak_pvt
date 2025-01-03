import React, { useState, useEffect } from "react";
import {
  Card, CardBody, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input
} from "reactstrap";
import emailjs from "emailjs-com";
import Swal from "sweetalert2";
import "semantic-ui-css/semantic.min.css";
import { format } from "date-fns";



const Alerts = () => {
  const [modal, setModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [description, setDescription] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [readAlerts, setReadAlerts] = useState([]);
  const [unReadAlerts, setUnReadAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  
  const [searchQueryAlerts, setSearchQueryAlerts] = useState("");
  
  const handleSearchAlertsChange = (event) => {
    setSearchQueryAlerts(event.target.value);
  };


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

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/alerts/');
      const json = await response.json();
      const reverseData= await json.data.reverse();
      // console.log(data);
      setAlerts(reverseData);
      setUnReadAlerts(json?.data.filter((it) => it.read_status === 0))
      setReadAlerts(json?.data.filter((it) => it.read_status === 1))
    } catch (err) {
      console.error("Error fetching alerts:", err);
    }
  };
  useEffect(() => {
    fetchAlerts();
  }, []);

  const formattedTime = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) return "Invalid Date"; 
    const dateObject = new Date(timestamp * 1000); 
    return format(dateObject, "MMMM dd, yyyy hh:mm a");
  };


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
              <th>Register Complaint</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((data, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{data.source_id}</td>
                <td>{data.lat}  {data.lon}</td>
                <td>
                  <a href={data.proof_link} target="_blank" rel="noopener noreferrer">
                    {data.proof_link}
                  </a>
                </td>
                <td>{data.alert_message}</td>
                <td>{data.timestamp}</td>
                <td>
                  <Button color="primary" size="sm" onClick={() => handleLodgeComplaint(data)}>
                    Register Complaint
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
                <p><strong>Camera ID:</strong> {selectedRow.source_id}</p>
                <p><strong>Location:</strong> {selectedRow.lat} {selectedRow.lon}</p>
                <p><strong>URL:</strong> <a href={selectedRow.proof_link} target="_blank" rel="noopener noreferrer">{selectedRow.url}</a></p>
                <p><strong>Type of Alert:</strong> {selectedRow.alert_message}</p>
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
