import React from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function ChartCard({ title, type = 'bar', data, options }) {
    
    // Default Construction Orange / Slate Gray color themes if none provided
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { family: "'Inter', sans-serif", size: 11 },
                    boxWidth: 12
                }
            },
            tooltip: {
                padding: 10,
                cornerRadius: 8,
                titleFont: { family: "'Inter', sans-serif", weight: 'bold' },
                bodyFont: { family: "'Inter', sans-serif" }
            }
        },
        scales: type === 'pie' || type === 'doughnut' ? {} : {
            y: {
                grid: { color: '#E2E8F0' },
                ticks: { font: { family: "'Inter', sans-serif", size: 10 } }
            },
            x: {
                grid: { display: false },
                ticks: { font: { family: "'Inter', sans-serif", size: 10 } }
            }
        },
        ...options
    };

    const renderChart = () => {
        switch (type) {
            case 'line':
                return <Line data={data} options={defaultOptions} />;
            case 'area':
                // For area chart, clone data and enable fill: true
                const areaData = {
                    ...data,
                    datasets: data.datasets.map(ds => ({ ...ds, fill: true }))
                };
                return <Line data={areaData} options={defaultOptions} />;
            case 'pie':
                return <Pie data={data} options={defaultOptions} />;
            case 'doughnut':
                return <Doughnut data={data} options={defaultOptions} />;
            case 'bar':
            default:
                return <Bar data={data} options={defaultOptions} />;
        }
    };

    return (
        <div className="dashboard-card">
            <div className="card-header-row">
                <h3>{title}</h3>
            </div>
            <div className="chart-container">
                {renderChart()}
            </div>
        </div>
    );
}
