import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function AttendanceSummaryCard({ title, value, type = 'primary', icon, trendVal, trendDirection = 'up', trendText = 'vs yesterday' }) {
    return (
        <div className={`stat-card ${type}`}>
            <div className="stat-icon-wrapper">
                {icon}
            </div>
            <div className="stat-details">
                <div className="stat-title">{title}</div>
                <div className="stat-value">{value}</div>
                {trendVal && (
                    <div className={`stat-trend ${trendDirection}`}>
                        {trendDirection === 'up' ? <FaArrowUp /> : <FaArrowDown />}
                        <span>{trendVal}</span>
                        <span className="stat-trend-text">{trendText}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
