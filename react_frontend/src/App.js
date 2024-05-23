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
      alert("Please enter a valid city in Finland.");
      return;
    }

    // Check if city has already been added
    if (data.some((entry) => entry.city.toLowerCase() === normalizedCity)) {
      alert("This city has already been added.");
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
      setData((prevData) => [
        ...prevData,
        { city: capitalize(city), daylightData: parsedData },
      ]);
      setCity("");
      setLoading(false);
    } else {
      const promises = dates.map((date) =>
        axios.get(`http://localhost:8000?city=${normalizedCity}&date=${date}`, {
          timeout: 20000
        })
      );
      try {
        const responses = await Promise.all(promises);
        const daylightData = responses.map((response, index) => ({
          date: dates[index],
          daylight: Math.round(response.data.daylight),
        }));

        // Store the fetched data in LocalStorage using the normalized city name
        localStorage.setItem(normalizedCity, JSON.stringify(daylightData));

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
    }
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
