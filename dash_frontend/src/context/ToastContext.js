

import React, { createContext, useContext, useState } from "react";
import ToastNotify from "../components/Notification/ToastNotify";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const triggerToast = (message, type,lat,lon,name) => {
    const id = Date.now() + Math.random(); // Ensure unique ID for each toast
    setToasts((prevToasts) => [...prevToasts, { id, message, type,lat, lon, name }]);

    // Automatically remove the toast after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 10000);
  };

  return (
    <ToastContext.Provider value={triggerToast}>
      {children}
      {/* Toast container */}
      <div
  style={{
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 1050,
    // display: "flex",
    // flexDirection: "column", // Ensures vertical stacking
    gap: "10px", // Space between toasts
  }}
>
  {toasts.map((toast) => (
    <ToastNotify
      key={toast.id}
      message={toast.message}
      lat={toast.lat}
      lon={toast.lon}
      name={toast.name}
      type={toast.type}
      show={true}
      toggle={() =>
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toast.id))
      }
    />
  ))}
</div>

    </ToastContext.Provider>
  );
};


