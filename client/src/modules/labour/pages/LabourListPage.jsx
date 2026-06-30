import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import { 
    FaPlus, FaSearch, FaFilter, FaThList, FaThLarge, FaSync, 
    FaEye, FaEdit, FaTrash, FaClipboardCheck, FaHardHat, 
    FaCheckCircle, FaUserClock, FaWallet, FaHourglassHalf,
    FaArrowUp, FaArrowDown, FaChevronLeft, FaChevronRight, FaFolderOpen,
    FaExchangeAlt, FaTimes
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/labour.css';

export default function LabourListPage() {
    // 1. Core listing states
    const [labours, setLabours] = useState([]);
    const [projects, setProjects] = useState([]); // Fetch active projects for assign dropdown
    const [stats, setStats] = useState({
        totalWorkers: 0,
        activeWorkers: 0,
        assignedWorkers: 0,
        unassignedWorkers: 0
    });
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [showFilters, setShowFilters] = useState(false);

    // 2. Filters / Pagination / Sorting
    const [search, setSearch] = useState('');
    const [assignedProject, setAssignedProject] = useState('');
    const [tradeCategory, setTradeCategory] = useState('');
    const [status, setStatus] = useState('');
    const [availability, setAvailability] = useState('');
    const [skillLevel, setSkillLevel] = useState('');
    const [city, setCity] = useState('');
    const [wageMin, setWageMin] = useState('');
    const [wageMax, setWageMax] = useState('');
    const [experienceMin, setExperienceMin] = useState('');
    const [experienceMax, setExperienceMax] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    // 3. Action Modals
    const [deleteModalId, setDeleteModalId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Project Assignment Modal States
    const [assignWorker, setAssignWorker] = useState(null); // holds worker object
    const [assignProjectId, setAssignProjectId] = useState('');
    const [assignSupervisor, setAssignSupervisor] = useState('');
    const [assignShift, setAssignShift] = useState('General');
    const [assignNotes, setAssignNotes] = useState('');
    const [assigning, setAssigning] = useState(false);

    // Fetch labours list
    const fetchLabours = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const params = new URLSearchParams({
            search,
            assignedProject,
            tradeCategory,
            status,
            availability,
            skillLevel,
            city,
            wageMin,
            wageMax,
            experienceMin,
            experienceMax,
            sortBy,
            sortOrder,
            page,
            limit
        });

        fetch(`/api/v1/labours?${params.toString()}`, {
            method: 'GET',
            headers
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to fetch labour records');
            return data;
        })
        .then((data) => {
            setLabours(data.labours);
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

    // Fetch projects for assignment dropdown list
    const fetchProjects = () => {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        fetch('/api/v1/projects?limit=100', {
            method: 'GET',
            headers
        })
        .then(async (res) => {
            const data = await res.json();
            if (res.ok) {
                setProjects(data.projects);
            }
        })
        .catch((err) => {
            console.error('Failed to load projects for dropdown:', err.message);
        });
    };

    useEffect(() => {
        fetchLabours();
    }, [search, assignedProject, tradeCategory, status, availability, skillLevel, city, wageMin, wageMax, experienceMin, experienceMax, sortBy, sortOrder, page, limit]);

    useEffect(() => {
        fetchProjects();
    }, []);

    // Clear filters panel
    const handleResetFilters = () => {
        setSearch('');
        setAssignedProject('');
        setTradeCategory('');
        setStatus('');
        setAvailability('');
        setSkillLevel('');
        setCity('');
        setWageMin('');
        setWageMax('');
        setExperienceMin('');
        setExperienceMax('');
        setSortBy('createdAt');
        setSortOrder('desc');
        setPage(1);
        toast.success('Filters cleared successfully');
    };

    // Soft delete confirmation
    const handleDeleteConfirm = () => {
        if (!deleteModalId) return;
        setDeleting(true);

        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        fetch(`/api/v1/labours/${deleteModalId}`, {
            method: 'DELETE',
            headers
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to delete worker');
            return data;
        })
        .then(() => {
            setDeleting(false);
            setDeleteModalId(null);
            toast.success('Worker deleted successfully');
            fetchLabours();
        })
        .catch((err) => {
            setDeleting(false);
            setDeleteModalId(null);
            toast.error(err.message);
        });
    };

    // Project Reassignment handler
    const handleAssignSubmit = (e) => {
        e.preventDefault();
        if (!assignWorker) return;
        setAssigning(true);

        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        fetch(`/api/v1/labours/${assignWorker._id}/assign-project`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                projectId: assignProjectId || null,
                supervisor: assignSupervisor,
                shift: assignShift,
                notes: assignNotes
            })
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Assignment failed');
            return data;
        })
        .then(() => {
            setAssigning(false);
            setAssignWorker(null);
            toast.success('Project assignment updated successfully!');
            fetchLabours();
        })
        .catch((err) => {
            setAssigning(false);
            toast.error(err.message);
        });
    };

    // Open assign modal and pre-fill current assignment data
    const handleOpenAssignModal = (worker) => {
        setAssignWorker(worker);
        setAssignProjectId(worker.assignedProject ? worker.assignedProject._id : '');
        setAssignSupervisor(worker.supervisor || '');
        setAssignShift(worker.shift || 'General');
        setAssignNotes(worker.notes || '');
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
        <DashboardLayout activePage="Labour">
            <ToastContainer />

            {/* List Header titles */}
            <div className="db-header">
                <div className="db-header-titles">
                    <h1>Workforce Command Center</h1>
                    <p>Track demographics, shift assignments, and daily wages of all construction workers.</p>
                </div>
                <div>
                    <a href="#/labour/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', textDecoration: 'none' }}>
                        <FaPlus /> Register Labour
                    </a>
                </div>
            </div>

            {/* Overall stats widgets */}
            <div className="workforce-stats">
                <div className="proj-stat-card">
                    <span className="proj-stat-title"><FaHardHat style={{ color: '#F97316', marginRight: '4px' }} /> Total Labour Force</span>
                    <span className="proj-stat-value">{stats.totalWorkers}</span>
                </div>
                <div className="proj-stat-card">
                    <span className="proj-stat-title"><FaCheckCircle style={{ color: '#22C55E', marginRight: '4px' }} /> Active Workers</span>
                    <span className="proj-stat-value">{stats.activeWorkers}</span>
                </div>
                <div className="proj-stat-card">
                    <span className="proj-stat-title"><FaUserClock style={{ color: '#2563EB', marginRight: '4px' }} /> Assigned Workers</span>
                    <span className="proj-stat-value">{stats.assignedWorkers}</span>
                </div>
                <div className="proj-stat-card">
                    <span className="proj-stat-title"><FaHourglassHalf style={{ color: '#F59E0B', marginRight: '4px' }} /> Unassigned</span>
                    <span className="proj-stat-value">{stats.unassignedWorkers}</span>
                </div>
                <div className="proj-stat-card" style={{ opacity: 0.8 }}>
                    <span className="proj-stat-title"><FaClipboardCheck style={{ color: '#64748B', marginRight: '4px' }} /> Present Today</span>
                    <span className="proj-stat-value" style={{ color: 'var(--text-muted)' }}>412</span>
                </div>
                <div className="proj-stat-card" style={{ opacity: 0.8 }}>
                    <span className="proj-stat-title"><FaWallet style={{ color: '#EF4444', marginRight: '4px' }} /> Monthly Estimates</span>
                    <span className="proj-stat-value" style={{ color: 'var(--text-muted)' }}>₹4.2L</span>
                </div>
            </div>

            {/* Filter controls row bar */}
            <div className="proj-controls-row">
                <div className="proj-controls-left">
                    <div className="db-search-box" style={{ flex: 1, minWidth: '200px' }}>
                        <FaSearch style={{ color: '#64748B' }} />
                        <input 
                            type="text" 
                            placeholder="Search name, employee ID, phone, trade..." 
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
                    <button className="view-toggle-btn" onClick={fetchLabours} title="Refresh Table">
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

            {/* Advanced Filters Panel Grid */}
            {showFilters && (
                <div className="filter-panel">
                    <div className="filter-group">
                        <label>Status</label>
                        <select className="filter-input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                            <option value="">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                            <option value="Left">Left</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Trade Category</label>
                        <select className="filter-input" value={tradeCategory} onChange={(e) => { setTradeCategory(e.target.value); setPage(1); }}>
                            <option value="">All Trades</option>
                            <option value="Mason">Mason</option>
                            <option value="Carpenter">Carpenter</option>
                            <option value="Electrician">Electrician</option>
                            <option value="Plumber">Plumber</option>
                            <option value="Painter">Painter</option>
                            <option value="Steel Fixer">Steel Fixer</option>
                            <option value="Welder">Welder</option>
                            <option value="Helper">Helper</option>
                            <option value="Machine Operator">Machine Operator</option>
                            <option value="Civil Engineer">Civil Engineer</option>
                            <option value="Site Supervisor">Site Supervisor</option>
                            <option value="Surveyor">Surveyor</option>
                            <option value="Crane Operator">Crane Operator</option>
                            <option value="Concrete Worker">Concrete Worker</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Skill Level</label>
                        <select className="filter-input" value={skillLevel} onChange={(e) => { setSkillLevel(e.target.value); setPage(1); }}>
                            <option value="">All Skill Levels</option>
                            <option value="Unskilled">Unskilled</option>
                            <option value="Semi-skilled">Semi-skilled</option>
                            <option value="Skilled">Skilled</option>
                            <option value="Highly-skilled">Highly-skilled</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Availability</label>
                        <select className="filter-input" value={availability} onChange={(e) => { setAvailability(e.target.value); setPage(1); }}>
                            <option value="">All Availability</option>
                            <option value="true">Available (Unassigned)</option>
                            <option value="false">Occupied (Assigned)</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Project Site</label>
                        <select className="filter-input" value={assignedProject} onChange={(e) => { setAssignedProject(e.target.value); setPage(1); }}>
                            <option value="">All Projects</option>
                            <option value="unassigned">Unassigned</option>
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.projectName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>City Location</label>
                        <input type="text" className="filter-input" placeholder="e.g. Mumbai" value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }} />
                    </div>
                    <div className="filter-group" style={{ gridColumn: 'span 2', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label>Wage Min (₹)</label>
                            <input type="number" className="filter-input" style={{ width: '100%' }} value={wageMin} onChange={(e) => { setWageMin(e.target.value); setPage(1); }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Wage Max (₹)</label>
                            <input type="number" className="filter-input" style={{ width: '100%' }} value={wageMax} onChange={(e) => { setWageMax(e.target.value); setPage(1); }} />
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '9px 16px', fontSize: '13px' }} onClick={handleResetFilters}>
                            Reset
                        </button>
                    </div>
                </div>
            )}

            {/* Main Listing Output Grid */}
            {loading ? (
                <div className="dashboard-card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner-icon" style={{ borderColor: 'var(--primary) transparent var(--primary) transparent', width: '40px', height: '40px' }}></div>
                    <span style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Retrieving workforce profiles...</span>
                </div>
            ) : labours.length === 0 ? (
                <div className="dashboard-card" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <FaFolderOpen style={{ fontSize: '56px', color: 'var(--border-color)' }} />
                    <h3 style={{ color: 'var(--text-main)', margin: 0 }}>No Labours Registered</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: '400px' }}>
                        There are no registered worker profiles matching your parameters.
                    </p>
                    <a href="#/labour/new" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', textDecoration: 'none' }}>
                        Register Labour
                    </a>
                </div>
            ) : viewMode === 'table' ? (
                // 1. Data Table View
                <div className="dashboard-card" style={{ marginBottom: '24px', padding: 0, overflow: 'hidden' }}>
                    <div className="table-responsive">
                        <table className="project-table">
                            <thead>
                                <tr>
                                    <th>Photo</th>
                                    <th onClick={() => handleSort('employeeId')} style={{ cursor: 'pointer' }}>ID {sortBy === 'employeeId' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}</th>
                                    <th onClick={() => handleSort('fullName')} style={{ cursor: 'pointer' }}>Full Name {sortBy === 'fullName' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}</th>
                                    <th>Mobile</th>
                                    <th onClick={() => handleSort('tradeCategory')} style={{ cursor: 'pointer' }}>Trade Category {sortBy === 'tradeCategory' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}</th>
                                    <th>Assigned Site</th>
                                    <th onClick={() => handleSort('dailyWage')} style={{ cursor: 'pointer' }}>Daily Wage {sortBy === 'dailyWage' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}</th>
                                    <th onClick={() => handleSort('experience')} style={{ cursor: 'pointer' }}>Exp {sortBy === 'experience' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}</th>
                                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status {sortBy === 'status' && (sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}</th>
                                    <th>Availability</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {labours.map((worker) => {
                                    const tradeNormalized = worker.tradeCategory.toLowerCase().replace(/\s+/g, '');
                                    const avatarText = `${worker.firstName.charAt(0)}${worker.lastName ? worker.lastName.charAt(0) : ''}`;
                                    
                                    let statusClass = 'status-badge';
                                    if (worker.status === 'Active') statusClass += ' active';
                                    else if (worker.status === 'Inactive') statusClass += ' inactive';
                                    else if (worker.status === 'Suspended') statusClass += ' suspended';
                                    else if (worker.status === 'Left') statusClass += ' left';

                                    return (
                                        <tr key={worker._id}>
                                            <td>
                                                {worker.photo ? (
                                                    <img src={worker.photo} className="labor-card-avatar" style={{ width: '36px', height: '36px' }} alt="Avatar" />
                                                ) : (
                                                    <div className="labor-card-avatar" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px' }}>
                                                        {avatarText}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{worker.employeeId}</td>
                                            <td>
                                                <div className="project-info">
                                                    <span className="project-name">{worker.fullName}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{worker.skillLevel}</span>
                                                </div>
                                            </td>
                                            <td>{worker.mobileNumber}</td>
                                            <td>
                                                <span className={`trade-badge ${tradeNormalized}`}>{worker.tradeCategory}</span>
                                            </td>
                                            <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {worker.assignedProject ? (
                                                    <a href={`#/projects/${worker.assignedProject._id}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                                                        {worker.assignedProject.projectName}
                                                    </a>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                                                )}
                                            </td>
                                            <td style={{ fontWeight: 600 }}>₹{worker.dailyWage}</td>
                                            <td>{worker.experience} yrs</td>
                                            <td><span className={statusClass}>{worker.status}</span></td>
                                            <td>
                                                <span className={`avail-chip ${worker.availability ? 'yes' : 'no'}`}>
                                                    {worker.availability ? '🟢 Available' : '⚪ Busy'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                                                    <a href={`#/labour/${worker._id}`} className="view-toggle-btn" style={{ padding: '6px' }} title="View profile">
                                                        <FaEye />
                                                    </a>
                                                    <a href={`#/labour/edit/${worker._id}`} className="view-toggle-btn" style={{ padding: '6px' }} title="Edit profile">
                                                        <FaEdit />
                                                    </a>
                                                    <button className="view-toggle-btn" style={{ padding: '6px' }} onClick={() => handleOpenAssignModal(worker)} title="Assign to project site">
                                                        <FaExchangeAlt />
                                                    </button>
                                                    <button className="view-toggle-btn" style={{ padding: '6px', color: 'var(--danger)' }} onClick={() => setDeleteModalId(worker._id)} title="Delete profile">
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
                // 2. Card View Layout
                <div className="proj-cards-grid">
                    {labours.map((worker) => {
                        const tradeNormalized = worker.tradeCategory.toLowerCase().replace(/\s+/g, '');
                        const avatarText = `${worker.firstName.charAt(0)}${worker.lastName ? worker.lastName.charAt(0) : ''}`;
                        
                        let statusClass = 'status-badge';
                        if (worker.status === 'Active') statusClass += ' active';
                        else if (worker.status === 'Inactive') statusClass += ' inactive';
                        else if (worker.status === 'Suspended') statusClass += ' suspended';
                        else if (worker.status === 'Left') statusClass += ' left';

                        return (
                            <div key={worker._id} className="project-card-item">
                                <div className="labor-card-header">
                                    {worker.photo ? (
                                        <img src={worker.photo} className="labor-card-avatar" alt="Worker profile" />
                                    ) : (
                                        <div className="labor-card-avatar" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '16px' }}>
                                            {avatarText}
                                        </div>
                                    )}
                                    <div className="labor-card-titles" style={{ flex: 1 }}>
                                        <h3 className="labor-card-title">{worker.fullName}</h3>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{worker.employeeId}</span>
                                    </div>
                                    <span className={`trade-badge ${tradeNormalized}`}>{worker.tradeCategory}</span>
                                </div>

                                <div className="project-card-body" style={{ margin: 0 }}>
                                    <div className="project-card-meta-row">
                                        <span>Skill Level</span>
                                        <span className="skill-badge" style={{ padding: '2px 6px', fontSize: '11px' }}>{worker.skillLevel}</span>
                                    </div>
                                    <div className="project-card-meta-row">
                                        <span>Daily Wage</span>
                                        <strong>₹{worker.dailyWage}</strong>
                                    </div>
                                    <div className="project-card-meta-row">
                                        <span>Mobile</span>
                                        <strong>{worker.mobileNumber}</strong>
                                    </div>
                                    <div className="project-card-meta-row" style={{ minHeight: '36px' }}>
                                        <span>Project Site</span>
                                        <strong style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {worker.assignedProject ? worker.assignedProject.projectName : 'Unassigned'}
                                        </strong>
                                    </div>
                                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span className={`avail-chip ${worker.availability ? 'yes' : 'no'}`}>
                                            {worker.availability ? '🟢 Available' : '⚪ Assigned'}
                                        </span>
                                        <span className={statusClass}>{worker.status}</span>
                                    </div>
                                </div>

                                <div className="project-card-actions" style={{ marginTop: '16px' }}>
                                    <a href={`#/labour/${worker._id}`} className="view-toggle-btn" style={{ flex: 1, justifyContent: 'center' }}>
                                        <FaEye /> View
                                    </a>
                                    <a href={`#/labour/edit/${worker._id}`} className="view-toggle-btn" style={{ flex: 1, justifyContent: 'center' }}>
                                        <FaEdit /> Edit
                                    </a>
                                    <button className="view-toggle-btn" style={{ padding: '8px' }} onClick={() => handleOpenAssignModal(worker)} title="Assign Project">
                                        <FaExchangeAlt />
                                    </button>
                                    <button className="view-toggle-btn" style={{ padding: '8px', color: 'var(--danger)' }} onClick={() => setDeleteModalId(worker._id)} title="Delete">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && labours.length > 0 && (
                <div className="db-pagination-row">
                    <div className="pag-info-text">
                        Showing <strong>{((page - 1) * limit) + 1}</strong> to <strong>{Math.min(page * limit, totalResults)}</strong> of <strong>{totalResults}</strong> workers
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

            {/* Project Reassignment Modal */}
            {assignWorker && (
                <div className="modal-overlay">
                    <div className="confirm-modal-card" style={{ maxWidth: '480px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '16px' }}>Project Allocation</h3>
                            <button className="view-toggle-btn" style={{ padding: '4px' }} onClick={() => setAssignWorker(null)}><FaTimes /></button>
                        </div>
                        
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
                            Allocate <strong>{assignWorker.fullName}</strong> ({assignWorker.tradeCategory}) to an active construction site. Unassigning will mark them available.
                        </p>

                        <form onSubmit={handleAssignSubmit} className="assign-modal-form">
                            <div className="filter-group">
                                <label>Construction Project Site</label>
                                <select className="filter-input" value={assignProjectId} onChange={(e) => setAssignProjectId(e.target.value)} disabled={assigning}>
                                    <option value="">-- Unassigned (Mark Available) --</option>
                                    {projects.map(p => (
                                        <option key={p._id} value={p._id}>{p.projectName} ({p.projectCode})</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="filter-group">
                                <label>Assigned Site Supervisor</label>
                                <input 
                                    type="text" 
                                    className="filter-input" 
                                    placeholder="e.g. Sunil Yadav"
                                    value={assignSupervisor}
                                    onChange={(e) => setAssignSupervisor(e.target.value)}
                                    disabled={assigning}
                                />
                            </div>

                            <div className="form-grid-2col" style={{ gap: '12px' }}>
                                <div className="filter-group">
                                    <label>Work Shift</label>
                                    <select className="filter-input" value={assignShift} onChange={(e) => setAssignShift(e.target.value)} disabled={assigning}>
                                        <option value="General">General</option>
                                        <option value="Day">Day</option>
                                        <option value="Night">Night</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Daily Work Wage (₹)</label>
                                    <input 
                                        type="text" 
                                        className="filter-input" 
                                        value={assignWorker.dailyWage} 
                                        disabled 
                                        style={{ opacity: 0.7 }}
                                    />
                                </div>
                            </div>

                            <div className="filter-group">
                                <label>Assignment Notes</label>
                                <textarea 
                                    className="filter-input" 
                                    rows="2" 
                                    placeholder="Scaffolding work on column reinforcement, shift logs, etc..."
                                    value={assignNotes}
                                    onChange={(e) => setAssignNotes(e.target.value)}
                                    disabled={assigning}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div className="confirm-modal-buttons" style={{ justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setAssignWorker(null)} disabled={assigning}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={assigning}>
                                    {assigning ? 'Allocating...' : 'Confirm Assignment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalId && (
                <div className="modal-overlay">
                    <div className="confirm-modal-card">
                        <FaTrash className="confirm-modal-icon" />
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Delete Worker Profile?</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                            Are you sure you want to remove this labor force record? 
                            This action soft-deletes the worker profile from the active records list.
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
