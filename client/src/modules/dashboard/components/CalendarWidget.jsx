import React from 'react';

export default function CalendarWidget() {
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear();
    const currentDate = today.getDate();

    // Mock calendar cells: June/July depending on today. For testing, we hardcode a layout.
    // Days names
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    
    // Calendar days matching a typical layout
    const days = [
        { day: 28, isMuted: true },
        { day: 29, isMuted: true },
        { day: 30, isMuted: true },
        { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 }, { day: 5 }, { day: 6 },
        { day: 7 }, { day: 8 }, { day: 9 }, { day: 10, hasEvent: true }, { day: 11 }, { day: 12 },
        { day: 13 }, { day: 14 }, { day: 15 }, { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 },
        { day: 20 }, { day: 21 }, { day: 22 }, { day: 23 }, { day: 24 }, { day: 25, isToday: true }, 
        { day: 26 }, { day: 27 }, { day: 28 }, { day: 29 }, { day: 30 }, { day: 31 },
        { day: 1, isMuted: true }, { day: 2, isMuted: true }, { day: 3, isMuted: true }
    ];

    return (
        <div className="dashboard-card" style={{ height: '100%' }}>
            <div className="card-header-row">
                <h3>Milestone Schedule</h3>
            </div>
            
            <div className="calendar-widget-wrapper">
                <div className="calendar-header">
                    <span>{currentMonth} {currentYear}</span>
                    <span style={{ fontSize: '12px', color: '#F97316', fontWeight: 600 }}>Active Audits: 1</span>
                </div>

                <div className="calendar-grid">
                    {dayNames.map((name, idx) => (
                        <div key={idx} className="calendar-day-name">{name}</div>
                    ))}
                    {days.map((d, idx) => {
                        let cellClass = 'calendar-cell';
                        if (d.isMuted) cellClass += ' muted';
                        if (d.isToday || d.day === currentDate && !d.isMuted) cellClass += ' today';
                        if (d.hasEvent) cellClass += ' event';

                        return (
                            <div key={idx} className={cellClass}>
                                {d.day}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
