import React, { useState } from 'react';
import axios from 'axios';
import DaylightChart from './DayLightChart';
import FinnishCities from './FinnishCities';
import Footer from './Footer';

function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  function capitalize(cityName) {
    return cityName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  const addCity = async (event) => {
    event.preventDefault(); // Prevent the form from causing a page reload
    if (!FinnishCities.includes(city.toLowerCase())) {
      alert("Please enter a valid city in Finland.");
      return;
    }

    setLoading(true);
    const dates = Array.from({ length: 12 }, (_, i) => new Date(2024, i, 15).toISOString().split('T')[0]);
    const promises = dates.map(date => axios.get(`http://localhost:8000?city=${city}&date=${date}`));

    try {
      const responses = await Promise.all(promises);
      const daylightData = responses.map((response, index) => ({
        date: dates[index],
        daylight: Math.round(response.data.daylight),
      }));

      setData(prevData => [...prevData, { city: capitalize(city), daylightData }]);
      setCity('');
    } catch (error) {
      console.error("Failed to fetch data: ", error);
      alert("Failed to load data.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen justify-between">
      <div className="container mx-auto p-4 h-1/2">
        <h1 className="text-2xl font-bold text-center mb-4">Daylight Visualizer</h1>
        <form onSubmit={addCity} className="mb-4">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city"
            className="border p-2 mr-2 rounded w-full md:w-auto"
          />
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 md:mt-0">
            Add City
          </button>
        </form>
        {loading ? <div>Loading...</div> : data.length > 0 && <DaylightChart data={data} />}
      </div>
      <Footer />
    </div>
  );
}

export default App;
