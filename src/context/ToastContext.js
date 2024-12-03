import React, { createContext, useContext, useState } from "react";
import ToastNotify from "../components/Notification/ToastNotify";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: "", type: "", show: false });

  const triggerToast = (message, type) => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ ...toast, show: false }), 5000);
  };

  return (
    <ToastContext.Provider value={triggerToast}>
      {children}
      <ToastNotify
        message={toast.message}
        type={toast.type}
        show={toast.show}
        toggle={() => setToast({ ...toast, show: false })}
      />
    </ToastContext.Provider>
  );
};
