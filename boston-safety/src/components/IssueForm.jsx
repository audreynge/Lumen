"use client";
import React, { useState, useEffect, useRef } from "react";
import Tesseract from "tesseract.js";
import { useUpload } from "../utilities/runtime-helpers";

const preprocessImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob((blob) => {
        resolve(blob);
      }, file.type);
    };
    img.onerror = (err) => {
      reject(err);
    };
  });
};

const extractIssueDetails = (text) => {
  const lowerText = text.toLowerCase();
  let issueCategory = "";
  let issueMessage = "";
  const delayRegex = /(\d+)\+\s*min/;
  const delayMatch = text.match(delayRegex);
  if (delayMatch) {
    issueCategory = "Delay";
    issueMessage = `Delay for ${delayMatch[0]}`;
  } else if (lowerText.includes("outage")) {
    issueCategory = "Outage";
    issueMessage = "Outage detected";
  } else if (lowerText.includes("track change")) {
    issueCategory = "Track Change";
    issueMessage = "Track change indicated";
  } else if (lowerText.includes("suspension")) {
    issueCategory = "Suspension";
    issueMessage = "Suspension indicated";
  } else {
    issueCategory = "Other";
    issueMessage = "Other issue detected";
  }
  return { issueCategory, issueMessage: `Extracted text: ${issueMessage}` };
};

function IssueForm({ onSubmit, onCancel }) {
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    mbta_line: "",
    latitude: null,
    longitude: null,
    photo_url: null,
    extracted_text: "",
  });
  const [detectedIssue, setDetectedIssue] = useState(null);
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
      (err) => console.error("Location error:", err)
    );
  }, []);

  const handleImageUpload = async (file) => {
    setUploading(true);
    try {
      const processedBlob = await preprocessImage(file);
      Tesseract.recognize(processedBlob, "eng", {
        logger: (m) => console.log(m),
        config: {
          tessedit_char_whitelist: "0123456789+min",
          preserve_interword_spaces: "1",
        },
      })
        .then(({ data: { text } }) => {
          console.log("OCR extracted text:", text);
          const { issueCategory, issueMessage } = extractIssueDetails(text);
          setFormData((prev) => ({ ...prev, category: issueCategory }));
          setDetectedIssue(issueMessage);
          setFormData((prev) => ({
            ...prev,
            photo_url: URL.createObjectURL(file),
            extracted_text: issueMessage,
          }));
        })
        .catch((err) => {
          console.error("OCR error:", err);
          setError("Failed to process image");
        })
        .finally(() => {
          setUploading(false);
        });
    } catch (err) {
      console.error("Preprocessing error:", err);
      setError("Failed to process image");
      setUploading(false);
    }
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
                link.href =
                  "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";
                document.head.appendChild(link);
                link.onload = resolve;
              }),
              new Promise((resolve) => {
                const script = document.createElement("script");
                script.src =
                  "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js";
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
            capture="camera"
            onChange={(e) =>
              e.target.files?.[0] && handleImageUpload(e.target.files[0])
            }
            className="w-full p-2 border rounded"
          />
          {uploading && (
            <div className="mt-2 font-roboto">Processing...</div>
          )}
          {formData.photo_url && (
            <img
              src={formData.photo_url}
              alt="Preview"
              className="mt-2 max-w-full h-40 object-cover rounded"
            />
          )}
          {detectedIssue && (
            <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-green-800">
              {detectedIssue}
            </div>
          )}
        </div>

        {error && (
          <div className="text-[#FF0000] font-roboto">{error}</div>
        )}

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