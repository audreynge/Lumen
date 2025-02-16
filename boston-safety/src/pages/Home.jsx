"use client";
import React from "react";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import IssueForm from "../components/IssueForm"
import IssueMap from "../components/IssueMap";
import ActiveIssues from "../components/ActiveIssues";

function Page() {
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issues, setIssues] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const categories = [
    { value: "mbta", label: "MBTA Transit", color: "#FF4B4B" },
    {
      value: "historic_preservation",
      label: "Historic Preservation",
      color: "#8B4513",
    },
    {
      value: "winter_infrastructure",
      label: "Winter Infrastructure",
      color: "#87CEEB",
    },
    { value: "student_housing", label: "Student Housing", color: "#4B83FF" },
    {
      value: "bicycle_infrastructure",
      label: "Bicycle Infrastructure",
      color: "#32CD32",
    },
    { value: "waterfront", label: "Waterfront & Harbor", color: "#00CED1" },
    { value: "parking", label: "Parking", color: "#FFD700" },
    { value: "traffic", label: "Traffic", color: "#FF8C00" },
    { value: "parks", label: "Parks & Common", color: "#228B22" },
    { value: "other", label: "Other", color: "#9E9E9E" },
  ];

  const mbta_lines = [
    "Red Line",
    "Blue Line",
    "Orange Line",
    "Green Line - B",
    "Green Line - C",
    "Green Line - D",
    "Green Line - E",
    "Silver Line",
  ];

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/list-issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_by: "impact_score" }),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch issues: ${response.statusText}`);
      }
      const data = await response.json();
      setIssues(data.issues);
    } catch (err) {
      console.error(err);
      setError("Failed to load issues. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleIssueSubmit = async (data) => {
    console.log("Form submitted:", data);
    setShowIssueForm(false);
  };

  const handleIssueCancel = () => {
    setShowIssueForm(false);
  };

  const handleMarkerClick = async (issue) => {
    setSelectedIssue(issue);
    try {
      const response = await fetch("/api/get-issue-solutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issue_id: issue.id }),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch solutions: ${response.statusText}`);
      }
      const data = await response.json();
      setSolutions(data.solutions);
    } catch (err) {
      console.error(err);
      setError("Failed to load solutions. Please try again.");
      setSolutions([]);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    if (!mapLoaded) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    }
  }, [mapLoaded]);

  const handleVote = async (id, direction) => {
    try {
      const response = await fetch("/api/vote-solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solution_id: id, direction }),
      });
      if (!response.ok) {
        throw new Error("Failed to vote on solution");
      }
      handleMarkerClick(selectedIssue);
    } catch (err) {
      console.error(err);
      setError("Failed to vote. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-[#CC0000] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2">
              <h1 className="font-roboto text-4xl md:text-5xl font-bold mb-4">
                Shape Boston's Future
              </h1>
              <p className="font-roboto text-lg mb-8">
                From Fenway to the Freedom Trail, help us preserve our history
                while building for tomorrow. Report issues affecting your
                MBTA route and predict how safe it is.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowIssueForm(true)}
                  className="bg-white text-[#CC0000] font-roboto px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Report an Issue
                </button>
              </div>
            </div>
            <div className="hidden md:block md:w-1/2 ml-8 mr-4">
              <img
                src="https://images.unsplash.com/photo-1606373664971-bf9b25eb508d?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ym9zdG9uJTIwc2t5bGluZXxlbnwwfHwwfHx8MA%3D%3D"
                alt="Boston skyline"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="map" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-roboto text-3xl font-bold mb-8">
            MBTA Issues Map
          </h2>
          {!mapLoaded ? (
            <div className="h-[600px] flex items-center justify-center">
              <div className="text-[#CC0000]">Loading map...</div>
            </div>
          ) : loading ? (
            <div className="h-[600px] flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-4xl text-[#CC0000]"></i>
            </div>
          ) : (
            <div className="h-[600px] relative rounded-lg overflow-hidden shadow-lg">
              <IssueMap
                issues={issues}
                selectedCategories={selectedCategories}
                onCategoryToggle={(category) => {
                  setSelectedCategories((prev) =>
                    prev.includes(category)
                      ? prev.filter((c) => c !== category)
                      : [...prev, category]
                  );
                }}
                onMarkerClick={handleMarkerClick}
              />
            </div>
          )}
        </div>
      </section>

      <section id="mbta-status" className="py-12">
        <ActiveIssues mbtaLines={mbta_lines} issues={issues}/>
      </section>

      {showIssueForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-roboto text-xl font-bold">Report an Issue</h3>
              <button
                onClick={() => setShowIssueForm(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={submitLoading}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-4">
              {mapLoaded ? (
                <IssueForm
                  onSubmit={handleIssueSubmit}
                  onCancel={handleIssueCancel}
                  loading={submitLoading}
                />
              ) : (
                <div className="flex items-center justify-center h-40">
                  <div className="text-[#CC0000]">Loading map...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Page;