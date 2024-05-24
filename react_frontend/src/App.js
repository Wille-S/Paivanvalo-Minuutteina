import React, { useState } from "react";
import axios from "axios";
import DaylightChart from "./DayLightChart";
import FinnishCities from "./FinnishCities";
import Footer from "./Footer";
import Select from "react-select";

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
    event.preventDefault();

    if (city.trim() === "") {
      alert("Kenttä ei voi olla tyhjä");
      return;
    }
    const normalizedCity = city.toLowerCase();
    if (!FinnishCities.includes(normalizedCity)) {
      alert("Syötä suomalainen kaupunki.");
      setCity("");
      return;
    }

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

    const cachedData = localStorage.getItem(normalizedCity);
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
        localStorage.removeItem(normalizedCity);
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

      console.log("Backend response:", response);

      const daylightData = response.data.daylightData.map((entry) => ({
        date: entry.date,
        daylight: Math.round(entry.daylight),
      }));

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

  const removeCity = (cityToRemove) => {
    setData((prevData) => prevData.filter((entry) => entry.city !== cityToRemove));
  };

  const resetData = () => {
    setData([]);
    setCity("");
  };

  const cityOptions = data.map((entry) => ({
    value: entry.city,
    label: entry.city,
  }));

  return (
    <div className="flex flex-col h-screen justify-between bg-gray-700">
      <div className="container mx-auto p-4 h-1/2">
        <h1 className="text-2xl font-bold text-center text-white mb-4">
          Päivänvalo minuutteina
        </h1>
        <form onSubmit={addCity} className="mb-4 flex flex-wrap items-center justify-between space-y-2 md:space-y-0">
          <div className="flex flex-wrap items-center space-y-2 md:space-y-0 md:space-x-2">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Kaupunki"
              className="border p-2 rounded w-full bg-gray-800 text-white md:w-auto"
            />
            <button
              type="submit"
              className="bg-gray-800 hover:bg-gray-900 text-white border font-bold py-2 px-4 rounded"
            >
              Lisää
            </button>
            <button
              type="button"
              onClick={resetData}
              className="bg-red-600 hover:bg-red-700 text-white border font-bold py-2 px-4 rounded"
            >
              Nollaa
            </button>
          </div>
          <div className="w-full md:w-auto md:ml-2">
            {data.length > 0 && (
              <Select
                options={cityOptions}
                isClearable
                placeholder="Poista kaupunki..."
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    removeCity(selectedOption.value);
                  }
                }}
                className="text-gray-900"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '40px',
                    backgroundColor: '#4a5568',
                    borderColor: '#2d3748',
                    color: 'white',
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: 'white',
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: '#a0aec0',
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: '#4a5568',
                    color: 'white',
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#2d3748' : '#4a5568',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#2d3748',
                    },
                  }),
                }}
              />
            )}
          </div>
        </form>
        {loading ? (
          <div className="text-white">Loading...</div>
        ) : (
          <>
            {data.length > 0 && <DaylightChart data={data} />}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default App;
