"use client";
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet'; // Don't forget to import L for custom icons

function IssueMapVisual({ issue }) {
  const [viewport, setViewport] = useState({
    latitude: 42.3601,
    longitude: -71.0589,
    zoom: 12,
  });

  console.log(issue);

  // Function to fetch nearby issues
  const fetchNearbyIssues = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/find?latitude=${issue.latitude}&longitude=${issue.longitude}&radius=1000`)
      if (!response.ok) {
        throw new Error('failed to fetch nearby issues');
      }
      return response.json()
    } 
    catch (error) {
      throw new Error(error.message);
    }
  }

  // // Using React Query to fetch the data
  // const { data: nearbyIssues, isLoading, isError, error } = useQuery({
  //   queryKey: ['nearby-issues', issue.latitude, issue.longitude],
  //   queryFn: fetchNearbyIssues,
  // });

  // console.log(nearbyIssues);

  // if (isLoading) {
  //   return (<div>Loading...</div>);
  // }

  // if (isError) {
  //   return <div>Error: {error.message}</div>;
  // }

  // return (
  //   <div className="relative w-full h-[600px] pt-4 pb-8">
  //     <MapContainer
  //       center={[viewport.latitude, viewport.longitude]}
  //       zoom={viewport.zoom}
  //       style={{ height: "100%", width: "100%", zIndex: 0 }}
  //     >
  //       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
  //       {/* Marker for the main issue */}
  //       {issue && issue.location.coordinates[0] && issue.location.coordinates[1] && (
  //         <Marker
  //           position={[issue.location.coordinates[0], issue.location.coordinates[1]]}
  //           icon={new L.Icon({
  //             iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  //             iconSize: [25, 41],
  //             iconAnchor: [12, 41],
  //             popupAnchor: [1, -34],
  //             shadowSize: [41, 41],
  //           })}
  //         >
  //           <Popup>
  //             <div>
  //               <strong>Category:</strong> {issue.category}<br />
  //               <strong>Description:</strong> {issue.description}<br />
  //               <strong>Line:</strong> {issue.mbta_line}
  //             </div>
  //           </Popup>
  //         </Marker>
  //       )}

  //       {/* Iterate over nearby issues and add a marker for each */}
  //       {nearbyIssues && nearbyIssues.map((nearbyIssue, index) => (
  //         <Marker
  //           key={index}
  //           position={[nearbyIssue.location.coodinates[0], nearbyIssue.location.coordinates[1]]}
  //           icon={new L.Icon({
  //             iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  //             iconSize: [25, 41],
  //             iconAnchor: [12, 41],
  //             popupAnchor: [1, -34],
  //             shadowSize: [41, 41],
  //           })}
  //         >
  //           <Popup>
  //             <div>
  //               <strong>Category:</strong> {nearbyIssue.category}<br />
  //               <strong>Description:</strong> {nearbyIssue.description}<br />
  //               <strong>Line:</strong> {nearbyIssue.mbta_line}
  //             </div>
  //           </Popup>
  //         </Marker>
  //       ))}
  //     </MapContainer>
  //   </div>
  // );
}

function IssueMap({ issue }) {
  return (
    <div className="p-4">
      <IssueMapVisual issue={issue} />
    </div>
  );
}

export default IssueMap;
