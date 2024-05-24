import React from 'react';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

function DaylightChart({ data }) {
  // Värit palkkeihin ja myös oletusväri
  Chart.defaults.color = '#ffffff';
  const colors = [
    '#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236', '#166a8f', 
    '#00a950', '#58595b', '#8549ba', '#ff9f40', '#36a2eb', '#ffcd56',
    '#8e5ea2', '#3cba9f', '#e8c3b9', '#c45850', '#ff6384', '#36a2eb',
    '#cc65fe', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40', '#ff6384',
    '#66aa00', '#d3d3d3', '#4682b4', '#ff4500', '#8a2be2', '#da70d6'
  ];

  // Luo kaavion datan dynaamisilla väreillä
  const chartData = {
    labels: Array.from({ length: 12 }, (_, i) => new Date(2024, i, 15).toLocaleDateString('fi-FI', { month: 'short' })),
    datasets: data.map((cityData, index) => ({
      label: cityData.city,
      data: cityData.daylightData.map(d => d.daylight),
      backgroundColor: colors[index % colors.length], // Väri paletista
    })),
  };

  // Kaavion asetukset
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: '14th of Month',
        }
      },
      y: {
        title: {
          display: true,
          text: 'Daylight (minutes)',
        },
        beginAtZero: true,
        max: 1440,
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
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
    <div className="p-4 bg-gray-800 shadow-xl h-full rounded-lg">
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default DaylightChart;
