import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import AttendanceSummaryCard from '../components/AttendanceSummaryCard';
import AttendanceCalendar from '../components/AttendanceCalendar';
import AttendanceTimeline from '../components/AttendanceTimeline';
import { 
    FaArrowLeft, 
    FaUser, 
    FaCalendarCheck, 
    FaHourglassHalf, 
    FaDollarSign, 
    FaUserShield,
    FaClipboardList
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/attendance.css';

export default function WorkerAttendanceProfilePage({ workerId: propWorkerId = null }) {
    // Check if workerId is passed in props, otherwise extract from hash route
    const getWorkerIdFromHash = () => {
        const hash = window.location.hash;
        const parts = hash.split('/');
        return parts[parts.length - 1];
    };

    const workerId = propWorkerId || getWorkerIdFromHash();

    const [loading, setLoading] = useState(true);
    const [worker, setWorker] = useState(null);
    const [stats, setStats] = useState({
        totalWorkingDays: 0,
        presentDays: 0,
        absentDays: 0,
        halfDays: 0,
        leaveDays: 0,
        holidayDays: 0,
        siteClosedDays: 0,
        totalHours: 0,
        attendancePercentage: 100
    });
    const [history, setHistory] = useState([]);
    const [calendarMap, setCalendarMap] = useState({});

    useEffect(() => {
        if (!workerId) return;

        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        fetch(`/api/v1/attendance/worker/${workerId}`, { headers })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to load worker profile');
                return data;
            })
            .then((data) => {
                setWorker(data.worker);
                if (data.statistics) {
                    setStats(data.statistics);
                }
                setHistory(data.history || []);

                // Build calendar status mapping
                const map = {};
                if (data.history) {
                    data.history.forEach(r => {
                        const dateKey = new Date(r.date).toISOString().split('T')[0];
                        map[dateKey] = r.status;
                    });
                }
                setCalendarMap(map);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                toast.error(err.message);
            });
    }, [workerId]);

    return (
        <DashboardLayout activePage="Labour">
            <ToastContainer />

            <div className="db-header" style={{ marginBottom: '20px' }}>
                <div className="db-header-titles">
                    <a href="#/labour" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                        <FaArrowLeft /> Back to Worker Force
                    </a>
                    <h1>Worker Attendance Analytics</h1>
                    <p>Detailed attendance performance sheets, hours audited, and active calendar heatmaps.</p>
                </div>
            </div>

            {loading ? (
                <div className="dashboard-card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner-icon" style={{ borderColor: 'var(--primary) transparent var(--primary) transparent', width: '32px', height: '32px' }}></div>
                    <span style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Retrieving stats profile...</span>
                </div>
            ) : !worker ? (
                <div className="dashboard-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <h3>Worker Not Found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>The requested worker reference does not exist or has been deleted.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Worker Meta Info Strip */}
                    <div className="dashboard-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
                            {worker.photo ? (
                                <img src={worker.photo} alt={worker.fullName} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '3px solid var(--primary-light)' }} />
                            ) : (
                                <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                                    <FaUser />
                                </div>
                            )}

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                    <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{worker.fullName}</h2>
                                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--secondary)', color: 'white' }}>
                                        {worker.employeeId}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 12px 0' }}>
                                    Trade: <strong>{worker.tradeCategory} ({worker.skillLevel})</strong> | Project: <strong>{worker.assignedProject?.projectName || 'Unassigned'}</strong>
                                </p>
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '13px' }}>
                                    <span>Daily Wage: <strong>₹{worker.dailyWage}</strong></span>
                                    <span>Shift Code: <strong>{worker.shift || 'General'}</strong></span>
                                    <span>Mobile: <strong>{worker.mobileNumber}</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Metric Widgets */}
                    <div className="stat-grid">
                        <AttendanceSummaryCard title="Attendance Rate" value={`${stats.attendancePercentage}%`} type="primary" icon={<FaCalendarCheck />} />
                        <AttendanceSummaryCard title="Total Days" value={stats.totalWorkingDays} type="accent" icon={<FaClipboardList />} />
                        <AttendanceSummaryCard title="Worked Hours" value={`${stats.totalHours.toFixed(1)} hrs`} type="success" icon={<FaHourglassHalf />} />
                        <AttendanceSummaryCard title="Unexcused Absences" value={stats.absentDays} type="danger" icon={<FaUserShield />} />
                    </div>

                    {/* Secondary details layout */}
                    <div className="details-grid">
                        <div className="grid-col-7">
                            <AttendanceCalendar attendanceMap={calendarMap} />
                        </div>
                        <div className="grid-col-5">
                            <div className="dashboard-card">
                                <div className="card-header-row" style={{ marginBottom: '16px' }}>
                                    <h3>Activity Timeline Logs</h3>
                                </div>
                                <div style={{ overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
                                    <AttendanceTimeline history={history} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
