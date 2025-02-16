"use client";
import React, { useState, useEffect, useRef } from "react";
import Tesseract from 'tesseract.js';

import { useUpload } from "../utilities/runtime-helpers";

function IssueForm({ onSubmit, onCancel }) {
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    mbta_line: "",
    latitude: null,
    longitude: null,
    photo_url: null,
  });
  const [uploading, setUploading] = useState(false);
  const [upload] = useUpload();
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const categories = [
    "Delay",
    "Outage",
    "Track Change",
    "Suspension",
    "Other",
  ];

  const mbtaLines = [
    "Red Line",
    "Blue Line",
    "Orange Line",
    "Green Line",
    "Silver Line",
  ];

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      (error) => console.error("Location error:", error)
    );
  }, []);

  const handleImageUpload = (file) => {
    Tesseract.recognize(
      file,
      'eng',
      {
        logger: (m) => console.log(m),
      }
    ).then(({ data: { text } }) => {
      console.log(text);
    });
  };
  

  useEffect(() => {
    if (showMap) {
      const loadMap = async () => {
        try {
          if (typeof window !== "undefined" && !window.L) {
            await Promise.all([
              new Promise((resolve) => {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";
                document.head.appendChild(link);
                link.onload = resolve;
              }),
              new Promise((resolve) => {
                const script = document.createElement("script");
                script.src = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js";
                document.head.appendChild(script);
                script.onload = resolve;
              }),
            ]);
          }

          if (!mapRef.current && window.L) {
            const map = window.L.map("location-picker").setView(
              [42.3601, -71.0589],
              13
            );
            window.L.tileLayer(
              "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            ).addTo(map);

            if (formData.latitude && formData.longitude) {
              markerRef.current = window.L.marker([
                formData.latitude,
                formData.longitude,
              ]).addTo(map);
              map.setView([formData.latitude, formData.longitude], 15);
            }

            map.on("click", (e) => {
              const { lat, lng } = e.latlng;
              setFormData((prev) => ({
                ...prev,
                latitude: lat,
                longitude: lng,
              }));

              if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
              } else {
                markerRef.current = window.L.marker([lat, lng]).addTo(map);
              }
            });

            mapRef.current = map;
          }
        } catch (err) {
          console.error("Error loading map:", err);
          setError("Failed to load map");
        }
      };

      loadMap();
    }
  }, [showMap, formData.latitude, formData.longitude]);

  return (
    <div className="p-4 bg-white rounded-lg shadow max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-roboto">Category</label>
          <select
            className="w-full p-2 border rounded"
            value={formData.category}
            name="category"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-roboto">Description</label>
          <textarea
            className="w-full p-2 border rounded"
            value={formData.description}
            name="description"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={4}
          />
        </div>

        <div>
          <label className="block mb-2 font-roboto">Location</label>
          <button
            onClick={() => setShowMap(!showMap)}
            className="w-full p-2 border rounded bg-gray-50 hover:bg-gray-100 mb-2 font-roboto flex items-center justify-center gap-2"
            type="button"
          >
            <i className="fas fa-map-marker-alt"></i>
            {formData.latitude ? "Change Location" : "Select Location"}
          </button>
          {formData.latitude && (
            <div className="text-sm text-gray-600 font-roboto">
              Selected: {formData.latitude.toFixed(6)},{" "}
              {formData.longitude.toFixed(6)}
            </div>
          )}
          {showMap && (
            <div
              id="location-picker"
              className="w-full h-[300px] rounded-lg mt-2"
            ></div>
          )}
        </div>

        <div>
          <label className="block mb-2 font-roboto">MBTA Line</label>
          <select
            className="w-full p-2 border rounded"
            value={formData.mbta_line}
            name="mbta_line"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, mbta_line: e.target.value }))
            }
          >
            <option value="">Select a line</option>
            {mbtaLines.map((line) => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-roboto">Photo (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files[0])}
            className="w-full p-2 border rounded"
          />
          {uploading && <div className="mt-2 font-roboto">Uploading...</div>}
          {formData.photo_url && (
            <img
              src={formData.photo_url}
              alt="Preview"
              className="mt-2 max-w-full h-40 object-cover rounded"
            />
          )}
        </div>

        {error && <div className="text-[#FF0000] font-roboto">{error}</div>}

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
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default IssueForm;