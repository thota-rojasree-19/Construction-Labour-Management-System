import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import LoadingSkeleton from '../../attendance/components/LoadingSkeleton';
import EmptyState from '../../attendance/components/EmptyState';
import { 
    FaArrowLeft, 
    FaSearch, 
    FaFilter, 
    FaEye, 
    FaCheck, 
    FaTrash,
    FaArrowUp,
    FaArrowDown,
    FaChevronLeft,
    FaChevronRight,
    FaMoneyCheckAlt
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/payroll.css';

export default function PayrollListPage() {
    const [loading, setLoading] = useState(true);
    const [payrolls, setPayrolls] = useState([]);
    const [projects, setProjects] = useState([]);
    
    // Filters
    const [search, setSearch] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

    // Pagination & sorting
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Fetch projects dropdown
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

    const fetchPayrolls = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        let url = `/api/v1/payroll?page=${page}&limit=10&sortBy=${sortBy}&sortOrder=${sortOrder}`;
        
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (selectedProject) url += `&project=${selectedProject}`;
        if (selectedStatus) url += `&status=${selectedStatus}`;
        if (selectedMonth) url += `&month=${selectedMonth}`;

        fetch(url, { headers })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to fetch payroll list');
                return data;
            })
            .then((data) => {
                setPayrolls(data.payrolls || []);
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
        fetchPayrolls();
    }, [page, selectedProject, selectedStatus, selectedMonth, sortBy, sortOrder]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchPayrolls();
    };

    const handleResetFilters = () => {
        setSearch('');
        setSelectedProject('');
        setSelectedStatus('');
        setSelectedMonth('');
        setPage(1);
        setTimeout(() => fetchPayrolls(), 100);
    };

    const handleMarkAsPaid = (payrollId) => {
        if (!window.confirm('Are you sure you want to mark this payroll as PAID?')) {
            return;
        }

        const token = localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        fetch(`/api/v1/payroll/${payrollId}/mark-paid`, {
            method: 'PATCH',
            headers
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Operation failed');
            return data;
        })
        .then(() => {
            toast.success('Payroll payout recorded successfully!');
            fetchPayrolls();
        })
        .catch((err) => toast.error(err.message));
    };

    const handleDelete = (payrollId) => {
        if (!window.confirm('Are you sure you want to delete this payroll record? Deducted advances will be released.')) {
            return;
        }

        const token = localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        fetch(`/api/v1/payroll/${payrollId}`, {
            method: 'DELETE',
            headers
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete record');
            return data;
        })
        .then(() => {
            toast.success('Payroll record deleted successfully.');
            fetchPayrolls();
        })
        .catch((err) => toast.error(err.message));
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
        <DashboardLayout activePage="Payroll">
            <ToastContainer />

            <div className="db-header" style={{ marginBottom: '20px' }}>
                <div className="db-header-titles">
                    <a href="#/payroll" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                        <FaArrowLeft /> Back to Dashboard
                    </a>
                    <h1>Payroll Ledger</h1>
                    <p>Audit generated salaries, deduct advance loans, allocate bonuses/penalties, and log disbursement states.</p>
                </div>
            </div>

            {/* Filter Panel */}
            <div className="attendance-filters-panel" style={{ marginBottom: '24px' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>GLOBAL SEARCH</span>
                            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '6px 12px' }}>
                                <FaSearch style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search employee ID or name..."
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
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PAYMENT STATUS</span>
                            <select 
                                className="form-input"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                style={{ fontSize: '13px', padding: '8px 12px' }}
                            >
                                <option value="">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Paid">Paid</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PAYROLL MONTH</span>
                            <input 
                                type="month" 
                                className="form-input"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                style={{ fontSize: '13px', padding: '8px 12px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button type="button" className="btn btn-secondary" onClick={handleResetFilters}>
                            Clear Filters
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <FaFilter /> Search Logs
                        </button>
                    </div>
                </form>
            </div>

            {/* Table layout */}
            <div className="dashboard-card">
                <div className="card-header-row" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '15px' }}>Salary Payroll Ledger ({totalResults})</h3>
                </div>

                <div className="table-responsive">
                    <table className="project-table">
                        <thead>
                            <tr>
                                <th>Payroll Code</th>
                                <th>Worker Details</th>
                                <th>Project</th>
                                <th>Period</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('attendanceDays')}>
                                    Days {sortBy === 'attendanceDays' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                </th>
                                <th>Daily Wage</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('netPayable')}>
                                    Net Payable {sortBy === 'netPayable' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                </th>
                                <th>Status</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('paymentDate')}>
                                    Payment Date {sortBy === 'paymentDate' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                </th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        {loading ? (
                            <LoadingSkeleton rows={10} cols={10} />
                        ) : payrolls.length === 0 ? (
                            <tbody>
                                <tr>
                                    <td colSpan="10">
                                        <EmptyState 
                                            title="No Salary Records Found" 
                                            description="Reset filters or launch the Payroll Generator wizard to compute monthly wages."
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {payrolls.map((pay) => (
                                    <tr key={pay._id}>
                                        <td style={{ fontWeight: 700 }}>{pay.payrollCode}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600 }}>{pay.worker?.fullName || 'Unknown'}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                    {pay.worker?.employeeId} | {pay.worker?.tradeCategory}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{pay.project?.projectName || 'Unassigned'}</td>
                                        <td>
                                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{pay.month}</span>
                                        </td>
                                        <td>{pay.attendanceDays} days</td>
                                        <td>₹{pay.dailyWage}</td>
                                        <td>
                                            <strong style={{ color: 'var(--text-main)' }}>₹{pay.netPayable.toLocaleString('en-IN')}</strong>
                                        </td>
                                        <td>
                                            <span className={`payroll-badge ${pay.paymentStatus.toLowerCase()}`}>
                                                {pay.paymentStatus}
                                            </span>
                                        </td>
                                        <td>
                                            {pay.paymentDate ? (
                                                <span style={{ fontSize: '12px' }}>
                                                    {new Date(pay.paymentDate).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>--</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                <a href={`#/payroll/${pay._id}`} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }} title="View details & payslip">
                                                    <FaEye />
                                                </a>
                                                {pay.paymentStatus !== 'Paid' && (
                                                    <button type="button" className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '12px', backgroundColor: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => handleMarkAsPaid(pay._id)} title="Mark as Paid">
                                                        <FaCheck />
                                                    </button>
                                                )}
                                                <button type="button" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--danger)' }} onClick={() => handleDelete(pay._id)} title="Delete record">
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

                {/* Pagination footer */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Showing page {page} of {totalPages} ({totalResults} payrolls total)
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
