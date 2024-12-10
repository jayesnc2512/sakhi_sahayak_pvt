
// import React from "react";
// import { Toast, ToastBody, ToastHeader } from "reactstrap";

// const ToastNotify = ({ message, type, show, toggle }) => {
//   const colors = {
//     success: "success",
//     error: "danger",
//     warning: "warning",
//     info: "info",
//   };

//   const backgroundColors = {
//     success: "#d4edda", // Light green for success
//     error: "#f8d7da",   // Light red for error
//     warning: "#fff3cd", // Light yellow for warning
//     info: "#d1ecf1",    // Light blue for info
//   };

//   const textColors = {
//     success: "#155724",
//     error: "#721c24",
//     warning: "#856404",
//     info: "#0c5460",
//   };

//   const styles = {
//     container: {
//       position: "fixed",
//       top: "20px",
//       right: "20px",
//       zIndex: 1050,
//     },
//     toast: {
//       minWidth: "250px",
//       boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
//       backgroundColor: backgroundColors[type] || backgroundColors.info, // Default to info color
//       color: textColors[type] || textColors.info, // Default text color
//     },
//     header: {
//       fontWeight: "bold",
//       textTransform: "capitalize",
//       backgroundColor: backgroundColors[type] || backgroundColors.info,
//       color: textColors[type] || textColors.info,
//     },
//   };

//   return (
//     <div style={styles.container}>
//       <Toast isOpen={show} style={styles.toast}>
//         <ToastHeader
//           toggle={toggle}
//           style={styles.header} // Header style to match the background
//         >
//           Notification
//         </ToastHeader>
//         <ToastBody>{message}</ToastBody>
//       </Toast>
//     </div>
//   );
// };

// export default ToastNotify;

import React from "react";
import { Toast, ToastBody, ToastHeader } from "reactstrap";

const ToastNotify = ({ message, type, show, toggle,name,lat,lon }) => {
  const backgroundColors = {
    success: "#d4edda", // Light green for success
    error: "#f8d7da",   // Light red for error
    warning: "#fff3cd", // Light yellow for warning
    info: "#d1ecf1",    // Light blue for info
  };

  const textColors = {
    success: "#155724",
    error: "#721c24",
    warning: "#856404",
    info: "#0c5460",
  };

  const styles = {
    toast: {
      width: "300px", // Fixed width for consistency
      padding: "10px", // Controlled padding
      marginBottom: "10px", // Spacing between stacked toasts
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      backgroundColor: backgroundColors[type] || backgroundColors.info,
      color: textColors[type] || textColors.info,
      borderRadius: "8px",
      fontSize: "14px",
      lineHeight: "1.2", // Tighter text spacing
    },
    header: {
      fontWeight: "bold",
      textTransform: "capitalize",
      backgroundColor: backgroundColors[type] || backgroundColors.info,
      color: textColors[type] || textColors.info,
      padding: "6px 10px", // Smaller header padding
      borderBottom: "none", // Remove divider for cleaner look
    },
    body: {
      padding: "6px 10px", // Compact body padding
    },
  };

  return (
    <Toast isOpen={show} style={styles.toast}>
      <ToastHeader toggle={toggle} style={styles.header}>
        Notification
      </ToastHeader>
      <ToastBody style={styles.body}>
        <p>{message}</p>
        {name && (<>on Camera<strong>{name}</strong><br /></>)}
        {lat && (<><strong>Lat:</strong>{lat} </>)}
        {lon && (<><strong>Lon:</strong>{lon} </>)}
        <br />
        
      </ToastBody>
    </Toast>
  );
};

export default ToastNotify;

