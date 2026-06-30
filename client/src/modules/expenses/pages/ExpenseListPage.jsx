import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import LoadingSkeleton from '../../attendance/components/LoadingSkeleton';
import EmptyState from '../../attendance/components/EmptyState';
import ExpenseCategoryBadge from '../components/ExpenseCategoryBadge';
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
    FaReceipt
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/expenses.css';

export default function ExpenseListPage() {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [projects, setProjects] = useState([]);
    
    // Filters
    const [search, setSearch] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Pagination & sorting
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [sortBy, setSortBy] = useState('expenseDate');
    const [sortOrder, setSortOrder] = useState('desc');

    const categories = [
        'Labour', 'Transport', 'Food', 'Machinery', 'Fuel', 'Materials', 
        'Equipment Rental', 'Safety Equipment', 'Accommodation', 'Utilities', 
        'Maintenance', 'Miscellaneous'
    ];

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

    const fetchExpenses = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        let url = `/api/v1/expenses?page=${page}&limit=10&sortBy=${sortBy}&sortOrder=${sortOrder}`;
        
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (selectedProject) url += `&project=${selectedProject}`;
        if (selectedCategory) url += `&category=${selectedCategory}`;
        if (selectedPaymentMethod) url += `&paymentMethod=${selectedPaymentMethod}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        fetch(url, { headers })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to fetch expenses list');
                return data;
            })
            .then((data) => {
                setExpenses(data.expenses || []);
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
        fetchExpenses();
    }, [page, selectedProject, selectedCategory, selectedPaymentMethod, sortBy, sortOrder]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchExpenses();
    };

    const handleResetFilters = () => {
        setSearch('');
        setSelectedProject('');
        setSelectedCategory('');
        setSelectedPaymentMethod('');
        setStartDate('');
        setEndDate('');
        setPage(1);
        setTimeout(() => fetchExpenses(), 100);
    };

    const handleDelete = (expenseId) => {
        if (!window.confirm('Are you sure you want to delete this expense record? Project budgets will re-adjust.')) {
            return;
        }

        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        fetch(`/api/v1/expenses/${expenseId}`, {
            method: 'DELETE',
            headers
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete record');
            return data;
        })
        .then(() => {
            toast.success('Expense record soft-deleted successfully.');
            fetchExpenses();
        })
        .catch((err) => toast.error(err.message));
    };

    const handleDuplicate = (exp) => {
        // We will navigate to the create form and set localStorage temporary copy parameters
        localStorage.setItem('duplicateExpense', JSON.stringify({
            project: exp.project?._id || '',
            category: exp.category || '',
            expenseTitle: `${exp.expenseTitle} (Copy)`,
            vendor: exp.vendor || '',
            amount: exp.amount || '',
            paymentMethod: exp.paymentMethod || 'Cash',
            description: exp.description || '',
            remarks: exp.remarks || ''
        }));
        window.location.hash = '#/expenses/new';
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
        <DashboardLayout activePage="Expenses">
            <ToastContainer />

            <div className="db-header" style={{ marginBottom: '20px' }}>
                <div className="db-header-titles">
                    <a href="#/expenses" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                        <FaArrowLeft /> Back to Dashboard
                    </a>
                    <h1>Expense Ledger</h1>
                    <p>Audit site costs, project purchases, categorized cash vouchers, and supplier invoices.</p>
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
                                    placeholder="Search vendor or title..."
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
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>CATEGORY</span>
                            <select 
                                className="form-input"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{ fontSize: '13px', padding: '8px 12px' }}
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PAYMENT METHOD</span>
                            <select 
                                className="form-input"
                                value={selectedPaymentMethod}
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                style={{ fontSize: '13px', padding: '8px 12px' }}
                            >
                                <option value="">All Methods</option>
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Card">Card</option>
                                <option value="UPI">UPI</option>
                                <option value="Cheque">Cheque</option>
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
                                <FaFilter /> Apply Filter
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Expenses list card */}
            <div className="dashboard-card">
                <div className="card-header-row" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '15px' }}>Audited Expense Logs ({totalResults})</h3>
                </div>

                <div className="table-responsive">
                    <table className="project-table">
                        <thead>
                            <tr>
                                <th>Expense ID</th>
                                <th>Expense Title</th>
                                <th>Project Site</th>
                                <th>Category</th>
                                <th>Vendor / Supplier</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('amount')}>
                                    Amount {sortBy === 'amount' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('expenseDate')}>
                                    Expense Date {sortBy === 'expenseDate' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                </th>
                                <th>Payment Method</th>
                                <th>Receipt</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        {loading ? (
                            <LoadingSkeleton rows={10} cols={10} />
                        ) : expenses.length === 0 ? (
                            <tbody>
                                <tr>
                                    <td colSpan="10">
                                        <EmptyState 
                                            title="No Financial Records Found"
                                            description="Reset filters or click 'Record New Expense' to log project outflows."
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {expenses.map(exp => (
                                    <tr key={exp._id}>
                                        <td style={{ fontWeight: 700 }}>{exp.expenseCode}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600 }}>{exp.expenseTitle}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{exp.invoiceNumber || 'No Invoice'}</span>
                                            </div>
                                        </td>
                                        <td>{exp.project?.projectName || 'Unassigned'}</td>
                                        <td>
                                            <ExpenseCategoryBadge category={exp.category} />
                                        </td>
                                        <td>{exp.vendor}</td>
                                        <td>
                                            <strong style={{ color: 'var(--text-main)' }}>₹{exp.amount.toLocaleString('en-IN')}</strong>
                                        </td>
                                        <td>
                                            {new Date(exp.expenseDate).toLocaleDateString()}
                                        </td>
                                        <td>{exp.paymentMethod}</td>
                                        <td>
                                            {exp.receiptUrl ? (
                                                <FaReceipt style={{ color: 'var(--success)', fontSize: '18px' }} title="Receipt uploaded" />
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>None</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                <a href={`#/expenses/${exp._id}`} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }} title="View Details">
                                                    <FaEye />
                                                </a>
                                                <a href={`#/expenses/edit/${exp._id}`} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }} title="Edit Expense">
                                                    <FaEdit />
                                                </a>
                                                <button type="button" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }} onClick={() => handleDuplicate(exp)} title="Duplicate Record">
                                                    <FaCopy />
                                                </button>
                                                <button type="button" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--danger)' }} onClick={() => handleDelete(exp._id)} title="Delete record">
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Showing page {page} of {totalPages} ({totalResults} expenses total)
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
