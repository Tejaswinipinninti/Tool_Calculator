import React, { useState } from "react";
import axios from "axios";

const TollCalculator = () => {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [tollAmount, setTollAmount] = useState(null);
  const [error, setError] = useState("");

  // Function to geocode location
  const geocodeLocation = async (location) => {
    const apiKey = import.meta.env.VITE_TOOLGURU_API_KEY; // Your API key
    const url = `https://api.tollguru.com/?q=${location}&key=${apiKey}`;
    
    // Using a CORS proxy (All Origins)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

    try {
      const response = await axios.get(proxyUrl);
      const data = JSON.parse(response.data.contents); // Parse the data from the proxy
      if (data.results && data.results.length > 0) {
        return data.results[0].geometry.location; // Adjust based on your API's response structure
      } else {
        throw new Error(`No results found for location: ${location}`);
      }
    } catch (error) {
      console.error("Geocoding error:", error.message);
      throw new Error(`Failed to geocode location "${location}".`);
    }
  };

  // Function to calculate toll between two locations
  const calculateToll = async () => {
    setError(""); // Clear any previous errors
    setTollAmount(null); // Reset toll amount

    if (!startLocation.trim() || !endLocation.trim()) {
      setError("Both start and end locations are required.");
      return;
    }

    try {
      const startGeo = await geocodeLocation(startLocation);
      const endGeo = await geocodeLocation(endLocation);

      console.log("Start location data:", startGeo);
      console.log("End location data:", endGeo);

      // Make a request to the TollGuru API to calculate the toll
      const tollUrl = `https://api.tollguru.com/api/v1/calculate?start_lat=${startGeo.lat}&start_lng=${startGeo.lng}&end_lat=${endGeo.lat}&end_lng=${endGeo.lng}&key=${import.meta.env.VITE_TOOLGURU_API_KEY}`;

      const tollResponse = await axios.get(tollUrl);

      // Process the toll calculation response
      if (tollResponse.data && tollResponse.data.data && tollResponse.data.data.toll) {
        setTollAmount(tollResponse.data.data.toll);
      } else {
        throw new Error("Toll calculation failed or no toll information available.");
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>Toll Calculator</h2>
      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="start-location" style={{ display: "block", marginBottom: "5px" }}>
          Start Location:
        </label>
        <input
          type="text"
          id="start-location"
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
          style={{ width: "100%", padding: "8px", fontSize: "16px" }}
        />
      </div>
      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="end-location" style={{ display: "block", marginBottom: "5px" }}>
          End Location:
        </label>
        <input
          type="text"
          id="end-location"
          value={endLocation}
          onChange={(e) => setEndLocation(e.target.value)}
          style={{ width: "100%", padding: "8px", fontSize: "16px" }}
        />
      </div>
      <button onClick={calculateToll} style={{ padding: "10px 15px", fontSize: "16px" }}>
        Calculate Toll
      </button>
      {tollAmount !== null && (
        <div style={{ marginTop: "20px", fontSize: "18px" }}>
          Toll Amount: <strong>${tollAmount}</strong>
        </div>
      )}
      {error && (
        <div style={{ marginTop: "20px", color: "red", fontSize: "16px" }}>
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default TollCalculator;
