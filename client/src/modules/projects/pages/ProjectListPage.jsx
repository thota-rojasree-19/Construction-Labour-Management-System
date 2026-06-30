import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import { 
    FaPlus, FaSearch, FaFilter, FaThList, FaThLarge, FaSync, 
    FaEye, FaEdit, FaTrash, FaCopy, FaBriefcase, FaHardHat, 
    FaCheckCircle, FaHourglassHalf, FaWallet, FaChartLine,
    FaArrowUp, FaArrowDown, FaChevronLeft, FaChevronRight, FaFolderOpen
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/projects.css';

export default function ProjectListPage() {
    // 1. Core States
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        planningProjects: 0,
        totalBudget: 0,
        averageProgress: 0
    });
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [showFilters, setShowFilters] = useState(false);

    // 2. Filter / Pagination / Sort States
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [projectManager, setProjectManager] = useState('');
    const [projectType, setProjectType] = useState('');
    const [city, setCity] = useState('');
    const [budgetMin, setBudgetMin] = useState('');
    const [budgetMax, setBudgetMax] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    // 3. Action Modals
    const [deleteModalId, setDeleteModalId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch projects from backend protected endpoint
    const fetchProjects = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Build query string
        const params = new URLSearchParams({
            search,
            status,
            projectManager,
            projectType,
            city,
            budgetMin,
            budgetMax,
            sortBy,
            sortOrder,
            page,
            limit
        });

        fetch(`/api/v1/projects?${params.toString()}`, {
            method: 'GET',
            headers
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to fetch projects');
            return data;
        })
        .then((data) => {
            setProjects(data.projects);
            setTotalPages(data.pagination.totalPages);
            setTotalResults(data.pagination.totalResults);
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

    useEffect(() => {
        fetchProjects();
    }, [search, status, projectManager, projectType, city, budgetMin, budgetMax, sortBy, sortOrder, page, limit]);

    // Handle Reset Filter panel
    const handleResetFilters = () => {
        setSearch('');
        setStatus('');
        setProjectManager('');
        setProjectType('');
        setCity('');
        setBudgetMin('');
        setBudgetMax('');
        setSortBy('createdAt');
        setSortOrder('desc');
        setPage(1);
        toast.success('Filters cleared successfully');
    };

    // Soft delete action handler
    const handleDeleteConfirm = () => {
        if (!deleteModalId) return;
        setDeleting(true);
        
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        fetch(`/api/v1/projects/${deleteModalId}`, {
            method: 'DELETE',
            headers
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete project');
            return data;
        })
        .then(() => {
            setDeleting(false);
            setDeleteModalId(null);
            toast.success('Project deleted successfully');
            fetchProjects();
        })
        .catch((err) => {
            setDeleting(false);
            setDeleteModalId(null);
            toast.error(err.message);
        });
    };

    // Duplicate project logic
    const handleDuplicateProject = (proj) => {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const duplicatePayload = {
            projectName: `${proj.projectName} (Copy)`,
            description: proj.description,
            projectType: proj.projectType,
            clientName: proj.clientName,
            clientEmail: proj.clientEmail,
            clientContact: proj.clientContact,
            address: proj.address,
            city: proj.city,
            state: proj.state,
            country: proj.country,
            pincode: proj.pincode,
            budget: proj.budget,
            currency: proj.currency,
            projectManager: proj.projectManager,
            siteEngineer: proj.siteEngineer,
            supervisor: proj.supervisor,
            startDate: new Date(proj.startDate).toISOString().split('T')[0],
            expectedEndDate: new Date(proj.expectedEndDate).toISOString().split('T')[0],
            status: 'Planning', // default duplicated state
            progress: 0 // reset progress
        };

        fetch('/api/v1/projects', {
            method: 'POST',
            headers,
            body: JSON.stringify(duplicatePayload)
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to duplicate project');
            return data;
        })
        .then(() => {
            toast.success('Project duplicated successfully as Draft!');
            fetchProjects();
        })
        .catch((err) => {
            toast.error(err.message);
        });
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
        setPage(1);
    };

    return (
        <DashboardLayout activePage="Projects">
            <ToastContainer />

            {/* List Header Page Details */}
            <div className="db-header">
                <div className="db-header-titles">
                    <h1>Projects Command Center</h1>
                    <p>Manage, allocate labor, and monitor budget lifecycles of all your contract locations.</p>
                </div>
                <div>
                    <a href="#/projects/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', textDecoration: 'none' }}>
                        <FaPlus /> Create Project
                    </a>
                </div>
            </div>

            {/* Overall Statistics widgets */}
            <div className="proj-stats-grid">
                <div className="proj-stat-card">
                    <span className="proj-stat-title"><FaBriefcase style={{ color: '#F97316', marginRight: '4px' }} /> Total Projects</span>
                    <span className="proj-stat-value">{stats.totalProjects}</span>
                </div>
                <div className="proj-stat-card">
                    <span className="proj-stat-title"><FaHardHat style={{ color: '#2563EB', marginRight: '4px' }} /> Active Sites</span>
                    <span className="proj-stat-value">{stats.activeProjects}</span>
                </div>
                <div className="proj-stat-card">
                    <span className="proj-stat-title"><FaCheckCircle style={{ color: '#22C55E', marginRight: '4px' }} /> Completed</span>
                    <span className="proj-stat-value">{stats.completedProjects}</span>
                </div>
                <div className="proj-stat-card">
                    <span className="proj-stat-title"><FaHourglassHalf style={{ color: '#F59E0B', marginRight: '4px' }} /> In Planning</span>
                    <span className="proj-stat-value">{stats.planningProjects}</span>
                </div>
                <div className="proj-stat-card">
                    <span className="proj-stat-title"><FaWallet style={{ color: '#EF4444', marginRight: '4px' }} /> Total Budget</span>
                    <span className="proj-stat-value">₹{(stats.totalBudget / 10000000).toFixed(2)} Cr</span>
                </div>
                <div className="proj-stat-card">
                    <span className="proj-stat-title"><FaChartLine style={{ color: '#10B981', marginRight: '4px' }} /> Avg. Progress</span>
                    <span className="proj-stat-value">{stats.averageProgress}%</span>
                </div>
            </div>

            {/* Filter controls row bar */}
            <div className="proj-controls-row">
                <div className="proj-controls-left">
                    <div className="db-search-box" style={{ flex: 1, minWidth: '200px' }}>
                        <FaSearch style={{ color: '#64748B' }} />
                        <input 
                            type="text" 
                            placeholder="Search name, code, manager, client..." 
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <button 
                        className={`view-toggle-btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FaFilter /> Filters
                    </button>
                </div>
                
                <div className="proj-controls-right">
                    <button className="view-toggle-btn" onClick={fetchProjects} title="Refresh Table">
                        <FaSync />
                    </button>
                    <div style={{ borderLeft: '1px solid var(--border-color)', height: '24px', margin: '0 6px' }}></div>
                    <button 
                        className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}
                    >
                        <FaThList /> List
                    </button>
                    <button 
                        className={`view-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
                        onClick={() => setViewMode('card')}
                    >
                        <FaThLarge /> Cards
                    </button>
                </div>
            </div>

            {/* Advanced Filters Drawer Drawer Panel */}
            {showFilters && (
                <div className="filter-panel">
                    <div className="filter-group">
                        <label>Status</label>
                        <select className="filter-input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                            <option value="">All Statuses</option>
                            <option value="Planning">Planning</option>
                            <option value="Active">Active</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Project Type</label>
                        <select className="filter-input" value={projectType} onChange={(e) => { setProjectType(e.target.value); setPage(1); }}>
                            <option value="">All Types</option>
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Industrial">Industrial</option>
                            <option value="Roadwork">Roadwork</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Project Manager</label>
                        <input 
                            type="text" 
                            className="filter-input" 
                            placeholder="e.g. Ramesh Sharma" 
                            value={projectManager} 
                            onChange={(e) => { setProjectManager(e.target.value); setPage(1); }} 
                        />
                    </div>
                    <div className="filter-group">
                        <label>City / Location</label>
                        <input 
                            type="text" 
                            className="filter-input" 
                            placeholder="e.g. Mumbai" 
                            value={city} 
                            onChange={(e) => { setCity(e.target.value); setPage(1); }} 
                        />
                    </div>
                    <div className="filter-group" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label>Budget Min (₹)</label>
                            <input type="number" className="filter-input" style={{ width: '100%' }} value={budgetMin} onChange={(e) => { setBudgetMin(e.target.value); setPage(1); }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Budget Max (₹)</label>
                            <input type="number" className="filter-input" style={{ width: '100%' }} value={budgetMax} onChange={(e) => { setBudgetMax(e.target.value); setPage(1); }} />
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '9px 16px', fontSize: '13px' }} onClick={handleResetFilters}>
                            Reset
                        </button>
                    </div>
                </div>
            )}

            {/* Loader / Content Display */}
            {loading ? (
                <div className="dashboard-card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner-icon" style={{ borderColor: 'var(--primary) transparent var(--primary) transparent', width: '40px', height: '40px' }}></div>
                    <span style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Retrieving projects...</span>
                </div>
            ) : projects.length === 0 ? (
                <div className="dashboard-card" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <FaFolderOpen style={{ fontSize: '56px', color: 'var(--border-color)' }} />
                    <h3 style={{ color: 'var(--text-main)', margin: 0 }}>No Projects Found</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: '400px' }}>
                        We couldn't find any construction projects matching your search parameters. 
                        Try adjusting your filters or create a new project.
                    </p>
                    <a href="#/projects/new" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', textDecoration: 'none' }}>
                        Create Project
                    </a>
                </div>
            ) : viewMode === 'table' ? (
                // 1. Data Table View
                <div className="dashboard-card" style={{ marginBottom: '24px', padding: 0, overflow: 'hidden' }}>
                    <div className="table-responsive">
                        <table className="project-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('projectCode')} style={{ cursor: 'pointer' }}>Code {sortBy === 'projectCode' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}</th>
                                    <th onClick={() => handleSort('projectName')} style={{ cursor: 'pointer' }}>Project Name {sortBy === 'projectName' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}</th>
                                    <th onClick={() => handleSort('projectManager')} style={{ cursor: 'pointer' }}>Manager {sortBy === 'projectManager' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}</th>
                                    <th>Client</th>
                                    <th>Location</th>
                                    <th onClick={() => handleSort('budget')} style={{ cursor: 'pointer' }}>Budget {sortBy === 'budget' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}</th>
                                    <th onClick={() => handleSort('startDate')} style={{ cursor: 'pointer' }}>Start Date {sortBy === 'startDate' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}</th>
                                    <th onClick={() => handleSort('progress')} style={{ cursor: 'pointer' }}>Progress {sortBy === 'progress' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}</th>
                                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status {sortBy === 'status' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((proj) => {
                                    let statusClass = 'badge';
                                    if (proj.status === 'Active') statusClass += ' active';
                                    else if (proj.status === 'Planning') statusClass += ' planning';
                                    else if (proj.status === 'Completed') statusClass += ' completed';
                                    else if (proj.status === 'Delayed' || proj.status === 'Cancelled') statusClass += ' delayed';

                                    let progressColor = 'var(--primary)';
                                    if (proj.status === 'Cancelled') progressColor = 'var(--danger)';
                                    else if (proj.status === 'Completed') progressColor = 'var(--success)';
                                    else if (proj.status === 'Planning') progressColor = 'var(--accent)';

                                    return (
                                        <tr key={proj._id}>
                                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{proj.projectCode}</td>
                                            <td>
                                                <div className="project-info">
                                                    <span className="project-name">{proj.projectName}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{proj.projectType}</span>
                                                </div>
                                            </td>
                                            <td>{proj.projectManager}</td>
                                            <td>{proj.clientName}</td>
                                            <td>{proj.city}, {proj.state}</td>
                                            <td style={{ fontWeight: 600 }}>₹{proj.budget.toLocaleString()}</td>
                                            <td>{new Date(proj.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td>
                                                <div className="progress-bar-container">
                                                    <div className="progress-bar-bg">
                                                        <div 
                                                            className="progress-bar-fill" 
                                                            style={{ 
                                                                width: `${proj.progress}%`,
                                                                backgroundColor: progressColor
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="progress-bar-text">{proj.progress}%</span>
                                                </div>
                                            </td>
                                            <td><span className={statusClass}>{proj.status}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                    <a href={`#/projects/${proj._id}`} className="view-toggle-btn" style={{ padding: '6px' }} title="View details">
                                                        <FaEye />
                                                    </a>
                                                    <a href={`#/projects/edit/${proj._id}`} className="view-toggle-btn" style={{ padding: '6px' }} title="Edit">
                                                        <FaEdit />
                                                    </a>
                                                    <button className="view-toggle-btn" style={{ padding: '6px' }} onClick={() => handleDuplicateProject(proj)} title="Duplicate">
                                                        <FaCopy />
                                                    </button>
                                                    <button className="view-toggle-btn" style={{ padding: '6px', color: 'var(--danger)' }} onClick={() => setDeleteModalId(proj._id)} title="Delete">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                // 2. Project Card View
                <div className="proj-cards-grid">
                    {projects.map((proj) => {
                        let statusClass = 'badge';
                        if (proj.status === 'Active') statusClass += ' active';
                        else if (proj.status === 'Planning') statusClass += ' planning';
                        else if (proj.status === 'Completed') statusClass += ' completed';
                        else if (proj.status === 'Cancelled') statusClass += ' delayed';

                        let progressColor = 'var(--primary)';
                        if (proj.status === 'Cancelled') progressColor = 'var(--danger)';
                        else if (proj.status === 'Completed') progressColor = 'var(--success)';
                        else if (proj.status === 'Planning') progressColor = 'var(--accent)';

                        return (
                            <div key={proj._id} className="project-card-item">
                                <div className="project-card-header">
                                    <div>
                                        <h3 className="project-card-title">{proj.projectName}</h3>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{proj.projectType}</span>
                                    </div>
                                    <span className="project-card-code">{proj.projectCode}</span>
                                </div>

                                <div className="project-card-body">
                                    <div className="project-card-meta-row">
                                        <span>Manager</span>
                                        <strong>{proj.projectManager}</strong>
                                    </div>
                                    <div className="project-card-meta-row">
                                        <span>Client</span>
                                        <strong>{proj.clientName}</strong>
                                    </div>
                                    <div className="project-card-meta-row">
                                        <span>Location</span>
                                        <strong>{proj.city}, {proj.state}</strong>
                                    </div>
                                    <div className="project-card-meta-row">
                                        <span>Budget</span>
                                        <strong>₹{proj.budget.toLocaleString()}</strong>
                                    </div>
                                    <div className="project-card-meta-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                            <span>Progress</span>
                                            <span style={{ fontWeight: 600 }}>{proj.progress}%</span>
                                        </div>
                                        <div className="progress-bar-bg" style={{ width: '100%' }}>
                                            <div 
                                                className="progress-bar-fill" 
                                                style={{ 
                                                    width: `${proj.progress}%`,
                                                    backgroundColor: progressColor
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                            Start: {new Date(proj.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                        </span>
                                        <span className={statusClass}>{proj.status}</span>
                                    </div>
                                </div>

                                <div className="project-card-actions">
                                    <a href={`#/projects/${proj._id}`} className="view-toggle-btn" style={{ flex: 1, justifyContent: 'center' }}>
                                        <FaEye /> View
                                    </a>
                                    <a href={`#/projects/edit/${proj._id}`} className="view-toggle-btn" style={{ flex: 1, justifyContent: 'center' }}>
                                        <FaEdit /> Edit
                                    </a>
                                    <button className="view-toggle-btn" style={{ padding: '8px' }} onClick={() => handleDuplicateProject(proj)} title="Duplicate">
                                        <FaCopy />
                                    </button>
                                    <button className="view-toggle-btn" style={{ padding: '8px', color: 'var(--danger)' }} onClick={() => setDeleteModalId(proj._id)} title="Delete">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination details controls row */}
            {!loading && projects.length > 0 && (
                <div className="db-pagination-row">
                    <div className="pag-info-text">
                        Showing <strong>{((page - 1) * limit) + 1}</strong> to <strong>{Math.min(page * limit, totalResults)}</strong> of <strong>{totalResults}</strong> sites
                    </div>
                    
                    <div className="pag-controls">
                        <span className="pag-info-text" style={{ marginRight: '8px' }}>Rows per page:</span>
                        <select 
                            className="filter-input" 
                            style={{ padding: '4px 8px', fontSize: '12px', marginRight: '16px' }}
                            value={limit}
                            onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>

                        <button 
                            className="pag-btn" 
                            disabled={page === 1}
                            onClick={() => setPage(prev => prev - 1)}
                        >
                            <FaChevronLeft /> Prev
                        </button>
                        <span className="pag-info-text" style={{ margin: '0 8px' }}>Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
                        <button 
                            className="pag-btn" 
                            disabled={page === totalPages}
                            onClick={() => setPage(prev => prev + 1)}
                        >
                            Next <FaChevronRight />
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalId && (
                <div className="modal-overlay">
                    <div className="confirm-modal-card">
                        <FaTrash className="confirm-modal-icon" />
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Delete Project?</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                            Are you sure you want to delete this construction site? 
                            This action soft-deletes the project from the list but can be recovered by an administrator.
                        </p>
                        <div className="confirm-modal-buttons">
                            <button className="btn btn-secondary" style={{ padding: '8px 20px' }} onClick={() => setDeleteModalId(null)} disabled={deleting}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" style={{ padding: '8px 20px', backgroundColor: 'var(--danger)' }} onClick={handleDeleteConfirm} disabled={deleting}>
                                {deleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
