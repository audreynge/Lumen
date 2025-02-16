"use client";

import React, { useEffect, useRef, useState } from "react";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

const RoutePage = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routeControlRef = useRef(null);
  const [routeData, setRouteData] = useState(null);

  useEffect(() => {
    // Retrieve stored route data from localStorage
    const storedData = localStorage.getItem("routeData");
    if (storedData) {
      setRouteData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      const initialCoords = routeData?.start || [42.3601, -71.0589];
      mapInstance.current = L.map(mapRef.current).setView(initialCoords, 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      }).addTo(mapInstance.current);
    }
  }, [routeData]);

  useEffect(() => {
    if (mapInstance.current && routeData) {
      // Remove any previous routing control
      if (routeControlRef.current) {
        mapInstance.current.removeControl(routeControlRef.current);
      }
      const { start, end, startAddress, endAddress } = routeData;
      if (start && end) {
        // Create the routing control without directly adding it to the map
        routeControlRef.current = L.Routing.control({
          waypoints: [
            L.latLng(start[0], start[1]),
            L.latLng(end[0], end[1]),
          ],
          routeWhileDragging: false,
          lineOptions: {
            styles: [{ color: "blue", weight: 4 }],
          },
          createMarker: (i, wp) =>
            L.marker(wp.latLng).bindPopup(
              i === 0
                ? `<strong>Start:</strong> ${startAddress}`
                : `<strong>End:</strong> ${endAddress}`
            ),
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: true,
          show: false,
        });
        // Get the routing control's DOM element
        const controlElement = routeControlRef.current.onAdd(mapInstance.current);
        // Append the routing instructions to the external container
        const instructionsContainer = document.getElementById("instructions");
        if (instructionsContainer) {
          instructionsContainer.innerHTML = ""; // Clear any existing content
          instructionsContainer.appendChild(controlElement);
        }
      }
    }
  }, [routeData]);

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">Your Optimized Route</h1>
        <div className="flex gap-4">
          {/* Map container */}
          <div ref={mapRef} className="w-2/3 h-[400px]"></div>
          {/* External routing instructions container */}
          <div
            id="instructions"
            className="w-1/2 h-[400px] overflow-y-auto border p-2 bg-gray-50"
          ></div>
        </div>
        {routeData && routeData.safetyAnalysis && (
          <div className="mt-6 p-4 border rounded bg-white shadow-md">
            <h2 className="text-lg font-semibold mb-2">Safety Analysis</h2>
            <p className="text-gray-700">{routeData.safetyAnalysis}</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default RoutePage;
