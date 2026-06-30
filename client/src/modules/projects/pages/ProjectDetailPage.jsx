import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import { 
    FaArrowLeft, FaEdit, FaMapMarkerAlt, FaCalendarAlt, FaUser, 
    FaCoins, FaTasks, FaHardHat, FaClipboardCheck, FaFileAlt, 
    FaCheckCircle, FaExclamationTriangle, FaListAlt, FaCalendarCheck
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/projects.css';

export default function ProjectDetailPage({ projectId }) {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {
        if (projectId) {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            fetch(`/api/v1/projects/${projectId}`, {
                method: 'GET',
                headers
            })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to retrieve project details');
                return data;
            })
            .then((data) => {
                setProject(data);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                toast.error(err.message);
            });
        }
    }, [projectId]);

    if (loading) {
        return (
            <DashboardLayout activePage="Projects">
                <div className="dashboard-card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner-icon" style={{ borderColor: 'var(--primary) transparent var(--primary) transparent', width: '32px', height: '32px' }}></div>
                    <span style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Retrieving project details...</span>
                </div>
            </DashboardLayout>
        );
    }

    if (!project) {
        return (
            <DashboardLayout activePage="Projects">
                <div className="dashboard-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <h3>Project Details Error</h3>
                    <p style={{ color: 'var(--text-muted)' }}>We couldn't load the details for this project. Please return to list.</p>
                    <a href="#/projects" className="btn btn-secondary">Back to List</a>
                </div>
            </DashboardLayout>
        );
    }

    let statusClass = 'badge';
    if (project.status === 'Active') statusClass += ' active';
    else if (project.status === 'Planning') statusClass += ' planning';
    else if (project.status === 'Completed') statusClass += ' completed';
    else if (project.status === 'Delayed' || project.status === 'Cancelled') statusClass += ' delayed';

    let progressColor = 'var(--primary)';
    if (project.status === 'Cancelled') progressColor = 'var(--danger)';
    else if (project.status === 'Completed') progressColor = 'var(--success)';
    else if (project.status === 'Planning') progressColor = 'var(--accent)';

    // Compute remaining days
    const daysRemaining = Math.max(0, Math.ceil((new Date(project.expectedEndDate) - new Date()) / (1000 * 60 * 60 * 24)));

    return (
        <DashboardLayout activePage="Projects">
            <ToastContainer />

            {/* Back action title header */}
            <div className="db-header" style={{ marginBottom: '16px' }}>
                <a href="#/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                    <FaArrowLeft /> Back to Project List
                </a>
            </div>

            {/* Detail header visual card panel */}
            <div className="detail-header-card">
                <div className="detail-header-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="project-card-code">{project.projectCode}</span>
                        <span className={statusClass}>{project.status}</span>
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0 4px 0', color: 'var(--text-main)' }}>{project.projectName}</h2>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaMapMarkerAlt /> {project.city}, {project.state}, {project.country}
                    </span>
                </div>

                <div className="detail-header-right">
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Site Progress</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="progress-bar-bg" style={{ width: '120px' }}>
                                <div className="progress-bar-fill" style={{ width: `${project.progress}%`, backgroundColor: progressColor }}></div>
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)' }}>{project.progress}%</span>
                        </div>
                    </div>
                    <a href={`#/projects/edit/${project._id}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', textDecoration: 'none' }}>
                        <FaEdit /> Edit Site
                    </a>
                </div>
            </div>

            {/* Custom detail tabs list */}
            <div className="detail-tabs-row">
                {['Overview', 'Labour Force', 'Attendance', 'Expenses', 'Reports', 'Timeline', 'Activity Log'].map(tab => (
                    <button 
                        key={tab} 
                        className={`detail-tab-button ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab contents switcher board */}
            {activeTab === 'Overview' && (
                <div className="tab-overview-grid">
                    {/* Primary Overview Details */}
                    <div className="grid-col-8">
                        <div className="dashboard-card" style={{ marginBottom: '24px' }}>
                            <div className="card-header-row">
                                <h3>Project Summary</h3>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                                {project.description || 'No detailed scope of work entered for this construction project. Open Edit form to insert details on material scopes, drawings, and site restrictions.'}
                            </p>
                        </div>

                        {/* Location Details */}
                        <div className="dashboard-card">
                            <div className="card-header-row">
                                <h3>Location details</h3>
                            </div>
                            <div className="project-card-meta-row" style={{ marginBottom: '12px' }}>
                                <span>Address</span>
                                <strong>{project.address || 'N/A'}</strong>
                            </div>
                            <div className="project-card-meta-row" style={{ marginBottom: '12px' }}>
                                <span>City Location</span>
                                <strong>{project.city}</strong>
                            </div>
                            <div className="project-card-meta-row" style={{ marginBottom: '12px' }}>
                                <span>State & Pincode</span>
                                <strong>{project.state || 'N/A'} - {project.pincode || 'N/A'}</strong>
                            </div>
                            <div style={{ height: '140px', backgroundColor: 'var(--background)', borderRadius: '12px', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '16px' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaMapMarkerAlt /> Interactive Satellite Map Placeholder</span>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Details widgets */}
                    <div className="grid-col-4">
                        {/* Finance details */}
                        <div className="dashboard-card" style={{ marginBottom: '24px' }}>
                            <div className="card-header-row">
                                <h3>Financials</h3>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <FaCoins style={{ fontSize: '32px', color: '#F59E0B' }} />
                                <div>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Estimated Budget</span>
                                    <h4 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>₹{project.budget.toLocaleString()}</h4>
                                </div>
                            </div>
                            <div className="project-card-meta-row">
                                <span>Currency Code</span>
                                <strong>{project.currency}</strong>
                            </div>
                        </div>

                        {/* Timelines */}
                        <div className="dashboard-card" style={{ marginBottom: '24px' }}>
                            <div className="card-header-row">
                                <h3>Execution Timelines</h3>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <FaCalendarAlt style={{ fontSize: '32px', color: 'var(--accent)' }} />
                                <div>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Days Remaining</span>
                                    <h4 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{daysRemaining} Days</h4>
                                </div>
                            </div>
                            <div className="project-card-meta-row" style={{ marginBottom: '8px' }}>
                                <span>Start Date</span>
                                <strong>{new Date(project.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                            </div>
                            <div className="project-card-meta-row">
                                <span>Expected Delivery</span>
                                <strong>{new Date(project.expectedEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                            </div>
                        </div>

                        {/* Supervisory Team details */}
                        <div className="dashboard-card">
                            <div className="card-header-row">
                                <h3>Supervisory Team</h3>
                            </div>
                            <div className="project-card-meta-row" style={{ marginBottom: '8px' }}>
                                <span>Project Manager</span>
                                <strong>{project.projectManager}</strong>
                            </div>
                            <div className="project-card-meta-row" style={{ marginBottom: '8px' }}>
                                <span>Site Engineer</span>
                                <strong>{project.siteEngineer || 'Not Assigned'}</strong>
                            </div>
                            <div className="project-card-meta-row">
                                <span>Supervisor</span>
                                <strong>{project.supervisor || 'Not Assigned'}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Labour Force' && (
                <div className="dashboard-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <FaHardHat style={{ fontSize: '48px', color: 'var(--primary)', marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Labour Allocations (Integration)</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
                        This tab connects directly to the Labour module. Once labor profiles are created, 
                        you can assign masonry, electrical, and concrete workers here.
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', maxWidth: '600px', margin: '0 auto 24px auto' }}>
                        <div className="proj-stat-card" style={{ textAlign: 'center' }}>
                            <span className="proj-stat-title">Assigned Workers</span>
                            <span className="proj-stat-value">45</span>
                        </div>
                        <div className="proj-stat-card" style={{ textAlign: 'center' }}>
                            <span className="proj-stat-title">Active Shifts</span>
                            <span className="proj-stat-value">3</span>
                        </div>
                        <div className="proj-stat-card" style={{ textAlign: 'center' }}>
                            <span className="proj-stat-title">Trade Categories</span>
                            <span className="proj-stat-value">5</span>
                        </div>
                    </div>
                    
                    <button className="btn btn-secondary" style={{ pointerEvents: 'none', opacity: 0.7 }}>
                        Assign Labour Force (Blocked)
                    </button>
                </div>
            )}

            {activeTab === 'Attendance' && (
                <div className="dashboard-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <FaClipboardCheck style={{ fontSize: '48px', color: 'var(--success)', marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Site Presence Reports</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
                        This tab links to the Attendance tracking module to show daily shift logins, hours worked, and overtime counts.
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px', maxWidth: '500px', margin: '0 auto 24px auto' }}>
                        <div className="proj-stat-card" style={{ textAlign: 'center', borderColor: 'var(--success)' }}>
                            <span className="proj-stat-title" style={{ color: 'var(--success)' }}>Present Today</span>
                            <span className="proj-stat-value">41</span>
                        </div>
                        <div className="proj-stat-card" style={{ textAlign: 'center', borderColor: 'var(--danger)' }}>
                            <span className="proj-stat-title" style={{ color: 'var(--danger)' }}>Absent</span>
                            <span className="proj-stat-value">3</span>
                        </div>
                        <div className="proj-stat-card" style={{ textAlign: 'center', borderColor: 'var(--warning)' }}>
                            <span className="proj-stat-title" style={{ color: 'var(--warning)' }}>Half-day</span>
                            <span className="proj-stat-value">1</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Expenses' && (
                <div className="dashboard-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <FaCoins style={{ fontSize: '48px', color: '#F59E0B', marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Project Balance Sheet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                        Monitors spent funds against original budgets for building materials, crane rentals, and permits.
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '440px', margin: '0 auto' }}>
                        <div className="project-card-meta-row">
                            <span>Estimated Budget</span>
                            <strong>₹{project.budget.toLocaleString()}</strong>
                        </div>
                        <div className="project-card-meta-row">
                            <span>Spent Funds (Estimates)</span>
                            <strong style={{ color: 'var(--danger)' }}>₹{(project.budget * 0.42).toLocaleString()} (42%)</strong>
                        </div>
                        <div className="project-card-meta-row">
                            <span>Remaining Balances</span>
                            <strong style={{ color: 'var(--success)' }}>₹{(project.budget * 0.58).toLocaleString()} (58%)</strong>
                        </div>
                        <div className="progress-bar-bg" style={{ width: '100%', height: '12px' }}>
                            <div className="progress-bar-fill" style={{ width: '42%', backgroundColor: 'var(--danger)' }}></div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Reports' && (
                <div className="dashboard-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <FaFileAlt style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Daily Construction Log (Site Reports)</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
                        Access site concrete testing logs, safety incident notifications, and site photographs uploaded by site engineers.
                    </p>
                    <button className="btn btn-secondary" style={{ pointerEvents: 'none', opacity: 0.5 }} disabled>
                        Compile Site log (Disabled)
                    </button>
                </div>
            )}

            {activeTab === 'Timeline' && (
                <div className="dashboard-card">
                    <div className="card-header-row">
                        <h3>Site Construction Phases</h3>
                    </div>
                    <ul className="timeline" style={{ paddingLeft: '24px' }}>
                        <li className="timeline-item success">
                            <div className="timeline-badge"></div>
                            <div className="timeline-content">
                                <span className="timeline-title">Phase 1: Soil Testing & Excavation</span>
                                <span className="timeline-desc">Digging and deep foundation pile construction. Completed.</span>
                                <span className="timeline-time">Completed: {new Date(project.startDate).toLocaleDateString('en-IN')}</span>
                            </div>
                        </li>
                        <li className="timeline-item success" style={{ marginTop: '20px' }}>
                            <div className="timeline-badge"></div>
                            <div className="timeline-content">
                                <span className="timeline-title">Phase 2: Plinth & Foundation Concrete Pouring</span>
                                <span className="timeline-desc">Structural columns and tie beams completed.</span>
                                <span className="timeline-time">Completed: 15 days ago</span>
                            </div>
                        </li>
                        <li className="timeline-item primary" style={{ marginTop: '20px' }}>
                            <div className="timeline-badge"></div>
                            <div className="timeline-content">
                                <span className="timeline-title">Phase 3: Reinforcement Pillars & Framework</span>
                                <span className="timeline-desc">Columns scaffolding construction. Currently active stage.</span>
                                <span className="timeline-time">Active Stage</span>
                            </div>
                        </li>
                        <li className="timeline-item" style={{ marginTop: '20px' }}>
                            <div className="timeline-badge" style={{ backgroundColor: 'var(--border-color)' }}></div>
                            <div className="timeline-content">
                                <span className="timeline-title">Phase 4: Roof Slab Pouring</span>
                                <span className="timeline-desc">Concrete slab structural assembly. Upcoming.</span>
                                <span className="timeline-time">Upcoming Scheduled</span>
                            </div>
                        </li>
                    </ul>
                </div>
            )}

            {activeTab === 'Activity Log' && (
                <div className="dashboard-card">
                    <div className="card-header-row">
                        <h3>System logs</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '13px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                            <FaCalendarCheck style={{ color: 'var(--primary)', marginTop: '2px' }} />
                            <div>
                                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Project Registered</span>
                                <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)' }}>Created by {project.createdBy || 'system-admin'} on {new Date(project.createdAt).toLocaleDateString('en-IN')} {new Date(project.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                        {project.updatedBy && (
                            <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                                <FaEdit style={{ color: 'var(--accent)', marginTop: '2px' }} />
                                <div>
                                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Project Details Updated</span>
                                    <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)' }}>Modified by {project.updatedBy} on {new Date(project.updatedAt).toLocaleDateString('en-IN')} {new Date(project.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
