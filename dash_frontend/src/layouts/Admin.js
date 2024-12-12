import React, {useEffect} from "react";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";
import { Route, Routes, useLocation } from "react-router-dom";

import DemoNavbar from "../components/Navbars/DemoNavbar.js";
import Footer from "../components/Footer/Footer.js";
import Sidebar from "../components/Sidebar/Sidebar.js";
import FixedPlugin from "../components/FixedPlugin/FixedPlugin.js";
import { useToast } from "../context/ToastContext";
import { useAlerts } from "../context/AlertContext";

import routes from "../routes.js";

var ps;

function Dashboard(props) { 
  const { addAlert } = useAlerts();

  const [backgroundColor, setBackgroundColor] = React.useState("black");
  const [activeColor, setActiveColor] = React.useState("info");
  const mainPanel = React.useRef();
  const location = useLocation();
  const triggerToast = useToast();


  useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(mainPanel.current);
      document.body.classList.toggle("perfect-scrollbar-on");
    }
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
        document.body.classList.toggle("perfect-scrollbar-on");
      }
    };
  });

  useEffect(() => {
    mainPanel.current.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [location]);


  const startWebSocketConnection = () => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/base-alert");

    ws.onopen = () => {
      console.log("WebSocket connected.");
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ invoke: "start" }));
          // console.log("Video path sent to the backend.");
        } else {
          console.error("WebSocket is not open. Path not sent.");
        }
      }

    ws.onmessage = (event) => {
      try {
        let warningAlert = [1]
        let dangerAlert=[2,3,4,5,6]
        const response = JSON.parse(event.data);
        console.log("Received response from server:", response);
        let msg=response.message
        if (response.message) {
          let type
          let dangerAlerts = ["Woman surrounded by multiple men detected.","Violence Detected"]
          if (msg === "lone women at night detected") {
            type="warning"
          } else if (dangerAlerts.includes(msg)) {
            type="error"
          }

          let toDisplay=`${response.message}`
          triggerToast(response.message, type, response.input_source.lat, response.input_source.lon, response.input_source.Name)
          addAlert(response.message, type, response.input_source.lat, response.input_source.lon, response.input_source.Name,response.source_id);
        }
      } catch (e) {
        console.error("Error parsing server response:", e);
      }
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => {
      console.log("WebSocket disconnected.");
    };
  };
  useEffect(() => { 
    startWebSocketConnection();
  },[])



  

  return (
    <div className="wrapper">
      <Sidebar
        {...props}
        routes={routes}
        bgColor={backgroundColor}
        activeColor={activeColor}
      />
      <div className="main-panel" ref={mainPanel}>
        <DemoNavbar {...props} />
        <Routes>
          {routes.map((prop, key) => {
            return (
              <Route
                path={prop.path}
                element={prop.component}
                key={key}
                exact
              />
            );
          })}
        </Routes>
        <Footer fluid />
      </div>
      {/* <FixedPlugin
        bgColor={backgroundColor}
        activeColor={activeColor}
        handleActiveClick={handleActiveClick}
        handleBgClick={handleBgClick}
      /> */}
    </div>
  );
}

export default Dashboard;
