import React, { useState } from 'react';
import axios from 'axios';
import DaylightChart from './DayLightChart';

function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState([]);

  const addCity = async () => {
    const dates = Array.from({ length: 12 }, (_, i) => new Date(2024, i, 15).toISOString().split('T')[0]);
    const promises = dates.map(date => axios.get(`http://localhost:8000?city=${city}&date=${date}`));
    const responses = await Promise.all(promises);
  
    console.log('API Responses:', responses);
  
    const daylightData = responses.map((response, index) => ({
      date: dates[index],
      daylight: response.data.daylight,
    }));
  
    console.log('Daylight Data:', daylightData);
  
    setData([...data, { city, daylightData }]);
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
