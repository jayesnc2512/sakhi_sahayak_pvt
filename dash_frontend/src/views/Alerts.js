import React, { useState, useEffect, useRef } from "react";
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
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Input,
} from "reactstrap";
import { db, auth } from "../firebase";
import routes from "../routes.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { format } from "date-fns";
import emailjs from "emailjs-com";
import Swal from "sweetalert2";
import "semantic-ui-css/semantic.min.css";


const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [uid, setUid] = useState(1);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const SERVICE_ID = process.env.REACT_APP_SERVICE_ID;
  const TEMPLATE_ID = process.env.REACT_APP_TEMPLATE_ID;
  const USER_ID = process.env.REACT_APP_USER_ID;

  const DUMMY_ALERTS = [
    { id: "1", message: "Violence Detected", read: false, created: 1690834567, uid: "123", color:'info' },
    { id: "2", message: "", read: false, created: 1690834577, uid: "123", color:'info' },
    { id: "3", message: "Something", read: true, created: 1690834587, uid: "123", color:'info' },
  ];


  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        //Simulate an API call using dummy data
        const response = await new Promise((resolve) =>
          setTimeout(() => resolve({ data: DUMMY_ALERTS }), 1000)
        );
        setAlerts(response.data);

        // const response= await fetch('http://localhost:127.0.0.1');
        // const data= await response.json();
        // console.log(data);
      } catch (err) {
        console.error("Error fetching alerts:", err);
      }
    };

    fetchAlerts();
  }, []);


  const [complaintText, setComplaintText] = useState("");
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  
  
  const [searchQueryAlerts, setSearchQueryAlerts] = useState("");
  

  const handleSearchAlertsChange = (event) => {
    setSearchQueryAlerts(event.target.value);
  };
  
  

  // const filteredAlerts = alerts.filter(alert =>
  //   alert.message.toLowerCase().includes(searchQueryAlerts.toLowerCase())
  // );
  
  

  const formattedTime = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) return "Invalid Date"; 
    const dateObject = new Date(timestamp * 1000); 
    return format(dateObject, "MMMM dd, yyyy hh:mm a");
  };

  const handleComplaintChange = (event) => {
    setComplaintText(event.target.value);
  };

  const handleOpenComplaint = (alert) => {
    setSelectedAlert(alert);
    setIsComplaintOpen(true);
  };

  const handleCloseComplaint = () => {
    setIsComplaintOpen(false);
    setComplaintText("");
  };

  const handleClose = () => {
    setSelectedAlert(null);
  };

  
  // const form = useRef();
  const formRef = useRef(null); 

  const handleOnSubmit = async (e) => {
    handleClose();
    e.preventDefault();
    try {
      const form = formRef.current; // Access the form element using the ref
      // form.camName.value=selectedAlert.id;
      // form.camLid.value=selectedAlert.camLid;
      // form.date.value=selectedAlert.formattedDate;
      // form.time.value=selectedAlert.formattedTime;
      // form.location.value=`${selectedAlert.camLat},${selectedAlert.camLon}`;
      const result = await emailjs.sendForm(
        SERVICE_ID,
        TEMPLATE_ID,
        form,
        USER_ID
      );
      console.log(result.text);
      Swal.fire({
        icon: "success",
        title: "Complaint Sent Successfully",
      });

      
      form.reset();
      setComplaintText(""); 
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Ooops, something went wrong",
        text: error,
      });
    }
    handleCloseComplaint();
  };


  const unReadAlerts = alerts.filter((ale) => !ale.read);
  const readAlerts = alerts.filter((ale) => ale.read);

  console.log(selectedAlert);
  const handleMarkAsViewed = async () => {
    if (selectedAlert) {
      try {
     
        // const response = await fetch(`/api/alerts/mark-as-viewed`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({ id: selectedAlert.id }),
        // });
  
        // if (!response.ok) {
        //   throw new Error("Failed to mark the alert as viewed");
        // }
  
   
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) =>
            alert.id === selectedAlert.id ? { ...alert, read: true} : alert
          )
        );
  
        setSelectedAlert(null); 
        toggleModal();
      } catch (err) {
        console.error("Error marking alert as viewed:", err);
      }
    }
  };
  
  const handleMarkAsUnviewed = async () => {
    if (selectedAlert) {
      try {
    
        // const response = await fetch(`/api/alerts/mark-as-unviewed`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({ id: selectedAlert.id }),
        // });
  
        // if (!response.ok) {
        //   throw new Error("Failed to mark the alert as unviewed");
        // }
  
      
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) =>
            alert.id === selectedAlert.id ? { ...alert, read: false} : alert
          )
        );
  
        setSelectedAlert(null); 
        toggleModal();
      } catch (err) {
        console.error("Error marking alert as unviewed:", err);
      }
    }
  };
  

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  return (
    <>
      <div className="content">
        {/* <Row> */}
          <Col md="12">
            <Card>
              <CardHeader style={{display:'flex', justifyContent:'space-between'}}>
                <CardTitle tag="h5">Alerts</CardTitle>
                <form>
                  <InputGroup className="no-border">
                    <Input placeholder="Search..." />
                    <InputGroupAddon addonType="append">
                      <InputGroupText>
                        <i className="nc-icon nc-zoom-split" />
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </form>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md="6">
                    <Card className="card-plain">
                      <CardHeader  >
                        <CardTitle tag="h5">
                          Alert ({unReadAlerts.length})
                        </CardTitle>
                       
                      </CardHeader>
                      <CardBody>
                        {unReadAlerts.map((ele) => (
                          <Alert
                            color={ele.color}
                            key={ele.id}
                            onClick={() => {
                              setSelectedAlert(ele);
                              toggleModal();
                            }}
                          >
                            <span>Unread: {ele.message}</span>
                          </Alert>
                        ))}
                        {/* <Modal isOpen={modalOpen} toggle={toggleModal}>
                          <ModalHeader toggle={toggleModal}>
                            Alert Actions
                          </ModalHeader>
                          <ModalBody>
                            {selectedAlert && (
                              <>
                                <div>{selectedAlert.message}</div>
                              </>
                            )}
                          </ModalBody>
                          <ModalFooter>
                            <>
                              <Button
                                color="primary"
                                onClick={handleMarkAsViewed}
                              >
                                Mark as Viewed
                              </Button>{" "}
                              <Button color="secondary" onClick={toggleModal}>
                                Close
                              </Button>
                            </>
                          </ModalFooter>
                        </Modal> */}
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="6">
                    <Card className="card-plain">
                      <CardHeader>
                        <CardTitle tag="h5">Viewed Alerts</CardTitle>
                      </CardHeader>
                      <CardBody>
                        {readAlerts.map((ele) => (
                          <Alert
                            color="info"
                            key={ele.id}
                            onClick={() => {
                              setSelectedAlert(ele);
                              toggleModal();
                            }}
                          >
                            <span>Viewed: {ele.message}</span>
                          </Alert>
                        ))}
                        
                        <Modal isOpen={modalOpen} toggle={toggleModal}>
                          <ModalHeader toggle={toggleModal}>
                            Alert Actions
                          </ModalHeader>
                          <ModalBody>
                            {selectedAlert && (
                              <>
                                <div>{selectedAlert.message}</div>
                                {/*give href below for a tag*/}
                                <a>Url: </a>
                              </>
                            )}
                          </ModalBody>
                          <ModalFooter>
                            {selectedAlert && !selectedAlert.read && (
                              <Button color="primary" onClick={handleMarkAsViewed}>
                                Mark as Viewed
                              </Button>
                            )}
                            {selectedAlert && selectedAlert.read && (
                              <>
                                <Button color="primary" onClick={handleMarkAsUnviewed}>
                                  Mark as Unviewed
                                </Button>
                                <Button
                                  style={{
                                    backgroundColor: "rgb(255, 64, 64)",
                                    borderColor: "rgb(255, 64, 64)",
                                    color: "white",
                                  }}
                                  onClick={() => handleOpenComplaint(selectedAlert)}
                                >
                                  Lodge a complaint
                                </Button>
                              </>
                            )}
                            <Button color="secondary" onClick={toggleModal}>
                              Close
                            </Button>
                          </ModalFooter>
                        </Modal>
                        {/* Complaint Dialog */}
                        <Modal
                          isOpen={isComplaintOpen}
                          toggle={handleCloseComplaint}
                        >
                          <ModalHeader toggle={handleCloseComplaint}>
                            Lodge a Complaint
                          </ModalHeader>
                          <ModalBody>
                            {selectedAlert && (
                              <>
                                <div>
                                  <strong>Camera:</strong> <span>Camera 1</span>
                                </div>
                                <form ref={formRef} onSubmit={handleOnSubmit}>
                                  <label>Camera Name: </label>
                                  <input
                                    type="text"
                                    name="camName"
                                    value="Camera 1"
                                    readOnly
                                  />
                                  <br />
                                  <label>License ID: </label>
                                  <input
                                    type="text"
                                    name="camLid"
                                    value={selectedAlert.id}
                                    readOnly
                                  />
                                  <br />
                                  <label>Timestamp: </label>
                                  <input
                                    type="text"
                                    name="date"
                                    value={formattedTime(
                                      selectedAlert.created.seconds
                                    )}
                                    readOnly
                                  />
                                  <br />
                                  <label>Owner-id </label>
                                  <input
                                    type="text"
                                    name="time"
                                    value={selectedAlert.uid}
                                    readOnly
                                  />
                                  <br />
                                  {/* <label>Location: </label>
          <input
            type="text"
            name="location"
            value={`${selectedAlert.camLat},${selectedAlert.camLon}`}
            readOnly
          />
              <br /> */}
                                  <label>Additional Info:</label>
                                  <textarea
                                    type="text"
                                    name="message"
                                    value={complaintText}
                                    onChange={handleComplaintChange}
                                    placeholder="Enter additional info..."
                                    rows={1}
                                  />

                                  <Button type="submit" color="primary">
                                    Send Complaint
                                  </Button>
                                </form>
                              </>
                            )}
                          </ModalBody>

                          <ModalFooter>
                            <Button
                              color="secondary"
                              onClick={handleCloseComplaint}
                            >
                              Close
                            </Button>
                          </ModalFooter>
                        </Modal>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </CardBody>
            </Card>
            
          </Col>
        {/* </Row> */}

      </div>
    </>
  );
};

export default Alerts;
