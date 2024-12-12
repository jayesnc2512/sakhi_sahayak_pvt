import React from 'react';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

import {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardTitle,
    FormGroup,
    Form,
    Input,
    Row,
    Col,
} from "reactstrap";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
const { v4: uuidv4 } = require('uuid');
const { MD5 } = require('crypto-js');

const AddCamera = ({ toggleModal }) => {
    const [modelNo, setModelNo] = useState('');
    const [brand, setBrand] = useState('');
    const [ipAddress, setIpAddress] = useState('');
    const [nickName, setNickName] = useState('');
    const [camUsername, setCamUsername] = useState('');
    const [camPassword, setCamPassword] = useState('');
    const [imageLink, setImageLink] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [uid, setUid] = useState(null);
    const Navigate = useNavigate();
    const triggerToast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (auth.currentUser) {
                const uniqueId = uuidv4();
                const licenseData = `${uniqueId}+${auth.currentUser.uid}`;
                const licenseId = MD5(licenseData).toString();

                const camerasRef = collection(db, 'cameras');
                await addDoc(camerasRef, {
                    uid: auth.currentUser.uid,
                    modelNo,
                    brand,
                    ipAddress,
                    nickName,
                    camUsername,
                    camPassword,
                    imageLink,
                    latitude,
                    longitude,
                    lid: licenseId,
                    createdAt: serverTimestamp()
                });

                console.log('Camera added successfully!');
                triggerToast('Camera added successfully!', 'success');
                toggleModal(); // Close modal after submission
            } else {
                console.log('Sign in to submit');
                Navigate('/');
            }
        } catch (error) {
            console.error('Error adding camera: ', error);
        }
    };

    return (
        <div className="content" style={{ width: '40%', margin: '0 auto' }}>
            <Card className="card-user">
                <CardHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <CardTitle tag="h5">Add Camera</CardTitle>
                        <Button color="danger" size="sm" onClick={toggleModal}>
                            Close
                        </Button>
                    </div>
                </CardHeader>
                <CardBody>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md="4">
                                <FormGroup>
                                    <label>Model Name/No.</label>
                                    <Input
                                        value={modelNo}
                                        placeholder="Model Name/No."
                                        type="text"
                                        onChange={(e) => setModelNo(e.target.value)}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4">
                                <FormGroup>
                                    <label>Brand</label>
                                    <Input
                                        value={brand}
                                        placeholder="Brand"
                                        type="text"
                                        onChange={(e) => setBrand(e.target.value)}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4">
                                <FormGroup>
                                    <label>IP Address</label>
                                    <Input
                                        value={ipAddress}
                                        placeholder="IP Address"
                                        type="text"
                                        onChange={(e) => setIpAddress(e.target.value)}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="6">
                                <FormGroup>
                                    <label>Nick Name</label>
                                    <Input
                                        value={nickName}
                                        placeholder="Nick Name"
                                        type="text"
                                        onChange={(e) => setNickName(e.target.value)}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="6">
                                <FormGroup>
                                    <label>Cam Username</label>
                                    <Input
                                        value={camUsername}
                                        placeholder="Cam Username"
                                        type="text"
                                        onChange={(e) => setCamUsername(e.target.value)}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="6">
                                <FormGroup>
                                    <label>Latitude</label>
                                    <Input
                                        value={latitude}
                                        placeholder="Latitude"
                                        type="text"
                                        onChange={(e) => setLatitude(e.target.value)}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="6">
                                <FormGroup>
                                    <label>Longitude</label>
                                    <Input
                                        value={longitude}
                                        placeholder="Longitude"
                                        type="text"
                                        onChange={(e) => setLongitude(e.target.value)}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <div className="update ml-auto mr-auto">
                                <Button
                                    className="btn-round"
                                    color="primary"
                                    type="submit"
                                >
                                    Submit
                                </Button>
                            </div>
                        </Row>
                    </Form>
                </CardBody>
            </Card>
        </div>
    );
};

export default AddCamera;
