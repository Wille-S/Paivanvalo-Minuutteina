import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

function DaylightChart({ data }) {
  // Define a palette of colors for the bars
  const colors = ['#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236', '#166a8f', '#00a950', '#58595b', '#8549ba'];

  // Create chart data with dynamic colors
  const chartData = {
    labels: Array.from({ length: 12 }, (_, i) => new Date(2024, i, 15).toLocaleDateString('fi-FI', { month: 'short' })),
    datasets: data.map((cityData, index) => ({
      label: cityData.city,
      data: cityData.daylightData.map(d => d.daylight),
      backgroundColor: colors[index % colors.length], // Use a color from the palette
    })),
  };

  // Define chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: '14th of Month',
          color: '#4B5563', // Tailwind gray-700
        }
      },
      y: {
        title: {
          display: true,
          text: 'Daylight (minutes)',
          color: '#4B5563', // Tailwind gray-700
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          color: '#374151' // Tailwind gray-700
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} minutes`;
          }
        }
      }
    }
  };

  return (
    <div className="p-4 bg-white shadow-xl h-full rounded-lg">
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default DaylightChart;
