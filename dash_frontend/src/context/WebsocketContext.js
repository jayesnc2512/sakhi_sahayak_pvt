import React, { createContext, useContext, useEffect, useState } from "react";

// Create WebSocket Context
const WebSocketContext = createContext(null);

// Custom hook to access the WebSocket context
export const useWebSocket = () => useContext(WebSocketContext);

// WebSocket Provider component
export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket("ws://a3cf-2409-40c0-2a-2e74-a973-9d9f-9ec9-9f62.ngrok-free.app/ws/base-alert"); // Replace with your server address

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      console.log('inside onmessage')
        const alertData = JSON.parse(event.data);
        const { location, audio_link, message } = alertData;
      
        console.log("Alert received:", alertData);
      
        // Display the alert with or without audio link
        if (audio_link) {
          alert(`Emergency Alert:\nLocation: ${location}\nAudio: ${audio_link}`);
        } else {
          alert(`Emergency Alert:\nLocation: ${location}`);
        }
      };
      

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(ws);

    // Clean up WebSocket on component unmount
    return () => {
      ws.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};
