import { useEffect, useRef } from "react";
import L from "leaflet";

export const Circle = ({
  center,
  radius,
  color = "blue",
  fillColor = "blue",
  fillOpacity = 0.4,
  onClick,
  onRadiusChange,
  onCenterChange,
}) => {
  const circleRef = useRef(null);

  useEffect(() => {
    if (!circleRef.current) {
      // Create a new Leaflet Circle instance
      circleRef.current = L.circle(center, {
        radius,
        color,
        fillColor,
        fillOpacity,
      }).addTo(window.map); // Attach the circle to the map
    } else {
      // Update the circle's position and radius when props change
      circleRef.current.setLatLng(center);
      circleRef.current.setRadius(radius);
    }

    // Attach event listeners
    if (onClick) {
      circleRef.current.on("click", onClick);
    }

    return () => {
      // Cleanup the circle when the component unmounts
      if (circleRef.current) {
        circleRef.current.remove();
      }
    };
  }, [center, radius, color, fillColor, fillOpacity, onClick]);

  useEffect(() => {
    if (onRadiusChange) {
      circleRef.current?.on("radiuschange", () => {
        onRadiusChange(circleRef.current?.getRadius() || radius);
      });
    }

    if (onCenterChange) {
      circleRef.current?.on("move", () => {
        const latLng = circleRef.current?.getLatLng();
        if (latLng) {
          onCenterChange([latLng.lat, latLng.lng]);
        }
      });
    }
  }, [onRadiusChange, onCenterChange]);

  return null; // The Circle component does not render any DOM elements
};
