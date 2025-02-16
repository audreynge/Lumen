"use client";
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';

const normalizeCategory = (category) => category.toLowerCase().replace(/ /g, "_");

const categoryIcons = {
  suspension: {
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  },
  track_change: {
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  },
  delay: {
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  },
  outage: {
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  },
  other: {
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  },
};

function IssueMapVisual({ issue }) {
  const [viewport, setViewport] = useState({
    latitude: 42.3601,
    longitude: -71.0589,
    zoom: 12,
  });

  console.log("Issue details: ", issue);

  const fetchNearbyIssues = async () => {
    if (issue) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/find?latitude=${issue.latitude}&longitude=${issue.longitude}&radius=10000`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch nearby issues');
        }
        console.log(response);
  
        const data = await response.json();
        console.log('nearby issues:', data); 
  
        if (Array.isArray(data)) {
          return data;
        } else {
          throw new Error('Fetched data is not an array');
        }
      } catch (error) {
        console.error("Error in fetchNearbyIssues:", error.message);
        return [];
      }
    }
    return [];
  };
  

  const { data: nearbyIssues = [], isLoading, isError, error } = useQuery({
    queryKey: ['nearby-issues', issue?.latitude, issue?.longitude],
    queryFn: fetchNearbyIssues,
    enabled: Boolean(issue), 
  });

  useEffect(() => {
    if (!isLoading && !isError) {
      console.log("Nearby issues:", nearbyIssues); // Log after data is fetched
    } else if (isError) {
      console.error("Error fetching nearby issues:", error.message);
    }
  }, [nearbyIssues, isLoading, isError, error]);

  if (isLoading) {
    return (<div>Loading...</div>);
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="relative w-full h-[600px] pt-4 pb-8">
      <MapContainer
        center={[viewport.latitude, viewport.longitude]}
        zoom={viewport.zoom}
        className='h-[100%] w-[100%] z-0'
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {issue && issue.latitude && issue.longitude && (
          <Marker
            position={[issue.latitude, issue.longitude]}
            icon={new L.Icon(categoryIcons[normalizeCategory(issue.category)] || categoryIcons.other)}
          >
            <Popup>
              <div>
                <strong>Category:</strong> {issue.category}<br />
                <strong>Description:</strong> {issue.description}<br />
                <strong>Line:</strong> {issue.mbta_line}
              </div>
            </Popup>
          </Marker>
        )}

        {nearbyIssues && nearbyIssues.length > 0 ? (
          nearbyIssues.map((nearbyIssue, index) => (
            <Marker
              key={index}
              position={[nearbyIssue.location.coordinates[1], nearbyIssue.location.coordinates[0]]}
              icon={new L.Icon(categoryIcons[normalizeCategory(nearbyIssue.category)] || categoryIcons.other)}
            >
              <Popup>
                <div>
                  <strong>Category:</strong> {nearbyIssue.category}<br />
                  <strong>Description:</strong> {nearbyIssue.description}<br />
                  <strong>Line:</strong> {nearbyIssue.line}
                </div>
              </Popup>
            </Marker>
          ))
        ) : (
          <div>No nearby issues found</div>
        )}
      </MapContainer>
    </div>
  );
}

function IssueMap({ issue }) {
  return (
    <div className="p-4">
      <IssueMapVisual issue={issue} />
    </div>
  );
}

export default IssueMap;
