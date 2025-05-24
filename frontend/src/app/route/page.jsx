"use client";

import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const RoutePage = () => {
  const [routeData, setRouteData] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routeControlRef = useRef(null);
  const L = useRef(null);

  // load route data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("routeData");
      if (storedData) {
        setRouteData(JSON.parse(storedData));
      }
    }
  }, []);

  // initialize map + routing once everything is loaded
  useEffect(() => {
    let isMounted = true;
    
    async function initializeMap() {
      try {
        const leaflet = await import("leaflet");
        await import("leaflet/dist/leaflet.css");
        
        L.current = leaflet.default || leaflet;
        
        // wait for page to be fully rendered before initializing the map
        if (mapRef.current && !mapInstance.current && routeData) {
          const initialCoords = routeData?.start || [42.3601, -71.0589];
          
          mapInstance.current = L.current.map(mapRef.current).setView(initialCoords, 13);
          L.current.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
          }).addTo(mapInstance.current);
          
          if (isMounted) {
            try {
              const routingModule = await import("leaflet-routing-machine");
              if (isMounted && routeData && mapInstance.current) {
                const { start, end, startAddress, endAddress } = routeData;
                
                if (start && end) {
                  const routingControl = L.current.Routing.control({
                    waypoints: [
                      L.current.latLng(start[0], start[1]),
                      L.current.latLng(end[0], end[1]),
                    ],
                    routeWhileDragging: false,
                    lineOptions: {
                      styles: [{ color: "blue", weight: 4 }],
                    },
                    createMarker: (i, wp) =>
                      L.current.marker(wp.latLng).bindPopup(
                        i === 0
                          ? `<strong>Start:</strong> ${startAddress}`
                          : `<strong>End:</strong> ${endAddress}`
                      ),
                    addWaypoints: false,
                    draggableWaypoints: false,
                    fitSelectedRoutes: true,
                    show: false,
                  });
                  
                  routeControlRef.current = routingControl;
                  
                  const controlElement = routingControl.onAdd(mapInstance.current);
                  const instructionsContainer = document.getElementById("instructions");
                  if (instructionsContainer) {
                    instructionsContainer.innerHTML = "";
                    instructionsContainer.appendChild(controlElement);
                  }
                }
              }
            } catch (err) {
              console.error("Error initializing routing:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error loading Leaflet:", err);
      }
    }

    initializeMap();

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        if (routeControlRef.current) {
          mapInstance.current.removeControl(routeControlRef.current);
        }
        mapInstance.current.remove();
      }
    };
  }, [routeData]);

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">Your Optimized Route</h1>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Map container */}
          <div ref={mapRef} className="w-full md:w-2/3 h-[400px]"></div>
          {/* External routing instructions container */}
          <div
            id="instructions"
            className="w-full md:w-1/3 h-[400px] overflow-y-auto border p-2 bg-gray-50"
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