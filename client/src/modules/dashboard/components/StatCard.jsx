import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function StatCard({ title, value, icon, trend, trendUp, description, themeClass = 'primary' }) {
    return (
        <div className={`stat-card ${themeClass}`}>
            <div className="stat-icon-wrapper">
                {icon}
            </div>
            <div className="stat-details">
                <span className="stat-title">{title}</span>
                <div className="stat-value">{value}</div>
                <div className="stat-trend-row" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={`stat-trend ${trendUp ? 'up' : 'down'}`}>
                        {trendUp ? <FaArrowUp /> : <FaArrowDown />} {trend}
                    </span>
                    <span className="stat-trend-text">{description}</span>
                </div>
            </div>
        </div>
    );
}
