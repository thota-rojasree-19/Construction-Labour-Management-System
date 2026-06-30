import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import LoadingSkeleton from '../../attendance/components/LoadingSkeleton';
import EmptyState from '../../attendance/components/EmptyState';
import { 
    FaArrowLeft, 
    FaSearch, 
    FaFilter, 
    FaEye, 
    FaEdit, 
    FaTrash,
    FaCopy,
    FaChevronLeft,
    FaChevronRight,
    FaArrowUp,
    FaArrowDown,
    FaCloudSun,
    FaFilePdf
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/siteReports.css';

export default function SiteReportListPage() {
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState([]);
    const [projects, setProjects] = useState([]);
    
    // Filters
    const [search, setSearch] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedWeather, setSelectedWeather] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Pagination & sorting
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [sortBy, setSortBy] = useState('reportDate');
    const [sortOrder, setSortOrder] = useState('desc');

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

    const fetchReports = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        let url = `/api/v1/site-reports?page=${page}&limit=10&sortBy=${sortBy}&sortOrder=${sortOrder}`;
        
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (selectedProject) url += `&project=${selectedProject}`;
        if (selectedStatus) url += `&status=${selectedStatus}`;
        if (selectedWeather) url += `&weather=${selectedWeather}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        fetch(url, { headers })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to fetch reports list');
                return data;
            })
            .then((data) => {
                setReports(data.reports || []);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages || 1);
                    setTotalResults(data.pagination.totalResults || 0);
                }
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                toast.error(err.message);
            });
    };

    useEffect(() => {
        fetchReports();
    }, [page, selectedProject, selectedStatus, selectedWeather, sortBy, sortOrder]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchReports();
    };

    const handleResetFilters = () => {
        setSearch('');
        setSelectedProject('');
        setSelectedStatus('');
        setSelectedWeather('');
        setStartDate('');
        setEndDate('');
        setPage(1);
        setTimeout(() => fetchReports(), 100);
    };

    const handleDelete = (reportId) => {
        if (!window.confirm('Delete this site report?')) return;

        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        fetch(`/api/v1/site-reports/${reportId}`, {
            method: 'DELETE',
            headers
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete');
            return data;
        })
        .then(() => {
            toast.success('Site report deleted successfully.');
            fetchReports();
        })
        .catch((err) => toast.error(err.message));
    };

    const handleDuplicate = (rep) => {
        localStorage.setItem('duplicateReport', JSON.stringify({
            project: rep.project?._id || rep.project || '',
            weather: rep.weather || 'Clear',
            shift: rep.shift || 'General',
            workCompleted: `${rep.workCompleted} (Copy)`,
            ongoingWork: rep.ongoingWork || '',
            plannedWork: rep.plannedWork || '',
            progressPercentage: rep.progressPercentage || 0,
            labourCount: rep.labourCount || 0,
            skilledLabourCount: rep.skilledLabourCount || 0,
            unskilledLabourCount: rep.unskilledLabourCount || 0,
            issues: rep.issues || '',
            delays: rep.delays || '',
            safetyIncidents: rep.safetyIncidents || '',
            materialShortages: rep.materialShortages || '',
            equipmentProblems: rep.equipmentProblems || '',
            remarks: rep.remarks || '',
            status: 'Draft'
        }));
        window.location.hash = '#/reports/new';
    };

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
        setPage(1);
    };

    return (
        <DashboardLayout activePage="Reports">
            <ToastContainer />

            <div className="db-header" style={{ marginBottom: '20px' }}>
                <div className="db-header-titles">
                    <a href="#/reports" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                        <FaArrowLeft /> Back to Dashboard
                    </a>
                    <h1>Reports Ledger</h1>
                    <p>Audit construction progress files, daily work diaries, workforce grids, and site photos logs.</p>
                </div>
            </div>

            {/* Filter panel */}
            <div className="attendance-filters-panel" style={{ marginBottom: '24px' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>GLOBAL SEARCH</span>
                            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '6px 12px' }}>
                                <FaSearch style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search work summaries..."
                                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px' }}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PROJECT SITE</span>
                            <select 
                                className="form-input"
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                style={{ fontSize: '13px', padding: '8px 12px' }}
                            >
                                <option value="">All Projects</option>
                                {projects.map(p => (
                                    <option key={p._id} value={p._id}>{p.projectName}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>WEATHER</span>
                            <select 
                                className="form-input"
                                value={selectedWeather}
                                onChange={(e) => setSelectedWeather(e.target.value)}
                                style={{ fontSize: '13px', padding: '8px 12px' }}
                            >
                                <option value="">All Weather</option>
                                <option value="Clear">Clear / Sunny</option>
                                <option value="Rainy">Rainy</option>
                                <option value="Windy">Windy</option>
                                <option value="Overcast">Overcast</option>
                                <option value="Stormy">Stormy</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</span>
                            <select 
                                className="form-input"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                style={{ fontSize: '13px', padding: '8px 12px' }}
                            >
                                <option value="">All Statuses</option>
                                <option value="Draft">Draft</option>
                                <option value="Submitted">Submitted</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600 }}>From:</span>
                                <input type="date" className="form-input" style={{ width: '140px', padding: '4px 8px', fontSize: '12px' }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600 }}>To:</span>
                                <input type="date" className="form-input" style={{ width: '140px', padding: '4px 8px', fontSize: '12px' }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" className="btn btn-secondary" onClick={handleResetFilters}>
                                Clear Filters
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <FaFilter /> Search Logs
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Ledger table */}
            <div className="dashboard-card">
                <div className="card-header-row" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '15px' }}>Daily Site Reports Ledger ({totalResults})</h3>
                </div>

                <div className="table-responsive">
                    <table className="project-table">
                        <thead>
                            <tr>
                                <th>Report ID</th>
                                <th>Project Site</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('reportDate')}>
                                    Report Date {sortBy === 'reportDate' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                </th>
                                <th>Weather</th>
                                <th>Site Supervisor</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('labourCount')}>
                                    Labour Count {sortBy === 'labourCount' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('progressPercentage')}>
                                    Work Progress {sortBy === 'progressPercentage' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                </th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        {loading ? (
                            <LoadingSkeleton rows={10} cols={9} />
                        ) : reports.length === 0 ? (
                            <tbody>
                                <tr>
                                    <td colSpan="9">
                                        <EmptyState 
                                            title="No Site Reports Found"
                                            description="Reset filters or click 'Create Daily Report' to log work completion diaries."
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {reports.map(rep => (
                                    <tr key={rep._id}>
                                        <td style={{ fontWeight: 700 }}>{rep.reportCode}</td>
                                        <td style={{ fontWeight: 600 }}>{rep.project?.projectName}</td>
                                        <td>
                                            {new Date(rep.reportDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </td>
                                        <td>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                <FaCloudSun style={{ color: 'var(--warning)' }} /> {rep.weather}
                                            </span>
                                        </td>
                                        <td>{rep.supervisor?.fullName || 'N/A'}</td>
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
                                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                <a href={`#/reports/${rep._id}`} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }} title="View details">
                                                    <FaEye />
                                                </a>
                                                <a href={`#/reports/edit/${rep._id}`} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }} title="Edit report">
                                                    <FaEdit />
                                                </a>
                                                <button type="button" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }} onClick={() => handleDuplicate(rep)} title="Duplicate Record">
                                                    <FaCopy />
                                                </button>
                                                <button type="button" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--danger)' }} onClick={() => handleDelete(rep._id)} title="Delete record">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Showing page {page} of {totalPages} ({totalResults} reports total)
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                disabled={page === 1}
                                onClick={() => setPage(prev => prev - 1)}
                            >
                                <FaChevronLeft /> Prev
                            </button>
                            <button 
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                disabled={page === totalPages}
                                onClick={() => setPage(prev => prev + 1)}
                            >
                                Next <FaChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
