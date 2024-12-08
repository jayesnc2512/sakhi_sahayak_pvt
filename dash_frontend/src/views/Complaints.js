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


const Complaints = () => {
    const [searchQueryComplaints, setSearchQueryComplaints] = useState("");
    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    
    const handleSearchComplaintsChange = (event) => {
        setSearchQueryComplaints(event.target.value);
    };

    // const filteredComplaints = lodgedComplaints.filter(complaint =>
  //   complaint.description.toLowerCase().includes(searchQueryComplaints.toLowerCase())
  // );

  const handleOpenComplaintModal = () => {
    setSelectedComplaint('');
    setIsComplaintModalOpen(true);
  };
  
  const handleCloseComplaintModal = () => {
    setIsComplaintModalOpen(false);
    setSelectedComplaint(null);
  };



  return (
    <div className='content'>
        <Card>
              <CardHeader style={{display:'flex', justifyContent:'space-between'}}>
                <CardTitle tag="h5">Lodged Complaints</CardTitle>
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
              <Col md='12'>
              {/* {lodgedComplaints.map((complaint) => (
                    <Alert key={complaint.id} onClick={() => handleOpenComplaintModal(complaint)}>
                      <span>Complaint ID: {complaint.id} <span style={{ marginLeft: '20px' }}>Description: {complaint.description}</span></span>
                    </Alert>
                  ))} */}
                <CardBody>
                  <Alert  onClick={() => handleOpenComplaintModal()}>
                      <span>Complaint ID: 1234 <span style={{ marginLeft: '20px' }}>Description: Hello</span></span>
                    </Alert>
                </CardBody>
              </Col>
            </Card>
            <Modal isOpen={isComplaintModalOpen} toggle={handleCloseComplaintModal}>
              <ModalHeader toggle={handleCloseComplaintModal}>
                Complaint Details
              </ModalHeader>
              <ModalBody>
                {/* {selectedComplaint && ( */}
                  <>
                    <div>
                      <strong>Complaint ID:</strong> 1234
                    </div>
                    <div>
                      <strong>Description:</strong> Hello
                    </div>
                    <div>
                      {/*give href below for a tag*/}
                      <strong>Proof URL:</strong> <a  target="_blank" rel="noopener noreferrer">Url:</a>
                    </div>
                  </> 
                {/* )} */}
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onClick={handleCloseComplaintModal}>
                  Close
                </Button>
              </ModalFooter>
              </Modal>
    </div>
  )
}

export default Complaints;
