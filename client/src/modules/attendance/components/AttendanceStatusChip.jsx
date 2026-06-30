import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaAdjust, FaCalendarMinus, FaUmbrellaBeach, FaLock } from 'react-icons/fa';

export default function AttendanceStatusChip({ status }) {
    const getStatusConfig = () => {
        switch (status) {
            case 'Present':
                return { className: 'present', icon: <FaCheckCircle />, label: 'Present' };
            case 'Absent':
                return { className: 'absent', icon: <FaTimesCircle />, label: 'Absent' };
            case 'Half Day':
                return { className: 'half-day', icon: <FaAdjust />, label: 'Half Day' };
            case 'Leave':
                return { className: 'leave', icon: <FaUmbrellaBeach />, label: 'Leave' };
            case 'Holiday':
                return { className: 'holiday', icon: <FaCalendarMinus />, label: 'Holiday' };
            case 'Site Closed':
                return { className: 'site-closed', icon: <FaLock />, label: 'Site Closed' };
            default:
                return { className: 'holiday', icon: <FaCalendarMinus />, label: status || 'N/A' };
        }
    };

    const { className, icon, label } = getStatusConfig();

    return (
        <span className={`status-chip ${className}`}>
            {icon}
            <span>{label}</span>
        </span>
    );
}
