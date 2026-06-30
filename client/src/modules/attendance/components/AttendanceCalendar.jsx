import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function AttendanceCalendar({ attendanceMap = {}, onDateClick }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Get first day of month
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday, 6 is Saturday
    // Get total days in month
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // Prepare calendar cells
    const cells = [];
    
    // Fill pre-month cells with empty/disabled states
    for (let i = 0; i < firstDayOfMonth; i++) {
        cells.push({ isOtherMonth: true, day: '' });
    }

    // Fill current month cells
    for (let day = 1; day <= totalDaysInMonth; day++) {
        // Format date string as YYYY-MM-DD
        const formattedMonth = String(month + 1).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        const dateKey = `${year}-${formattedMonth}-${formattedDay}`;
        
        const status = attendanceMap[dateKey] || ''; // Present, Absent, Half Day, Leave, Holiday, Site Closed
        cells.push({
            isOtherMonth: false,
            day,
            dateKey,
            status
        });
    }

    const getStatusClass = (status) => {
        if (!status) return '';
        switch (status) {
            case 'Present': return 'status-present';
            case 'Absent': return 'status-absent';
            case 'Half Day': return 'status-halfday';
            case 'Leave': return 'status-leave';
            case 'Holiday': return 'status-holiday';
            case 'Site Closed': return 'status-siteclosed';
            default: return '';
        }
    };

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="dashboard-card" style={{ padding: '20px' }}>
            <div className="card-header-row" style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px' }}>Attendance Calendar</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }} onClick={handlePrevMonth}>
                        <FaChevronLeft />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: '14px', minWidth: '120px', textAlign: 'center' }}>
                        {monthNames[month]} {year}
                    </span>
                    <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }} onClick={handleNextMonth}>
                        <FaChevronRight />
                    </button>
                </div>
            </div>

            <div className="attendance-calendar-grid">
                {daysOfWeek.map(d => (
                    <div key={d} className="attendance-calendar-day-header">{d}</div>
                ))}

                {cells.map((cell, idx) => {
                    if (cell.isOtherMonth) {
                        return (
                            <div key={`empty-${idx}`} className="attendance-calendar-cell other-month">
                                <span></span>
                            </div>
                        );
                    }

                    return (
                        <div 
                            key={cell.dateKey} 
                            className={`attendance-calendar-cell ${getStatusClass(cell.status)}`}
                            onClick={() => onDateClick && onDateClick(cell.dateKey, cell.status)}
                        >
                            <span>{cell.day}</span>
                            {cell.status && (
                                <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.85 }}>
                                    {cell.status === 'Site Closed' ? 'Closed' : cell.status}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Calendar Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '20px', fontSize: '12px', justifyContent: 'center', padding: '10px 0', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.25)', border: '1px solid var(--success)' }}></span>
                    <span>Present</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.25)', border: '1px solid var(--danger)' }}></span>
                    <span>Absent</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.25)', border: '1px solid var(--warning)' }}></span>
                    <span>Half Day</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'rgba(37, 99, 235, 0.25)', border: '1px solid var(--accent)' }}></span>
                    <span>Leave</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'rgba(100, 116, 139, 0.25)', border: '1px solid var(--text-muted)' }}></span>
                    <span>Holiday</span>
                </div>
            </div>
        </div>
    );
}
