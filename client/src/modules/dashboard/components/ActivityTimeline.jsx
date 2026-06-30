import React from 'react';

export default function ActivityTimeline({ activities }) {
    return (
        <div className="dashboard-card" style={{ height: '100%' }}>
            <div className="card-header-row">
                <h3>Recent Activity Logs</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                <ul className="timeline">
                    {activities.map((act, idx) => (
                        <li key={act._id || act.id || idx} className={`timeline-item ${act.themeClass || 'primary'}`}>
                            <div className="timeline-badge"></div>
                            <div className="timeline-content">
                                <span className="timeline-title">{act.title}</span>
                                {act.description && <span className="timeline-desc">{act.description}</span>}
                                <span className="timeline-time">{act.time}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
