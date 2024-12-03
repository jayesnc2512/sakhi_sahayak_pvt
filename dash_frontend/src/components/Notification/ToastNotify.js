import React, { useState } from "react";
import { Toast, ToastBody, ToastHeader } from "reactstrap";

const ToastNotify = ({ message, type, show, toggle }) => {
  const colors = {
    success: "success",
    error: "danger",
    warning: "warning",
    info: "info",
  };

  const styles = {
    container: {
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: 1050,
    },
    toast: {
      minWidth: "250px",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    },
    header: {
      fontWeight: "bold",
      textTransform: "capitalize",
    },
  };  

  return (
    <div style={styles.container}>
      <Toast isOpen={show} style={styles.toast}>
        <ToastHeader
          toggle={toggle}
          icon={colors[type] || "info"} // Default to "info" if type not provided
        >
          Notification
        </ToastHeader>
        <ToastBody>{message}</ToastBody>
      </Toast>
    </div>
  );
};


export default ToastNotify;