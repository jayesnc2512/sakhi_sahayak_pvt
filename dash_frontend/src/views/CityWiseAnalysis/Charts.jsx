import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, ArcElement, CategoryScale, Legend } from 'chart.js';

ChartJS.register(Title, Tooltip, ArcElement, CategoryScale, Legend);

const Charts = ({ data,name }) => {
    const crimeTypes =  data['Crime Types'] || {};

    const chartData = {
        labels: Object.keys(crimeTypes),
        datasets: [
            {
                label: 'Crime Types in City',
                data: Object.values(crimeTypes),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                ],
            },
        ],
    };

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        const dataset = tooltipItem.dataset;
                        const index = tooltipItem.dataIndex;
                        const value = dataset.data[index];
                        return `${tooltipItem.label}: ${value} crimes`;
                    }
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Disable the legend
            }
        }
    };

    return (
        <div style={{ height: '300px' }}>
            <Pie data={chartData} options={options} />
            <h5 style={{ textAlign: 'center',marginTop:'-20px'}} >
                Crime distribution in {name} 2020
            </h5>
        </div>
    );
};

export default Charts;
