import React from 'react';

export default function PerformanceCard() {
    const performances = [
        { label: 'Project Completion Rate', value: '78%', color: '#2563EB' },
        { label: 'Today\'s Attendance Rate', value: '92%', color: '#22C55E' },
        { label: 'Labour Force Utilization', value: '85%', color: '#F97316' },
        { label: 'Budget Utilization Accuracy', value: '64%', color: '#EF4444' }
    ];

    return (
        <div className="dashboard-card" style={{ height: '100%' }}>
            <div className="card-header-row">
                <h3>Overall Safety & KPI Rates</h3>
            </div>
            
            <div className="performance-grid">
                {performances.map((perf, index) => (
                    <div key={index} className="perf-item">
                        <div className="perf-info">
                            <span className="perf-label">{perf.label}</span>
                            <span className="perf-value">{perf.value}</span>
                        </div>
                        <div className="perf-bar-bg">
                            <div 
                                className="perf-bar-fill" 
                                style={{ 
                                    width: perf.value,
                                    backgroundColor: perf.color 
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
