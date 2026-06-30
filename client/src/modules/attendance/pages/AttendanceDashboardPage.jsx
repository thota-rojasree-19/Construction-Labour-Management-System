import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import ChartCard from '../../dashboard/components/ChartCard';
import AttendanceSummaryCard from '../components/AttendanceSummaryCard';
import AttendanceCalendar from '../components/AttendanceCalendar';
import AttendanceStatusChip from '../components/AttendanceStatusChip';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { 
    FaClipboardCheck, 
    FaUserCheck, 
    FaUserTimes, 
    FaUserClock, 
    FaPercent, 
    FaCalendarAlt, 
    FaHistory, 
    FaPlus, 
    FaSearch, 
    FaFilter, 
    FaSync
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/attendance.css';

export default function AttendanceDashboardPage() {
    const [viewMode, setViewMode] = useState('daily'); // 'daily', 'weekly', 'monthly'
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        halfDay: 0,
        leave: 0,
        holiday: 0,
        siteClosed: 0,
        attendancePercentage: 100
    });
    const [records, setRecords] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Calendar state mappings
    const [calendarData, setCalendarData] = useState({});

    // Fetch projects to populate dropdown filters
    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        fetch('/api/v1/projects', { headers })
            .then(res => res.json())
            .then(data => {
                if (data && data.projects) {
                    setProjects(data.projects);
                }
            })
            .catch(() => toast.error('Failed to load project references'));
    }, []);

    // Load attendance records & compiled stats
    const fetchAttendanceData = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        let url = `/api/v1/attendance?date=${selectedDate}&limit=100`;
        if (selectedProject) {
            url += `&project=${selectedProject}`;
        }

        fetch(url, { headers })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Error loading dashboard');
                return data;
            })
            .then((data) => {
                setRecords(data.records || []);
                if (data.statistics) {
                    setStats(data.statistics);
                }
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                toast.error(err.message);
            });
    };

    // Load entire month's logs for the calendar mapping
    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Fetch last 30 days of records
        const today = new Date();
        const start = new Date();
        start.setDate(today.getDate() - 30);
        
        const startStr = start.toISOString().split('T')[0];
        const endStr = today.toISOString().split('T')[0];

        fetch(`/api/v1/attendance?startDate=${startStr}&endDate=${endStr}&limit=500`, { headers })
            .then(res => res.json())
            .then(data => {
                if (data && data.records) {
                    // Map date to status
                    const map = {};
                    data.records.forEach(r => {
                        const dateKey = new Date(r.date).toISOString().split('T')[0];
                        // If multiple records per date, keep higher priority state (Absent/Halfday/Present)
                        map[dateKey] = r.status;
                    });
                    setCalendarData(map);
                }
            })
            .catch(() => {});
    }, [selectedDate]);

    useEffect(() => {
        fetchAttendanceData();
    }, [selectedDate, selectedProject]);

    // Chart mock data
    const attendanceTrendData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
            label: 'Attendance %',
            data: [92, 88, 95, 94, 90, 85],
            borderColor: '#F97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            tension: 0.3,
            fill: true
        }]
    };

    const statusDistributionData = {
        labels: ['Present', 'Absent', 'Half Day', 'Leave'],
        datasets: [{
            data: [stats.present || 75, stats.absent || 10, stats.halfDay || 8, stats.leave || 2],
            backgroundColor: ['#22C55E', '#EF4444', '#F59E0B', '#2563EB']
        }]
    };

    const projectwiseData = {
        labels: ['Skyline Heights', 'Bridge Alpha', 'Tunnel Metro', 'Highway Phase 2'],
        datasets: [{
            label: 'Present Workers',
            data: [42, 28, 19, 35],
            backgroundColor: '#334155'
        }]
    };

    return (
        <DashboardLayout activePage="Attendance">
            <ToastContainer />

            {/* Header Actions */}
            <div className="db-header">
                <div className="db-header-titles">
                    <h1>Workforce Attendance</h1>
                    <p>Track, manage, and verify labor attendance check-ins across active construction sites.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <a href="#/attendance/bulk" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                        <FaPlus /> Bulk Mark Attendance
                    </a>
                    <a href="#/attendance/history" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                        <FaHistory /> Attendance History
                    </a>
                </div>
            </div>

            {/* Quick Filter Panel */}
            <div className="attendance-filters-panel">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PROJECT SITE</span>
                            <select 
                                className="form-input" 
                                style={{ width: '220px', padding: '8px 12px', fontSize: '13px' }}
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                            >
                                <option value="">All Projects</option>
                                {projects.map(p => (
                                    <option key={p._id} value={p._id}>{p.projectName}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>ATTENDANCE DATE</span>
                            <input 
                                type="date" 
                                className="form-input"
                                style={{ width: '180px', padding: '8px 12px', fontSize: '13px' }}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-end', height: '38px' }} onClick={fetchAttendanceData}>
                        <FaSync /> Reload
                    </button>
                </div>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="stat-grid">
                <AttendanceSummaryCard 
                    title="Present Workers" 
                    value={stats.present} 
                    type="success"
                    icon={<FaUserCheck />}
                    trendVal="+5"
                    trendDirection="up"
                />
                <AttendanceSummaryCard 
                    title="Absent Workers" 
                    value={stats.absent} 
                    type="danger"
                    icon={<FaUserTimes />}
                    trendVal="-2"
                    trendDirection="down"
                />
                <AttendanceSummaryCard 
                    title="Half Day Workers" 
                    value={stats.halfDay} 
                    type="warning"
                    icon={<FaUserClock />}
                    trendVal="+1"
                    trendDirection="up"
                />
                <AttendanceSummaryCard 
                    title="Attendance %" 
                    value={`${stats.attendancePercentage}%`} 
                    type="primary"
                    icon={<FaPercent />}
                    trendVal="+2%"
                    trendDirection="up"
                />
            </div>

            {/* Main Content Layout Grid */}
            <div className="details-grid">
                
                {/* Daily Check-in Roster Table */}
                <div className="grid-col-8">
                    <div className="dashboard-card">
                        <div className="card-header-row">
                            <h3>Roster Logs for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</h3>
                        </div>

                        <div className="table-responsive">
                            <table className="project-table">
                                <thead>
                                    <tr>
                                        <th>Employee ID</th>
                                        <th>Worker Name</th>
                                        <th>Project Site</th>
                                        <th>Shift</th>
                                        <th>Status</th>
                                        <th>Check-in/Out</th>
                                        <th>Hours</th>
                                    </tr>
                                </thead>
                                {loading ? (
                                    <LoadingSkeleton rows={5} cols={7} />
                                ) : records.length === 0 ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan="7">
                                                <EmptyState 
                                                    title="No Roster Logs Recorded" 
                                                    description="No attendance reports have been registered for this filter group on this date."
                                                    actionLabel="Mark Attendance Now"
                                                    onAction={() => window.location.hash = '#/attendance/bulk'}
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    <tbody>
                                        {records.map((rec) => (
                                            <tr key={rec._id}>
                                                <td>
                                                    <a href={`#/attendance/worker/${rec.worker?._id}`} style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
                                                        {rec.worker?.employeeId || 'EMP-N/A'}
                                                    </a>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {rec.worker?.photo ? (
                                                            <img src={rec.worker.photo} alt={rec.worker.fullName} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                                                                {rec.worker?.fullName ? rec.worker.fullName.charAt(0) : 'W'}
                                                            </span>
                                                        )}
                                                        <div>
                                                            <div style={{ fontWeight: 600 }}>{rec.worker?.fullName || 'Unknown'}</div>
                                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rec.worker?.tradeCategory || 'Helper'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{rec.project?.projectName || 'Unassigned'}</td>
                                                <td>{rec.shift}</td>
                                                <td>
                                                    <AttendanceStatusChip status={rec.status} />
                                                </td>
                                                <td>
                                                    {rec.status === 'Present' || rec.status === 'Half Day' ? (
                                                        <span style={{ fontSize: '12px', fontWeight: 600 }}>
                                                            {rec.checkInTime || '--:--'} - {rec.checkOutTime || '--:--'}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>--</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {rec.status === 'Present' || rec.status === 'Half Day' ? (
                                                        <strong style={{ fontSize: '12px' }}>{rec.workingHours} hrs</strong>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>--</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                )}
                            </table>
                        </div>
                    </div>
                </div>

                {/* Calendar View Right Column */}
                <div className="grid-col-4">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
                        <AttendanceCalendar 
                            attendanceMap={calendarData} 
                            onDateClick={(d) => setSelectedDate(d)}
                        />
                    </div>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="details-grid">
                <div className="grid-col-4">
                    <ChartCard 
                        title="Attendance Status Breakdown" 
                        type="doughnut" 
                        data={statusDistributionData}
                    />
                </div>
                <div className="grid-col-8">
                    <ChartCard 
                        title="30-Day Attendance Trend" 
                        type="area" 
                        data={attendanceTrendData}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
