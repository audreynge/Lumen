"use client";
import React from "react";
import { useState, useEffect } from "react";

function MapPicker({
  latitude = 42.3601,
  longitude = -71.0589,
  zoom = 12,
  onLocationChange = () => {},
  height = "400px",
  showMarker = true,
}) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: zoom,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      if (showMarker) {
        const marker = new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: map,
          draggable: true,
        });

        marker.addListener("dragend", (e) => {
          const position = marker.getPosition();
          onLocationChange({
            lat: position.lat(),
            lng: position.lng(),
          });
        });
      }

      map.addListener("click", (e) => {
        if (onLocationChange) {
          onLocationChange({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          });
        }
      });
    }
  }, [latitude, longitude, zoom, onLocationChange, showMarker]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height }}
      className="rounded-lg overflow-hidden"
    />
  );
}

function MapPickerStory() {
  const [location, setLocation] = useState({
    lat: 42.3601,
    lng: -71.0589,
  });

  return (
    <div className="p-4 space-y-8">
      <div>
        <h3 className="font-roboto text-lg font-medium mb-4">Default Map</h3>
        <MapPicker
          latitude={location.lat}
          longitude={location.lng}
          onLocationChange={setLocation}
        />
      </div>

      <div>
        <h3 className="font-roboto text-lg font-medium mb-4">
          Map without Marker
        </h3>
        <MapPicker
          latitude={42.3601}
          longitude={-71.0589}
          showMarker={false}
          height="300px"
        />
      </div>

      <div>
        <h3 className="font-roboto text-lg font-medium mb-4">Zoomed In Map</h3>
        <MapPicker
          latitude={42.3601}
          longitude={-71.0589}
          zoom={15}
          height="300px"
        />
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="font-roboto text-sm">
          Selected Location: {location.lat.toFixed(4)},{" "}
          {location.lng.toFixed(4)}
        </p>
      </div>
    </div>
  );
}

export default MapPickerStory;