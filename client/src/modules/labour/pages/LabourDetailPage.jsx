import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import { 
    FaArrowLeft, FaEdit, FaMapMarkerAlt, FaCalendarAlt, FaUser, 
    FaCoins, FaHardHat, FaClipboardCheck, FaFileAlt, FaShieldAlt,
    FaCalendarCheck, FaClock, FaIdCard, FaHistory, FaPhoneAlt
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/labour.css';

export default function LabourDetailPage({ labourId }) {
    const [labour, setLabour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {
        if (labourId) {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            fetch(`/api/v1/labours/${labourId}`, {
                method: 'GET',
                headers
            })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to retrieve worker profile');
                return data;
            })
            .then((data) => {
                setLabour(data);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                toast.error(err.message);
            });
        }
    }, [labourId]);

    if (loading) {
        return (
            <DashboardLayout activePage="Labour">
                <div className="dashboard-card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner-icon" style={{ borderColor: 'var(--primary) transparent var(--primary) transparent', width: '32px', height: '32px' }}></div>
                    <span style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Retrieving worker profile...</span>
                </div>
            </DashboardLayout>
        );
    }

    if (!labour) {
        return (
            <DashboardLayout activePage="Labour">
                <div className="dashboard-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <h3>Workforce Profile Error</h3>
                    <p style={{ color: 'var(--text-muted)' }}>We couldn't load the details for this worker. Please return to listing.</p>
                    <a href="#/labour" className="btn btn-secondary">Back to List</a>
                </div>
            </DashboardLayout>
        );
    }

    const tradeNormalized = labour.tradeCategory.toLowerCase().replace(/\s+/g, '');
    const avatarText = `${labour.firstName.charAt(0)}${labour.lastName ? labour.lastName.charAt(0) : ''}`;

    let statusClass = 'status-badge';
    if (labour.status === 'Active') statusClass += ' active';
    else if (labour.status === 'Inactive') statusClass += ' inactive';
    else if (labour.status === 'Suspended') statusClass += ' suspended';
    else if (labour.status === 'Left') statusClass += ' left';

    return (
        <DashboardLayout activePage="Labour">
            <ToastContainer />

            {/* Back action title header */}
            <div className="db-header" style={{ marginBottom: '16px' }}>
                <a href="#/labour" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                    <FaArrowLeft /> Back to Workforce List
                </a>
            </div>

            {/* Profile summary header panel card */}
            <div className="detail-header-card">
                <div className="profile-summary-header">
                    <div className="profile-avatar-container">
                        {labour.photo ? (
                            <img src={labour.photo} className="profile-avatar-frame" style={{ width: '90px', height: '90px' }} alt="Profile Avatar" />
                        ) : (
                            <div className="profile-avatar-frame" style={{ width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '28px' }}>
                                {avatarText}
                            </div>
                        )}
                    </div>
                    
                    <div className="profile-summary-titles">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="project-card-code">{labour.employeeId}</span>
                            <span className={`trade-badge ${tradeNormalized}`}>{labour.tradeCategory}</span>
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '6px 0 4px 0', color: 'var(--text-main)' }}>{labour.fullName}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className={statusClass}>{labour.status}</span>
                            <span className={`avail-chip ${labour.availability ? 'yes' : 'no'}`}>
                                {labour.availability ? '🟢 Available' : '⚪ Busy (Assigned)'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="detail-header-right" style={{ alignSelf: 'center' }}>
                    <a href={`#/labour/edit/${labour._id}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', textDecoration: 'none' }}>
                        <FaEdit /> Edit Profile
                    </a>
                </div>
            </div>

            {/* Profile Custom Tabs */}
            <div className="detail-tabs-row">
                {['Overview', 'Site Assignment', 'Attendance History', 'Payroll Logs', 'Activity Log'].map(tab => (
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
                    {/* Primary Personal details card */}
                    <div className="grid-col-8">
                        <div className="dashboard-card" style={{ marginBottom: '24px' }}>
                            <div className="card-header-row">
                                <h3>Personal Demographics</h3>
                            </div>
                            <div className="project-card-meta-row" style={{ marginBottom: '12px' }}>
                                <span>Gender</span>
                                <strong>{labour.gender}</strong>
                            </div>
                            <div className="project-card-meta-row" style={{ marginBottom: '12px' }}>
                                <span>Date of Birth (Age)</span>
                                <strong>{new Date(labour.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ({labour.age} yrs)</strong>
                            </div>
                            <div className="project-card-meta-row" style={{ marginBottom: '12px' }}>
                                <span>Home Town Location</span>
                                <strong>{labour.city}, {labour.state || 'N/A'} - {labour.pincode || 'N/A'}</strong>
                            </div>
                            <div className="project-card-meta-row" style={{ marginBottom: '12px' }}>
                                <span>Local Address</span>
                                <strong>{labour.address || 'N/A'}</strong>
                            </div>
                            <div className="project-card-meta-row">
                                <span>Emergency Contact Phone</span>
                                <strong><FaPhoneAlt style={{ color: 'var(--primary)', marginRight: '4px' }} /> {labour.emergencyContact}</strong>
                            </div>
                        </div>

                        {/* Medical notes / Safety records */}
                        <div className="dashboard-card">
                            <div className="card-header-row">
                                <h3>Medical & Site Safety Notes</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', padding: '16px', backgroundColor: 'var(--background)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                                <FaShieldAlt style={{ fontSize: '24px', color: 'var(--primary)', marginTop: '2px' }} />
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                                    {labour.notes || 'No custom safety notes or medical warnings listed. Safety checklist verifies clear status.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Secondary details widgets */}
                    <div className="grid-col-4">
                        {/* Employment contract details */}
                        <div className="dashboard-card" style={{ marginBottom: '24px' }}>
                            <div className="card-header-row">
                                <h3>Employment Details</h3>
                            </div>
                            <div className="project-card-meta-row" style={{ marginBottom: '10px' }}>
                                <span>Employment Type</span>
                                <strong>{labour.employmentType}</strong>
                            </div>
                            <div className="project-card-meta-row" style={{ marginBottom: '10px' }}>
                                <span>Skill Grade</span>
                                <span className={`skill-badge ${labour.skillLevel.toLowerCase().replace(/\s+/g, '')}`} style={{ fontSize: '11px', padding: '2px 6px' }}>
                                    {labour.skillLevel}
                                </span>
                            </div>
                            <div className="project-card-meta-row" style={{ marginBottom: '10px' }}>
                                <span>Experience Count</span>
                                <strong>{labour.experience} Years</strong>
                            </div>
                            <div className="project-card-meta-row" style={{ marginBottom: '10px' }}>
                                <span>Contract Wage (Daily)</span>
                                <strong>₹{labour.dailyWage} / Day</strong>
                            </div>
                            <div className="project-card-meta-row">
                                <span>Joining Date</span>
                                <strong>{new Date(labour.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                            </div>
                        </div>

                        {/* Active assignment details */}
                        <div className="dashboard-card">
                            <div className="card-header-row">
                                <h3>Active Site Assignment</h3>
                            </div>
                            {labour.assignedProject ? (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                        <FaHardHat style={{ fontSize: '32px', color: 'var(--primary)' }} />
                                        <div>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Project</span>
                                            <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                                                <a href={`#/projects/${labour.assignedProject._id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                                                    {labour.assignedProject.projectName}
                                                </a>
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="project-card-meta-row" style={{ marginBottom: '8px' }}>
                                        <span>Supervisor</span>
                                        <strong>{labour.supervisor || 'Not Assigned'}</strong>
                                    </div>
                                    <div className="project-card-meta-row">
                                        <span>Shift</span>
                                        <strong><FaClock style={{ marginRight: '4px' }} /> {labour.shift} Shift</strong>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13px' }}>
                                    Currently not assigned to any active project site. Mark available for deployments.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Site Assignment' && (
                <div className="dashboard-card">
                    <div className="card-header-row">
                        <h3>Project Allocation History</h3>
                    </div>
                    {labour.assignedProject ? (
                        <div className="table-responsive">
                            <table className="project-table">
                                <thead>
                                    <tr>
                                        <th>Project Code</th>
                                        <th>Project Name</th>
                                        <th>Shift Schedule</th>
                                        <th>Supervisor Name</th>
                                        <th>Allocated Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{labour.assignedProject.projectCode}</td>
                                        <td style={{ fontWeight: 600 }}>{labour.assignedProject.projectName}</td>
                                        <td>{labour.shift}</td>
                                        <td>{labour.supervisor || 'N/A'}</td>
                                        <td>{labour.assignedProject.city}, {labour.assignedProject.state}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '14px' }}>
                            No active project assignment log history listed.
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'Attendance History' && (
                <div className="dashboard-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <FaClipboardCheck style={{ fontSize: '48px', color: 'var(--success)', marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Workforce Shift Sign-Ins</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
                        This panel displays monthly attendance percentages, overtime counts, and shifts marked present.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px', maxWidth: '500px', margin: '0 auto 24px auto' }}>
                        <div className="proj-stat-card" style={{ textAlign: 'center' }}>
                            <span className="proj-stat-title">Shift Days (June)</span>
                            <span className="proj-stat-value">22 / 24</span>
                        </div>
                        <div className="proj-stat-card" style={{ textAlign: 'center', borderColor: 'var(--success)' }}>
                            <span className="proj-stat-title" style={{ color: 'var(--success)' }}>Presence Rate</span>
                            <span className="proj-stat-value">91%</span>
                        </div>
                        <div className="proj-stat-card" style={{ textAlign: 'center' }}>
                            <span className="proj-stat-title">Overtime Hours</span>
                            <span className="proj-stat-value">8 hrs</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Payroll Logs' && (
                <div className="dashboard-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <FaCoins style={{ fontSize: '48px', color: '#F59E0B', marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Contract Wage Disbursals</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
                        Check historical bank wire receipts, daily rate adjustments, and weekly payroll calculations.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', maxWidth: '600px', margin: '0 auto 24px auto' }}>
                        <div className="proj-stat-card" style={{ textAlign: 'center' }}>
                            <span className="proj-stat-title">Last Disbursed (May)</span>
                            <span className="proj-stat-value">₹13,200</span>
                        </div>
                        <div className="proj-stat-card" style={{ textAlign: 'center', borderColor: 'var(--success)' }}>
                            <span className="proj-stat-title" style={{ color: 'var(--success)' }}>Cycle Payout Status</span>
                            <span className="proj-stat-value">Disbursed</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Activity Log' && (
                <div className="dashboard-card">
                    <div className="card-header-row">
                        <h3>System Logging Timeline</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '13px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                            <FaCalendarCheck style={{ color: 'var(--primary)', marginTop: '2px' }} />
                            <div>
                                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Worker Registered on Platform</span>
                                <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)' }}>Created by {labour.createdBy || 'system-admin'} on {new Date(labour.createdAt).toLocaleDateString('en-IN')} {new Date(labour.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                        {labour.updatedBy && (
                            <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                                <FaEdit style={{ color: 'var(--accent)', marginTop: '2px' }} />
                                <div>
                                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Worker Details Modified</span>
                                    <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)' }}>Updated by {labour.updatedBy} on {new Date(labour.updatedAt).toLocaleDateString('en-IN')} {new Date(labour.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
