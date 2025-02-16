"use client";
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import IssueForm from "../components/IssueForm";
import IssueMap from "../components/IssueMap";

function Home() {
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [formData, setFormData] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const handleIssueSubmit = (data) => {
    console.log("Form submitted:", data);
    setFormData(data);
    setShowIssueForm(false);
  };

  const handleIssueCancel = () => {
    setShowIssueForm(false);
  };

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
          ) : (
            <div className="h-[600px] relative rounded-lg overflow-hidden shadow-lg">
              <IssueMap issue={formData} />
            </div>
          )}
        </div>
      </section>

      {showIssueForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-roboto text-xl font-bold">Report an Issue</h3>
              <button
                onClick={() => setShowIssueForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-4">
              {mapLoaded ? (
                <IssueForm
                  onSubmit={handleIssueSubmit}
                  onCancel={handleIssueCancel}
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

export default Home;
