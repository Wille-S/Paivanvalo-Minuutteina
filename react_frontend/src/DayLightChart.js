import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import 'chartjs-plugin-annotation';

// Registering components required for the chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function DaylightChart({ data }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw} minutes`;
          }
        }
      },
      annotation: {
        annotations: {
          line1: {
            // Example static annotation; you'll need logic to dynamically set `value`
            type: 'line',
            yMin: 800,
            yMax: 800,
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 2,
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Creating chart data
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((set, index) => ({
      ...set,
      backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
    })),
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default DaylightChart;
