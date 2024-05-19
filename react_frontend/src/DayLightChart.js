import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

function DaylightChart({ data }) {
  const chartData = {
    labels: Array.from({ length: 12 }, (_, i) => new Date(2024, i, 15).toLocaleDateString('fi-FI', { month: 'short' })),
    datasets: data.map((cityData, index) => ({
      label: cityData.city,
      data: cityData.daylightData.map(d => d.daylight),
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      fill: false,
    })),
  };

  return (
    <div>
      <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
}

export default DaylightChart;
