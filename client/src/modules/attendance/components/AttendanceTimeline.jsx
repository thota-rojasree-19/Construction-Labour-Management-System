import React from 'react';
import { FaClock, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';

export default function AttendanceTimeline({ history = [] }) {
    if (history.length === 0) {
        return (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                No recent attendance activities recorded.
            </div>
        );
    }

    return (
        <div className="attendance-timeline-list">
            {history.map((record) => {
                const dateStr = new Date(record.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });

                const statusClass = record.status.toLowerCase().replace(' ', '');

                return (
                    <div key={record._id} className={`attendance-timeline-node ${statusClass}`}>
                        <div className="attendance-timeline-dot"></div>
                        <div className="attendance-timeline-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>
                                    {dateStr}
                                </span>
                                <span style={{ 
                                    fontSize: '11px', 
                                    fontWeight: 700, 
                                    padding: '2px 8px', 
                                    borderRadius: '12px',
                                    backgroundColor: 
                                        record.status === 'Present' ? 'rgba(34,197,94,0.15)' : 
                                        record.status === 'Absent' ? 'rgba(239,68,68,0.15)' : 
                                        record.status === 'Half Day' ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.15)',
                                    color: 
                                        record.status === 'Present' ? 'var(--success)' : 
                                        record.status === 'Absent' ? 'var(--danger)' : 
                                        record.status === 'Half Day' ? 'var(--warning)' : 'var(--text-muted)'
                                }}>
                                    {record.status}
                                </span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px' }}>
                                    {record.project && (
                                        <span>Project: <strong>{record.project.projectName}</strong></span>
                                    )}
                                    <span>Shift: <strong>{record.shift}</strong></span>
                                </div>
                                {(record.status === 'Present' || record.status === 'Half Day') && (
                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '4px' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <FaSignInAlt style={{ color: 'var(--success)' }} /> Check-in: {record.checkInTime || '--:--'}
                                        </span>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <FaSignOutAlt style={{ color: 'var(--danger)' }} /> Check-out: {record.checkOutTime || '--:--'}
                                        </span>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <FaClock style={{ color: 'var(--primary)' }} /> Hours: {record.workingHours} hrs
                                        </span>
                                    </div>
                                )}
                                {record.remarks && (
                                    <div style={{ marginTop: '8px', padding: '6px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.5)', borderLeft: '3px solid var(--primary)', fontSize: '11px', fontStyle: 'italic' }}>
                                        "{record.remarks}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
