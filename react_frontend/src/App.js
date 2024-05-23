import React, { useState } from "react";
import axios from "axios";
import DaylightChart from "./DayLightChart";
import FinnishCities from "./FinnishCities";
import Footer from "./Footer";

function App() {
  const [city, setCity] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  function capitalize(cityName) {
    return cityName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  const addCity = async (event) => {
    event.preventDefault(); // Prevent the form from causing a page reload
    const normalizedCity = city.toLowerCase(); // Normalize city name to lowercase
    if (!FinnishCities.includes(normalizedCity)) {
      alert("Syötä suomalainen kaupunki.");
      setCity("");
      return;
    }
  
    // Check if city has already been added
    if (data.some((entry) => entry.city.toLowerCase() === normalizedCity)) {
      alert("Kaupunki on jo lisätty.");
      setCity("");
      return;
    }
  
    setLoading(true);
    const dates = Array.from(
      { length: 12 },
      (_, i) => new Date(2024, i, 15).toISOString().split("T")[0]
    );
  
    // Check LocalStorage first before making API calls
    const cachedData = localStorage.getItem(normalizedCity); // Use normalized city name for cache key
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      const now = new Date();
      if (new Date(parsedData.expiry) > now) {
        setData((prevData) => [
          ...prevData,
          { city: capitalize(city), daylightData: parsedData.daylightData },
        ]);
        setCity("");
        setLoading(false);
        return;
      } else {
        localStorage.removeItem(normalizedCity); // Remove expired data
      }
    }
  
    try {
      const response = await axios.post(
        "https://daylenght-production.up.railway.app",
        {
          city: normalizedCity,
          dates: dates,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 20000,
        }
      );
  
      console.log("Backend response:", response); // Add this line to log the response
  
      const daylightData = response.data.daylightData.map((entry) => ({
        date: entry.date,
        daylight: Math.round(entry.daylight),
      }));
  
      // Store the fetched data in LocalStorage with an expiration date
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      localStorage.setItem(
        normalizedCity,
        JSON.stringify({ daylightData, expiry })
      );
  
      setData((prevData) => [
        ...prevData,
        { city: capitalize(city), daylightData },
      ]);
      setCity("");
    } catch (error) {
      console.error("Failed to fetch data: ", error);
      if (error.code === "ECONNABORTED") {
        alert("Request timed out. Please try again later.");
      } else {
        alert("Failed to load data.");
      }
    }
    setLoading(false);
  };
  

  const resetData = () => {
    setData([]);
    setCity("");
  };

  return (
    <div className="flex flex-col h-screen justify-between bg-gray-700">
      <div className="container mx-auto p-4 h-1/2">
        <h1 className="text-2xl font-bold text-center text-white mb-4">
          Päivänvalo minuutteina
        </h1>
        <form onSubmit={addCity} className="mb-4">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Kaupunki"
            className="border p-2 mr-2 rounded w-full bg-gray-800 text-white md:w-auto"
          />
          <button
            type="submit"
            className="bg-gray-800 hover:bg-gray-900 text-white border font-bold py-2 px-4 rounded mt-2 md:mt-0"
          >
            Lisää
          </button>
          <button
            type="button"
            onClick={resetData}
            className="bg-red-600 hover:bg-red-700 text-white border font-bold py-2 px-4 rounded ml-2 mt-2 md:mt-0"
          >
            Nollaa
          </button>
        </form>
        {loading ? (
          <div className="text-white">Loading...</div>
        ) : (
          data.length > 0 && <DaylightChart data={data} />
        )}
      </div>
      <Footer />
    </div>
  );
}

export default App;
