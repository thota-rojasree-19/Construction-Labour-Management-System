import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import AttendanceStatusChip from '../components/AttendanceStatusChip';
import { 
    FaArrowLeft, 
    FaSearch, 
    FaFilter, 
    FaFileDownload,
    FaArrowUp,
    FaArrowDown,
    FaRegCalendarAlt,
    FaChevronLeft,
    FaChevronRight
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/attendance.css';

export default function AttendanceHistoryPage() {
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState([]);
    const [projects, setProjects] = useState([]);
    
    // Filter values
    const [search, setSearch] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedTrade, setSelectedTrade] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // Pagination & sorting
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    const tradeCategories = [
        'Mason', 'Carpenter', 'Electrician', 'Plumber', 'Painter', 
        'Steel Fixer', 'Welder', 'Helper', 'Machine Operator', 
        'Civil Engineer', 'Site Supervisor', 'Surveyor', 
        'Crane Operator', 'Concrete Worker'
    ];

    // Fetch projects list
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
            .catch(() => {});
    }, []);

    // Load filter states from server
    const fetchHistory = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        let url = `/api/v1/attendance?page=${page}&limit=10&sortBy=${sortBy}&sortOrder=${sortOrder}`;
        
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (selectedProject) url += `&project=${selectedProject}`;
        if (selectedStatus) url += `&status=${selectedStatus}`;
        if (selectedTrade) url += `&tradeCategory=${selectedTrade}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        fetch(url, { headers })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Error fetching records');
                return data;
            })
            .then((data) => {
                setRecords(data.records || []);
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
        fetchHistory();
    }, [page, selectedProject, selectedStatus, selectedTrade, sortBy, sortOrder]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchHistory();
    };

    const handleResetFilters = () => {
        setSearch('');
        setSelectedProject('');
        setSelectedStatus('');
        setSelectedTrade('');
        setStartDate('');
        setEndDate('');
        setPage(1);
        // Timeout ensures states update before refetching
        setTimeout(() => fetchHistory(), 100);
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

    const handleExport = () => {
        toast.info('Exporting attendance ledger (CSV format)...');
        // Future ready export CSV builder placeholder
    };

    return (
        <DashboardLayout activePage="Attendance">
            <ToastContainer />

            <div className="db-header" style={{ marginBottom: '20px' }}>
                <div className="db-header-titles">
                    <a href="#/attendance" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                        <FaArrowLeft /> Back to Dashboard
                    </a>
                    <h1>Attendance Logs Ledger</h1>
                    <p>Audit worker check-in history, working hours, and site logs across all active construction projects.</p>
                </div>
            </div>

            {/* Filter Search Section */}
            <div className="attendance-filters-panel" style={{ marginBottom: '24px' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>GLOBAL SEARCH</span>
                            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '6px 12px' }}>
                                <FaSearch style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search worker name or ID..."
                                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px' }}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PROJECT</span>
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
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</span>
                            <select 
                                className="form-input"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                style={{ fontSize: '13px', padding: '8px 12px' }}
                            >
                                <option value="">All Statuses</option>
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                                <option value="Half Day">Half Day</option>
                                <option value="Leave">Leave</option>
                                <option value="Holiday">Holiday</option>
                                <option value="Site Closed">Site Closed</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>TRADE CATEGORY</span>
                            <select 
                                className="form-input"
                                value={selectedTrade}
                                onChange={(e) => setSelectedTrade(e.target.value)}
                                style={{ fontSize: '13px', padding: '8px 12px' }}
                            >
                                <option value="">All Trades</option>
                                {tradeCategories.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
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
                                Reset Filters
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <FaFilter /> Apply Filter
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Logs Table Card */}
            <div className="dashboard-card">
                <div className="card-header-row" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '15px' }}>Attendance Ledger Logs ({totalResults})</h3>
                    <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }} onClick={handleExport}>
                        <FaFileDownload /> Export Logs
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="project-table">
                        <thead>
                            <tr>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('date')}>
                                    Date {sortBy === 'date' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                </th>
                                <th>Worker Name</th>
                                <th>Project Site</th>
                                <th>Status</th>
                                <th>Check-in/Out</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('workingHours')}>
                                    Hours {sortBy === 'workingHours' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                </th>
                                <th>Remarks</th>
                                <th>Recorded By</th>
                            </tr>
                        </thead>
                        {loading ? (
                            <LoadingSkeleton rows={10} cols={8} />
                        ) : records.length === 0 ? (
                            <tbody>
                                <tr>
                                    <td colSpan="8">
                                        <EmptyState 
                                            title="No Ledger Records Found" 
                                            description="Try broadening your date ranges, clearing filters, or resetting terms."
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {records.map((rec) => (
                                    <tr key={rec._id}>
                                        <td>
                                            <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                <FaRegCalendarAlt style={{ color: 'var(--text-muted)' }} />
                                                {new Date(rec.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <a href={`#/attendance/worker/${rec.worker?._id}`} style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
                                                    {rec.worker?.fullName || 'Unknown'}
                                                </a>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                    {rec.worker?.employeeId} | {rec.worker?.tradeCategory}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{rec.project?.projectName || 'Unassigned'}</td>
                                        <td>
                                            <AttendanceStatusChip status={rec.status} />
                                        </td>
                                        <td>
                                            {rec.status === 'Present' || rec.status === 'Half Day' ? (
                                                <span style={{ fontSize: '12px' }}>
                                                    {rec.checkInTime || '--:--'} - {rec.checkOutTime || '--:--'}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>--</span>
                                            )}
                                        </td>
                                        <td>
                                            {rec.status === 'Present' || rec.status === 'Half Day' ? (
                                                <strong>{rec.workingHours} hrs</strong>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>--</span>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                                {rec.remarks || 'No remarks'}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                {rec.recordedBy}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </table>
                </div>

                {/* Pagination Controls Footer */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Showing page {page} of {totalPages} ({totalResults} logs total)
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
