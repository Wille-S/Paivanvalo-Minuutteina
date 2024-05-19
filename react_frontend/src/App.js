import React, { useState } from 'react';
import axios from 'axios';
import DaylightChart from './DayLightChart';
import FinnishCities from './FinnishCities';

function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState([]);

  function capitalize(cityName) {
    return cityName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  const addCity = async () => {
    if (!FinnishCities.includes(city.toLowerCase())) {
      alert("Please enter a valid city in Finland.");
      return;
    }

    const dates = Array.from({ length: 12 }, (_, i) => new Date(2024, i, 15).toISOString().split('T')[0]);
    const promises = dates.map(date => axios.get(`http://localhost:8000?city=${city}&date=${date}`));
    const responses = await Promise.all(promises);

    const daylightData = responses.map((response, index) => ({
      date: dates[index],
      daylight: Math.round(response.data.daylight),
    }));

    setData([...data, { city: capitalize(city), daylightData }]); // Capitalize city name here
    setCity('');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Daylight Visualizer</h1>
      <div className="mb-4">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
          className="border p-2 mr-2"
        />
        <button onClick={addCity} className="bg-blue-500 text-white p-2">Add City</button>
      </div>
      <DaylightChart data={data} />
    </div>
  );
}

export default App;
