import React, { createContext, useContext, useState } from "react";

// Create Context
const AlertContext = createContext();

// Custom Hook for accessing the context
export const useAlerts = () => useContext(AlertContext);

// Alert Provider
export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    // Function to add an alert
    const addAlert = (message, type, lat, lon, sourceName,source_id) => {
        const id = Date.now(); // Unique ID for the alert
        const newAlert = { id, message, type, lat, lon, sourceName,source_id };
        setAlerts((prev) => [...prev, newAlert]);

        // Remove alert after 15 seconds
        setTimeout(() => {
            setAlerts((prev) => prev.filter((alert) => alert.id !== id));
        }, 15000);
    };

    // Function to remove an alert manually
    const removeAlert = (id) => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    };

    return (
        <AlertContext.Provider value={{ alerts, addAlert, removeAlert }}>
            {children}
        </AlertContext.Provider>
    );
};
