 
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Nav } from "reactstrap";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";

import logo from "../../logo.png";
import Video from '../../assets/img/Video.png';


var ps;

function Sidebar(props) {
  const location = useLocation();
  const sidebar = React.useRef();
  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };
  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(sidebar.current, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
    }
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
      }
    };
  });
  return (
    <div
      className="sidebar"
      data-color={props.bgColor}
      data-active-color={props.activeColor}
    >
      <div className="logo">
        <a
          href="#"
          className="simple-text logo-mini"
        >
          <div className="logo-img">
            <img src={logo} alt="react-logo" />
          </div>
        </a>
        <a
          href="#"
          className="simple-text logo-normal"
        >
          Sakhi Sahayak
        </a>
      </div>
      <div className="sidebar-wrapper" ref={sidebar}>
        <Nav>
          {props.routes.map((prop, key) => {
            return (
              <li
                className={
                  activeRoute(prop.path) + (prop.pro ? " active-pro" : "")
                }
                key={key}
                
              >
                <NavLink to={prop.layout + prop.path} className="nav-NavLink" style={{ display: 'flex', alignItems: 'center' }}>
                  {prop.name === 'Add Video' || prop.name === 'Lodged Complaints' ? (
                    <img src={prop.icon} alt={`${prop.name} icon`} style={{ width: '30px', height: '25px', marginRight: '10px', alignSelf: 'center' }} />
                  ) : (
                    <i className={prop.icon} style={{ fontSize: '25px', marginRight: '10px', alignSelf: 'center' }} />
                  )}
                  <p style={{ paddingTop: "0", margin: 0, alignSelf: 'center' }}>{prop.name}</p>
                </NavLink>
              </li>
            );
          })}
        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;
//