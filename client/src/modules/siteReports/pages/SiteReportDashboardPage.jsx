import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import ChartCard from '../../dashboard/components/ChartCard';
import LoadingSkeleton from '../../attendance/components/LoadingSkeleton';
import AttendanceSummaryCard from '../../attendance/components/AttendanceSummaryCard';
import EmptyState from '../../attendance/components/EmptyState';
import { 
    FaFileInvoice, 
    FaCalendarWeek, 
    FaHardHat, 
    FaExclamationCircle, 
    FaPlus, 
    FaHistory, 
    FaSync,
    FaCloudSun,
    FaArrowRight
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/siteReports.css';

export default function SiteReportDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        submittedToday: 0,
        submittedThisWeek: 0,
        activeProjects: 0,
        totalLabourReported: 0,
        openIssues: 0,
        delayedActivities: 0,
        averageProjectProgress: 0
    });
    const [selectedProject, setSelectedProject] = useState('');
    const [projects, setProjects] = useState([]);
    const [recentReports, setRecentReports] = useState([]);

    // Fetch projects dropdown
    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        fetch('/api/v1/projects', { headers })
            .then(res => res.json())
            .then(data => {
                if (data && data.projects) setProjects(data.projects);
            })
            .catch(() => {});
    }, []);

    const fetchDashboardStats = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        let url = '/api/v1/site-reports?limit=5';
        if (selectedProject) url += `&project=${selectedProject}`;

        fetch(url, { headers })
            .then(res => res.json())
            .then(data => {
                if (data && data.statistics) {
                    setStats(data.statistics);
                }
                setRecentReports(data.reports || []);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                toast.error('Failed to load site reports dashboard stats');
            });
    };

    useEffect(() => {
        fetchDashboardStats();
    }, [selectedProject]);

    // Analytics Mock Charts Data
    const progressTrendData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
            label: 'Avg Progress Completion %',
            data: [45, 48, 52, 53, 58, stats.averageProjectProgress || 62],
            borderColor: '#F97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            tension: 0.3,
            fill: true
        }]
    };

    const labourTrendData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
            label: 'Labour Reported Count',
            data: [120, 140, 135, 150, 160, stats.totalLabourReported || 145],
            backgroundColor: '#334155'
        }]
    };

    return (
        <DashboardLayout activePage="Reports">
            <ToastContainer />

            {/* Header section */}
            <div className="db-header">
                <div className="db-header-titles">
                    <h1>Daily Site Reports</h1>
                    <p>Track construction site updates, workforce logs, ongoing activities, delays, and photo catalogs.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <a href="#/reports/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                        <FaPlus /> Create Daily Report
                    </a>
                    <a href="#/reports/list" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                        <FaHistory /> Historical Reports
                    </a>
                </div>
            </div>

            {/* Filter panel */}
            <div className="attendance-filters-panel" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
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

                    <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '38px', alignSelf: 'flex-end' }} onClick={fetchDashboardStats}>
                        <FaSync /> Reload stats
                    </button>
                </div>
            </div>

            {/* Metrics cards grid */}
            <div className="stat-grid">
                <AttendanceSummaryCard 
                    title="Reports Submitted Today" 
                    value={stats.submittedToday} 
                    type="primary"
                    icon={<FaFileInvoice />}
                />
                <AttendanceSummaryCard 
                    title="Weekly Submissions" 
                    value={stats.submittedThisWeek} 
                    type="success"
                    icon={<FaCalendarWeek />}
                />
                <AttendanceSummaryCard 
                    title="Labour Count Reported" 
                    value={stats.totalLabourReported} 
                    type="accent"
                    icon={<FaHardHat />}
                />
                <AttendanceSummaryCard 
                    title="Open Project Issues" 
                    value={stats.openIssues} 
                    type="danger"
                    icon={<FaExclamationCircle />}
                />
            </div>

            {/* Secondary details layout */}
            <div className="details-grid">
                
                {/* Recent reports list left */}
                <div className="grid-col-8">
                    <div className="dashboard-card">
                        <div className="card-header-row" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
                            <h3>Recent Daily Site Reports</h3>
                        </div>

                        <div className="table-responsive">
                            <table className="project-table">
                                <thead>
                                    <tr>
                                        <th>Report ID</th>
                                        <th>Project</th>
                                        <th>Date</th>
                                        <th>Weather</th>
                                        <th>Labour Count</th>
                                        <th>Progress</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                {loading ? (
                                    <LoadingSkeleton rows={4} cols={8} />
                                ) : recentReports.length === 0 ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan="8">
                                                <EmptyState 
                                                    title="No Reports Filed"
                                                    description="No daily site logs have been generated under current filters."
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    <tbody>
                                        {recentReports.map(rep => (
                                            <tr key={rep._id}>
                                                <td style={{ fontWeight: 700 }}>{rep.reportCode}</td>
                                                <td>{rep.project?.projectName}</td>
                                                <td>{new Date(rep.reportDate).toLocaleDateString()}</td>
                                                <td>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                                        <FaCloudSun style={{ color: 'var(--warning)' }} /> {rep.weather}
                                                    </span>
                                                </td>
                                                <td>{rep.labourCount} workers</td>
                                                <td>
                                                    <strong style={{ color: 'var(--primary)' }}>{rep.progressPercentage}%</strong>
                                                </td>
                                                <td>
                                                    <span className={`report-status-badge ${rep.status.toLowerCase()}`}>
                                                        {rep.status}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <a href={`#/reports/${rep._id}`} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        View <FaArrowRight />
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                )}
                            </table>
                        </div>
                    </div>
                </div>

                {/* Charts right column */}
                <div className="grid-col-4">
                    <ChartCard 
                        title="Daily Completion Progress %" 
                        type="line" 
                        data={progressTrendData}
                    />
                </div>
            </div>

            <div className="details-grid">
                <div className="grid-col-12">
                    <ChartCard 
                        title="Workforce Labour Trend" 
                        type="bar" 
                        data={labourTrendData}
                    />
                </div>
            </div>

        </DashboardLayout>
    );
}
