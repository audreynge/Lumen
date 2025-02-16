"use client";
import React from "react";
import { useState, useEffect } from "react";

function IssueMapVisual({
  issues = [],
  onMarkerClick = () => {},
  selectedCategories = [],
  onCategoryToggle = () => {},
}) {
  const [viewport, setViewport] = useState({
    latitude: 42.3601,
    longitude: -71.0589,
    zoom: 12,
  });

  const categoryColors = {
    transportation: "#FF4B4B",
    infrastructure: "#4B83FF",
    environment: "#4BFF4B",
    safety: "#FFB74B",
    other: "#9E9E9E",
  };

  const filteredIssues = issues.filter(
    (issue) =>
      selectedCategories.length === 0 ||
      selectedCategories.includes(issue.category)
  );

  return (
    <div className="relative w-full h-[600px]">
      <></>

      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-roboto text-lg font-bold mb-2">Categories</h3>
        {Object.entries(categoryColors).map(([category, color]) => (
          <div key={category} className="flex items-center mb-2">
            <button
              onClick={() => onCategoryToggle(category)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors ${
                selectedCategories.includes(category)
                  ? "bg-gray-100"
                  : "bg-white"
              }`}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="font-roboto capitalize">{category}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function IssueMap() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const mockIssues = [
    {
      id: 1,
      category: "transportation",
      location_lat: 42.3601,
      location_lng: -71.0589,
      description: "Heavy traffic congestion",
    },
    {
      id: 2,
      category: "infrastructure",
      location_lat: 42.3701,
      location_lng: -71.0689,
      description: "Broken street light",
    },
    {
      id: 3,
      category: "environment",
      location_lat: 42.3501,
      location_lng: -71.0489,
      description: "Illegal dumping",
    },
  ];

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleMarkerClick = (issue) => {
    setSelectedIssue(issue);
  };

  return (
    <div className="p-4">
      <IssueMapVisual
        issues={mockIssues}
        onMarkerClick={handleMarkerClick}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
      />
      {selectedIssue && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-lg">
          <h3 className="font-roboto text-xl font-bold mb-2">Selected Issue</h3>
          <p className="font-roboto">Category: {selectedIssue.category}</p>
          <p className="font-roboto">
            Description: {selectedIssue.description}
          </p>
        </div>
      )}
    </div>
  );
}

export default IssueMap;