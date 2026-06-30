import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { 
    FaArrowLeft, 
    FaPlus, 
    FaCheck, 
    FaTrash, 
    FaUserCircle, 
    FaCloudUploadAlt,
    FaCalendarCheck
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/attendance.css';

export default function BulkAttendancePage() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [workers, setWorkers] = useState([]); // List of { worker, attendanceRecord }
    const [saving, setSaving] = useState(false);

    // Fetch projects
    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        fetch('/api/v1/projects', { headers })
            .then(res => res.json())
            .then(data => {
                if (data && data.projects) {
                    setProjects(data.projects);
                    // Preselect first project if available
                    if (data.projects.length > 0) {
                        setSelectedProject(data.projects[0]._id);
                    }
                }
            })
            .catch(() => toast.error('Failed to load project references'));
    }, []);

    // Fetch project workforce & existing attendance
    const loadWorkforce = () => {
        if (!selectedProject) return;

        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        fetch(`/api/v1/attendance/project/${selectedProject}?date=${selectedDate}`, { headers })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to load project roster');
                return data;
            })
            .then((data) => {
                // Map API response workers to our table row edit state
                const mapped = data.list.map(item => {
                    const rec = item.attendanceRecord;
                    return {
                        workerId: item.worker._id,
                        employeeId: item.worker.employeeId,
                        fullName: item.worker.fullName,
                        tradeCategory: item.worker.tradeCategory,
                        shift: rec ? rec.shift : (item.worker.shift || 'General'),
                        status: rec ? rec.status : 'Present',
                        checkInTime: rec ? (rec.checkInTime || '08:00') : '08:00',
                        checkOutTime: rec ? (rec.checkOutTime || '17:00') : '17:00',
                        remarks: rec ? (rec.remarks || '') : '',
                        isChanged: false
                    };
                });
                setWorkers(mapped);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                toast.error(err.message);
            });
    };

    useEffect(() => {
        loadWorkforce();
    }, [selectedProject, selectedDate]);

    // Handle field adjustments
    const handleFieldChange = (workerId, field, value) => {
        setWorkers(prev => prev.map(w => {
            if (w.workerId === workerId) {
                return {
                    ...w,
                    [field]: value,
                    isChanged: true
                };
            }
            return w;
        }));
    };

    // Bulk action presets
    const applyBulkStatus = (statusVal) => {
        setWorkers(prev => prev.map(w => ({
            ...w,
            status: statusVal,
            isChanged: true,
            // Adjust defaults based on status
            checkInTime: (statusVal === 'Present' || statusVal === 'Half Day') ? '08:00' : '',
            checkOutTime: statusVal === 'Present' ? '17:00' : statusVal === 'Half Day' ? '12:00' : ''
        })));
        toast.info(`Preset applied: ${statusVal} for all workers.`);
    };

    const handleSaveBulk = (e) => {
        e.preventDefault();
        
        // Find modified records or save all if first marking
        const payloadRecords = workers.map(w => ({
            worker: w.workerId,
            project: selectedProject,
            date: selectedDate,
            status: w.status,
            shift: w.shift,
            checkInTime: (w.status === 'Present' || w.status === 'Half Day') ? w.checkInTime : '',
            checkOutTime: (w.status === 'Present' || w.status === 'Half Day') ? w.checkOutTime : '',
            remarks: w.remarks
        }));

        if (payloadRecords.length === 0) {
            toast.warn('No workers available to record.');
            return;
        }

        if (!window.confirm(`Are you sure you want to save attendance for ${payloadRecords.length} workers?`)) {
            return;
        }

        setSaving(true);
        const token = localStorage.getItem('token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        fetch('/api/v1/attendance/bulk', {
            method: 'POST',
            headers,
            body: JSON.stringify({ records: payloadRecords })
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Bulk update failed');
            return data;
        })
        .then(() => {
            setSaving(false);
            toast.success('Roster attendance saved successfully!');
            setTimeout(() => {
                window.location.hash = '#/attendance';
            }, 1200);
        })
        .catch((err) => {
            setSaving(false);
            toast.error(err.message);
        });
    };

    return (
        <DashboardLayout activePage="Attendance">
            <ToastContainer />

            <div className="db-header" style={{ marginBottom: '20px' }}>
                <div className="db-header-titles">
                    <a href="#/attendance" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                        <FaArrowLeft /> Back to Dashboard
                    </a>
                    <h1>Bulk Attendance Entry</h1>
                    <p>Mark daily attendance log statuses, shift codes, and working hours for multiple workers at once.</p>
                </div>
            </div>

            {/* Config Panel */}
            <div className="attendance-filters-panel" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '240px' }}>
                        <label className="form-label" style={{ fontWeight: 700 }}>Select Project Site *</label>
                        <select 
                            className="form-input"
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                        >
                            <option value="">-- Choose Project --</option>
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.projectName}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '180px' }}>
                        <label className="form-label" style={{ fontWeight: 700 }}>Select Date *</label>
                        <input 
                            type="date" 
                            className="form-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {selectedProject && (
                <div className="dashboard-card">
                    {/* Quick Toolbar */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Worker List ({workers.length})</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" className="btn btn-secondary" style={{ fontSize: '12px', color: 'var(--success)' }} onClick={() => applyBulkStatus('Present')}>
                                Select All Present
                            </button>
                            <button type="button" className="btn btn-secondary" style={{ fontSize: '12px', color: 'var(--danger)' }} onClick={() => applyBulkStatus('Absent')}>
                                Select All Absent
                            </button>
                            <button type="button" className="btn btn-secondary" style={{ fontSize: '12px', color: 'var(--warning)' }} onClick={() => applyBulkStatus('Half Day')}>
                                Apply Half Day
                            </button>
                        </div>
                    </div>

                    {/* Table roster */}
                    <div className="table-responsive">
                        <table className="project-table">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Worker Name</th>
                                    <th>Shift</th>
                                    <th>Status Status</th>
                                    <th>In Time</th>
                                    <th>Out Time</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            {loading ? (
                                <LoadingSkeleton rows={4} cols={7} />
                            ) : workers.length === 0 ? (
                                <tbody>
                                    <tr>
                                        <td colSpan="7">
                                            <EmptyState 
                                                title="No Workers Allocated"
                                                description="There are no active workers currently assigned to this construction site project."
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            ) : (
                                <tbody>
                                    {workers.map(w => (
                                        <tr key={w.workerId} className={w.isChanged ? 'bulk-worker-row selected' : 'bulk-worker-row'}>
                                            <td style={{ fontWeight: 700 }}>{w.employeeId}</td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 600 }}>{w.fullName}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{w.tradeCategory}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <select 
                                                    className="form-input"
                                                    style={{ padding: '4px 8px', fontSize: '12px', width: '90px' }}
                                                    value={w.shift}
                                                    onChange={(e) => handleFieldChange(w.workerId, 'shift', e.target.value)}
                                                >
                                                    <option value="General">General</option>
                                                    <option value="Day">Day</option>
                                                    <option value="Night">Night</option>
                                                </select>
                                            </td>
                                            <td>
                                                <div className="attendance-radio-group">
                                                    {['Present', 'Absent', 'Half Day', 'Leave'].map(st => (
                                                        <div 
                                                            key={st}
                                                            className={`attendance-radio-btn ${w.status === st ? `active ${st.toLowerCase().replace(' ', '')}` : ''}`}
                                                            onClick={() => handleFieldChange(w.workerId, 'status', st)}
                                                        >
                                                            {st}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    placeholder="08:00"
                                                    className="form-input"
                                                    style={{ width: '70px', padding: '4px 6px', fontSize: '12px', textAlign: 'center' }}
                                                    value={w.checkInTime}
                                                    disabled={w.status === 'Absent' || w.status === 'Leave'}
                                                    onChange={(e) => handleFieldChange(w.workerId, 'checkInTime', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    placeholder="17:00"
                                                    className="form-input"
                                                    style={{ width: '70px', padding: '4px 6px', fontSize: '12px', textAlign: 'center' }}
                                                    value={w.checkOutTime}
                                                    disabled={w.status === 'Absent' || w.status === 'Leave'}
                                                    onChange={(e) => handleFieldChange(w.workerId, 'checkOutTime', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    placeholder="Add shift remarks..."
                                                    className="form-input"
                                                    style={{ padding: '4px 8px', fontSize: '12px', width: '100%' }}
                                                    value={w.remarks}
                                                    onChange={(e) => handleFieldChange(w.workerId, 'remarks', e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            )}
                        </table>
                    </div>

                    {workers.length > 0 && (
                        <div className="bulk-toolbar-fixed">
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                Batch ready for verification. Make sure hours match check-in rosters.
                            </span>
                            <button 
                                type="button" 
                                className="btn btn-primary" 
                                onClick={handleSaveBulk} 
                                disabled={saving}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                                <FaCloudUploadAlt /> {saving ? 'Saving Records...' : 'Save All Attendance'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}
