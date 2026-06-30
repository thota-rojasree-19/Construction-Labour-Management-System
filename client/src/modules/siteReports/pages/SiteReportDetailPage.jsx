import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import { 
    FaArrowLeft, 
    FaEdit, 
    FaFileInvoice, 
    FaTasks, 
    FaUsers, 
    FaExclamationTriangle, 
    FaCamera, 
    FaRegStickyNote,
    FaCloudSun,
    FaRegCalendarAlt,
    FaSignInAlt,
    FaCheckCircle,
    FaClock
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/siteReports.css';

export default function SiteReportDetailPage({ reportId: propReportId = null }) {
    const getReportIdFromHash = () => {
        const hash = window.location.hash;
        const parts = hash.split('/');
        return parts[parts.length - 1];
    };

    const targetReportId = propReportId || getReportIdFromHash();

    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loadingTimeline, setLoadingTimeline] = useState(false);

    useEffect(() => {
        if (!targetReportId) return;

        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        fetch(`/api/v1/site-reports/${targetReportId}`, { headers })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to load details');
                return data;
            })
            .then((data) => {
                setReport(data);
                setLoading(false);
                // Trigger project timeline load
                if (data.project?._id) {
                    loadTimeline(data.project._id, headers);
                }
            })
            .catch((err) => {
                setLoading(false);
                toast.error(err.message);
            });
    }, [targetReportId]);

    const loadTimeline = (projectId, headers) => {
        setLoadingTimeline(true);
        fetch(`/api/v1/site-reports/project/${projectId}`, { headers })
            .then(res => res.json())
            .then(data => {
                setTimeline(data || []);
                setLoadingTimeline(false);
            })
            .catch(() => setLoadingTimeline(false));
    };

    return (
        <DashboardLayout activePage="Reports">
            <ToastContainer />

            <div className="db-header no-print" style={{ marginBottom: '20px' }}>
                <div className="db-header-titles">
                    <a href="#/reports/list" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                        <FaArrowLeft /> Back to Ledger
                    </a>
                    <h1>Site Report Details Audit</h1>
                    <p>Audit site diaries, supervisor remarks, safety incident logs, and photographic files.</p>
                </div>
                {report && (
                    <a href={`#/reports/edit/${report._id}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                        <FaEdit /> Edit Report Details
                    </a>
                )}
            </div>

            {loading ? (
                <div className="dashboard-card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner-icon" style={{ borderColor: 'var(--primary) transparent var(--primary) transparent', width: '32px', height: '32px' }}></div>
                    <span style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Retrieving site metrics...</span>
                </div>
            ) : !report ? (
                <div className="dashboard-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <h3>Report Not Found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>The requested report reference does not exist or has been deleted.</p>
                </div>
            ) : (
                <div className="details-grid">
                    
                    {/* Left Columns details */}
                    <div className="grid-col-8">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            
                            {/* Summary Card */}
                            <div className="dashboard-card" style={{ gap: '20px' }}>
                                <div className="card-header-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--secondary)', color: 'white' }}>
                                            {report.reportCode}
                                        </span>
                                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                                            {new Date(report.reportDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                        </h3>
                                    </div>
                                    <span className={`report-status-badge ${report.status.toLowerCase()}`}>
                                        {report.status}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '13px' }}>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Project Site</span>
                                        <strong>{report.project?.projectName || 'Unassigned'}</strong>
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weather</span>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                            <FaCloudSun style={{ color: 'var(--warning)' }} /> {report.weather}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Shift</span>
                                        <strong>{report.shift} Shift</strong>
                                    </div>
                                    <div style={{ marginTop: '8px' }}>
                                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Site Engineer</span>
                                        <strong>{report.engineer?.fullName || report.createdBy}</strong>
                                    </div>
                                    <div style={{ marginTop: '8px' }}>
                                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Site Supervisor</span>
                                        <strong>{report.supervisor?.fullName || 'N/A'}</strong>
                                    </div>
                                    <div style={{ marginTop: '8px' }}>
                                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Work Progress</span>
                                        <strong style={{ color: 'var(--primary)', fontSize: '15px' }}>{report.progressPercentage}% Completed</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Work Completed summary */}
                            <div className="dashboard-card" style={{ gap: '16px' }}>
                                <div className="card-header-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                    <h3 style={{ fontSize: '15px' }}><FaTasks /> Work Diary</h3>
                                </div>
                                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div>
                                        <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>Work Completed Today:</strong>
                                        <p style={{ margin: 0, paddingLeft: '12px', borderLeft: '3px solid var(--success)', lineHeight: 1.5 }}>
                                            {report.workCompleted}
                                        </p>
                                    </div>
                                    {report.ongoingWork && (
                                        <div>
                                            <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>Ongoing Activities:</strong>
                                            <p style={{ margin: 0, paddingLeft: '12px', borderLeft: '3px solid var(--accent)', lineHeight: 1.5 }}>
                                                {report.ongoingWork}
                                            </p>
                                        </div>
                                    )}
                                    {report.plannedWork && (
                                        <div>
                                            <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>Planned Work for Tomorrow:</strong>
                                            <p style={{ margin: 0, paddingLeft: '12px', borderLeft: '3px solid var(--secondary)', lineHeight: 1.5 }}>
                                                {report.plannedWork}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Workforce breakdown */}
                            <div className="dashboard-card" style={{ gap: '16px' }}>
                                <div className="card-header-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                    <h3 style={{ fontSize: '15px' }}><FaUsers /> Workforce Summary</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
                                    <div style={{ padding: '16px', backgroundColor: 'var(--background)', borderRadius: '8px' }}>
                                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Total Labour</span>
                                        <strong style={{ fontSize: '20px' }}>{report.labourCount}</strong>
                                    </div>
                                    <div style={{ padding: '16px', backgroundColor: 'var(--background)', borderRadius: '8px' }}>
                                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Skilled Workers</span>
                                        <strong style={{ fontSize: '20px', color: 'var(--success)' }}>{report.skilledLabourCount}</strong>
                                    </div>
                                    <div style={{ padding: '16px', backgroundColor: 'var(--background)', borderRadius: '8px' }}>
                                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Unskilled Workers</span>
                                        <strong style={{ fontSize: '20px', color: 'var(--primary)' }}>{report.unskilledLabourCount}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Issues Warnings */}
                            {(report.issues || report.delays || report.safetyIncidents || report.materialShortages || report.equipmentProblems) && (
                                <div className="dashboard-card" style={{ gap: '12px' }}>
                                    <div className="card-header-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                        <h3 style={{ fontSize: '15px' }}><FaExclamationTriangle /> Incidents, Issues & Shortages</h3>
                                    </div>
                                    
                                    {report.safetyIncidents && (
                                        <div className="issue-warning-card">
                                            <strong>Safety Incident:</strong> {report.safetyIncidents}
                                        </div>
                                    )}
                                    {report.materialShortages && (
                                        <div className="delay-warning-card">
                                            <strong>Material Shortage:</strong> {report.materialShortages}
                                        </div>
                                    )}
                                    {report.equipmentProblems && (
                                        <div className="delay-warning-card">
                                            <strong>Equipment Problem:</strong> {report.equipmentProblems}
                                        </div>
                                    )}
                                    {report.issues && (
                                        <div className="issue-warning-card">
                                            <strong>Site Issue:</strong> {report.issues}
                                        </div>
                                    )}
                                    {report.delays && (
                                        <div className="delay-warning-card">
                                            <strong>Delay Reason:</strong> {report.delays}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Photo documentation gallery */}
                            <div className="dashboard-card" style={{ gap: '16px' }}>
                                <div className="card-header-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                    <h3 style={{ fontSize: '15px' }}><FaCamera /> Photographic Records</h3>
                                </div>

                                {['beforeWorkPhotos', 'duringWorkPhotos', 'afterWorkPhotos'].map(key => {
                                    const label = key === 'beforeWorkPhotos' ? 'Before Work' : key === 'duringWorkPhotos' ? 'During Work' : 'After Work';
                                    if (!report[key] || report[key].length === 0) return null;

                                    return (
                                        <div key={key}>
                                            <h5 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>{label} Photographs</h5>
                                            <div className="photo-gallery-grid" style={{ marginBottom: '16px' }}>
                                                {report[key].map((url, idx) => (
                                                    <div key={idx} className="gallery-photo-item">
                                                        <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                                            PHOTO_{idx + 1}
                                                        </div>
                                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: '6px', textAlign: 'center' }}>
                                                            <a href={url} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'none', fontSize: '10px', fontWeight: 700 }}>
                                                                Download Photo
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>

                    {/* Right Project chronological reports timeline column */}
                    <div className="grid-col-4">
                        <div className="dashboard-card" style={{ gap: '16px' }}>
                            <div className="card-header-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                <h3>Project Reports Timeline</h3>
                            </div>

                            {loadingTimeline ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                                    <div className="spinner-icon" style={{ borderColor: 'var(--primary) transparent var(--primary) transparent', width: '20px', height: '20px' }}></div>
                                </div>
                            ) : timeline.length === 0 ? (
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No other reports recorded for this project site.</span>
                            ) : (
                                <div className="project-rep-timeline">
                                    {timeline.map(tNode => (
                                        <div key={tNode._id} className="timeline-node-card">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    <FaRegCalendarAlt style={{ color: 'var(--text-muted)' }} />
                                                    {new Date(tNode.reportDate).toLocaleDateString()}
                                                </span>
                                                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)' }}>
                                                    {tNode.progressPercentage}% Done
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {tNode.workCompleted}
                                            </p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                                                <span>Labour: <strong>{tNode.labourCount}</strong></span>
                                                <a href={`#/reports/${tNode._id}`} style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                                                    Audit Details
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </DashboardLayout>
    );
}
