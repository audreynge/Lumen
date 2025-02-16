"use client";

import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

// Geocode an address to [lat, lng] using OpenStreetMap’s Nominatim API
const geocodeAddress = async (address) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  );
  const data = await response.json();
  if (data && data.length > 0) {
    const { lat, lon } = data[0];
    return [parseFloat(lat), parseFloat(lon)];
  } else {
    throw new Error("Address not found");
  }
};

const RouteForm = ({ onSubmit, onCancel }) => {

  //dummy values
  const [startAddress, setStartAddress] = useState("1 Science Park, Boston, MA");
  const [endAddress, setEndAddress] = useState("963 South St, Roslindale, MA");

  const [error, setError] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routeControlRef = useRef(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const [lat, lng] = await geocodeAddress(startAddress);
        mapInstance.current = L.map(mapRef.current).setView([lat, lng], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        }).addTo(mapInstance.current);
      } catch (err) {
        console.error("Error initializing map:", err);
      }
    };
    initializeMap();
  }, []); // runs once

  // Function to call your backend API that returns the optimized route data
  const fetchPath = async (start, end) => {
    try {
      const url = `http://127.0.0.1:5000/path?start=${encodeURIComponent(
        start
      )}&end=${encodeURIComponent(end)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const handleCalculateRoute = async () => {
    try {
      const data = await fetchPath(startAddress, endAddress);
      setRouteData(data);

      if (routeControlRef.current) {
        mapInstance.current.removeControl(routeControlRef.current);
      }

      const [startLat, startLng] = await geocodeAddress(startAddress);
      const [endLat, endLng] = await geocodeAddress(endAddress);

      routeControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(startLat, startLng),
          L.latLng(endLat, endLng),
        ],
        routeWhileDragging: false,
        lineOptions: {
          styles: [{ color: "blue", weight: 4 }],
        },
        createMarker: (i, wp) => L.marker(wp.latLng),
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
      }).addTo(mapInstance.current);
    } catch (err) {
      console.error("Error fetching path:", err);
      setError("Failed to fetch route data");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={startAddress}
          onChange={(e) => setStartAddress(e.target.value)}
          placeholder="Start Address"
          className="border border-gray-300 rounded p-2 flex-1"
        />
        <input
          type="text"
          value={endAddress}
          onChange={(e) => setEndAddress(e.target.value)}
          placeholder="End Address"
          className="border border-gray-300 rounded p-2 flex-1"
        />
        <button
          onClick={handleCalculateRoute}
          className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
        >
          Calculate Your Route
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div ref={mapRef} className="w-full h-[400px] mb-4"></div>
      {routeData && <RouteMap routeData={routeData} />}

      <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100 font-roboto"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(formData)}
            className="px-4 py-2 bg-[#2196F3] hover:bg-[#1976D2] text-white rounded font-roboto transition-colors"
            type="button"
          >
            Analyze
          </button>
        </div>
    </div>
  );
};


const RouteMap = ({ routeData }) => {
  return (
    <div className="p-4 border border-gray-200 rounded">
      <h3 className="text-xl font-semibold mb-2">Route Data</h3>
      <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
        {JSON.stringify(routeData, null, 2)}
      </pre>
    </div>
  );
};

export default RouteForm;
