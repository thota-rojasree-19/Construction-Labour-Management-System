import React from 'react';
import { FaSun, FaWind, FaTint, FaShieldAlt } from 'react-icons/fa';

export default function WeatherWidget() {
    // High-fidelity weather dashboard placeholder
    const weatherData = {
        temp: '32°C',
        condition: 'Partly Cloudy',
        location: 'Mumbai HQ site',
        humidity: '68%',
        wind: '14 km/h',
        safetyStatus: 'Optimal Crane Operations',
        safetyClass: 'success'
    };

    return (
        <div className="dashboard-card" style={{ height: '100%' }}>
            <div className="card-header-row">
                <h3>Weather & Site Safety</h3>
            </div>
            
            <div className="weather-details">
                <div className="weather-header">
                    <div className="weather-condition">
                        <span className="weather-temp">{weatherData.temp}</span>
                        <span className="weather-text">{weatherData.condition}</span>
                        <span className="weather-city">{weatherData.location}</span>
                    </div>
                    <FaSun className="weather-icon" style={{ color: '#F59E0B' }} />
                </div>

                <div className="weather-grid">
                    <div className="weather-subitem">
                        <FaTint className="weather-subicon" style={{ color: '#3B82F6' }} />
                        <div>
                            <span>Humidity: </span>
                            <span className="weather-subvalue">{weatherData.humidity}</span>
                        </div>
                    </div>
                    <div className="weather-subitem">
                        <FaWind className="weather-subicon" style={{ color: '#64748B' }} />
                        <div>
                            <span>Wind: </span>
                            <span className="weather-subvalue">{weatherData.wind}</span>
                        </div>
                    </div>
                </div>

                <div 
                    className={`badge ${weatherData.safetyClass}`} 
                    style={{ 
                        width: '100%', 
                        justifyContent: 'center', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <FaShieldAlt /> {weatherData.safetyStatus}
                </div>
            </div>
        </div>
    );
}
