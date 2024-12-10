import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
// import MapWrapper from './leaflet';
// import { useAuthContext } from '../../../hooks/useAuthContext';
import Gmaps from './GooogleMap';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs } from "firebase/firestore";
import { currentUser } from "firebase/auth"



const GeotagPage = () => {
  const [coordinates, setCoordinates] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [uid, setUid] = useState(1);

  // const mapRef = React.useRef(null);  
  const fetchCameras = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/cameras/getCameras');
      const json = await response.json();  // Read response as text
      console.log("Response text:",json.data);  // Log the response body
      setCameras(json.data);
      
     
    } catch (e) {
      console.error('Error fetching camera details:', e);
    }
  };
  useEffect(() => { 
      fetchCameras();
  }, []);
 
  return (
    <>
        {/* <MapWrapper coordinates={coordinates} /> */}
        <Gmaps cameras={cameras} />
    </>
  );
};

export default GeotagPage;
