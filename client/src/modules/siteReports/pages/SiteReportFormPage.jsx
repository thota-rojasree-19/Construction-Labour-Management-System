import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import { 
    FaArrowLeft, 
    FaFileInvoice, 
    FaTasks, 
    FaUsers, 
    FaExclamationTriangle, 
    FaCamera, 
    FaRegStickyNote,
    FaCheck,
    FaTrash
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/siteReports.css';

export default function SiteReportFormPage({ mode = 'create', reportId = null }) {
    const getReportIdFromHash = () => {
        if (mode !== 'edit') return null;
        const hash = window.location.hash;
        const parts = hash.split('/');
        return parts[parts.length - 1];
    };

    const targetReportId = reportId || getReportIdFromHash();

    const initialFormState = {
        project: '',
        supervisor: '',
        reportDate: new Date().toISOString().split('T')[0],
        weather: 'Clear',
        shift: 'General',
        workCompleted: '',
        ongoingWork: '',
        plannedWork: '',
        progressPercentage: 0,
        labourCount: '',
        skilledLabourCount: '',
        unskilledLabourCount: '',
        issues: '',
        delays: '',
        safetyIncidents: '',
        materialShortages: '',
        equipmentProblems: '',
        beforeWorkPhotos: [],
        duringWorkPhotos: [],
        afterWorkPhotos: [],
        remarks: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [projects, setProjects] = useState([]);
    const [supervisors, setSupervisors] = useState([]);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch dropdown data
    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        // Fetch projects
        fetch('/api/v1/projects', { headers })
            .then(res => res.json())
            .then(data => {
                if (data && data.projects) setProjects(data.projects);
            })
            .catch(() => {});

        // Fetch supervisors (User models with role Supervisor)
        // Since we don't have a distinct Supervisor GET endpoint easily, let's fetch users list if it exists,
        // or mock user names, or fetch from auth. We can fetch active supervisors.
        // Let's create a fallback mock user list if endpoint fails.
        setSupervisors([
            { _id: '60c72b2f9b1d8b2c88f11111', fullName: 'Sunil Yadav' },
            { _id: '60c72b2f9b1d8b2c88f12222', fullName: 'Rajesh Kumar' },
            { _id: '60c72b2f9b1d8b2c88f13333', fullName: 'Anil Sharma' }
        ]);

        // Duplicate report payload
        const dupItem = localStorage.getItem('duplicateReport');
        if (dupItem && mode === 'create') {
            try {
                const parsed = JSON.parse(dupItem);
                setFormData(prev => ({ ...prev, ...parsed }));
                toast.info('Form populated with duplicated report data.');
            } catch (e) {}
            localStorage.removeItem('duplicateReport');
        }

        // Fetch details if edit
        if (mode === 'edit' && targetReportId) {
            setLoading(true);
            fetch(`/api/v1/site-reports/${targetReportId}`, { headers })
                .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Failed to retrieve report');
                    return data;
                })
                .then((data) => {
                    const formatted = {
                        ...data,
                        project: data.project?._id || data.project || '',
                        supervisor: data.supervisor?._id || data.supervisor || '',
                        reportDate: data.reportDate ? new Date(data.reportDate).toISOString().split('T')[0] : ''
                    };
                    setFormData(formatted);
                    setLoading(false);
                })
                .catch((err) => {
                    setLoading(false);
                    toast.error(err.message);
                });
        }
    }, [mode, targetReportId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['progressPercentage', 'labourCount', 'skilledLabourCount', 'unskilledLabourCount'].includes(name)
                ? (value === '' ? '' : parseInt(value, 10))
                : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Mock photos uploader trigger
    const handlePhotoUpload = (categoryKey) => {
        setSaving(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        fetch('/api/v1/site-reports/upload-photos', {
            method: 'POST',
            headers
        })
        .then(res => res.json())
        .then(data => {
            setSaving(false);
            if (data && data.urls) {
                setFormData(prev => ({
                    ...prev,
                    [categoryKey]: [...prev[categoryKey], ...data.urls]
                }));
                toast.success('Mock photographs uploaded successfully!');
            }
        })
        .catch(() => {
            setSaving(false);
            toast.error('Mock upload trigger failed');
        });
    };

    const handleRemovePhoto = (categoryKey, urlIndex) => {
        setFormData(prev => ({
            ...prev,
            [categoryKey]: prev[categoryKey].filter((_, idx) => idx !== urlIndex)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.project) newErrors.project = 'Project site allocation is required';
        if (!formData.reportDate) newErrors.reportDate = 'Report date is required';
        if (!formData.workCompleted.trim()) newErrors.workCompleted = 'Work completed summary is required';
        if (formData.progressPercentage === '' || isNaN(formData.progressPercentage) || formData.progressPercentage < 0 || formData.progressPercentage > 100) {
            newErrors.progressPercentage = 'Progress must be a percentage between 0 and 100';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitReport = (statusVal) => {
        if (!validateForm()) {
            toast.error('Please fix validation errors before submitting.');
            return;
        }

        setSaving(true);
        const token = localStorage.getItem('token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const endpoint = mode === 'create' ? '/api/v1/site-reports' : `/api/v1/site-reports/${targetReportId}`;
        const method = mode === 'create' ? 'POST' : 'PUT';

        const payload = {
            ...formData,
            status: statusVal
        };

        fetch(endpoint, {
            method,
            headers,
            body: JSON.stringify(payload)
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Operation failed');
            return data;
        })
        .then(() => {
            setSaving(false);
            toast.success(statusVal === 'Submitted' ? 'Report submitted successfully!' : 'Draft saved successfully!');
            setTimeout(() => {
                window.location.hash = '#/reports';
            }, 1200);
        })
        .catch((err) => {
            setSaving(false);
            toast.error(err.message);
        });
    };

    return (
        <DashboardLayout activePage="Reports">
            <ToastContainer />

            <div className="db-header" style={{ marginBottom: '20px' }}>
                <div className="db-header-titles">
                    <a href="#/reports" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                        <FaArrowLeft /> Back to Dashboard
                    </a>
                    <h1>{mode === 'create' ? 'Create Daily Report' : `Edit Report (${formData.reportCode || ''})`}</h1>
                    <p>File work summaries, workforce counts, ongoing activities, safety alerts, and photos diaries.</p>
                </div>
            </div>

            {loading ? (
                <div className="dashboard-card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner-icon" style={{ borderColor: 'var(--primary) transparent var(--primary) transparent', width: '32px', height: '32px' }}></div>
                    <span style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Retrieving report details...</span>
                </div>
            ) : (
                <div className="form-step-container">
                    
                    {/* Section 1: General Info */}
                    <div className="form-step-card">
                        <div className="form-step-title">
                            <FaFileInvoice /> Report Information
                        </div>
                        <div className="form-grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Report Date *</label>
                                <input 
                                    type="date" 
                                    name="reportDate"
                                    className={`form-input ${errors.reportDate ? 'error' : ''}`}
                                    value={formData.reportDate}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                />
                                {errors.reportDate && <span className="input-error-msg">{errors.reportDate}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Project Site *</label>
                                <select 
                                    name="project"
                                    className={`form-input ${errors.project ? 'error' : ''}`}
                                    value={formData.project}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                >
                                    <option value="">-- Choose Project --</option>
                                    {projects.map(p => (
                                        <option key={p._id} value={p._id}>{p.projectName}</option>
                                    ))}
                                </select>
                                {errors.project && <span className="input-error-msg">{errors.project}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Weather Conditions</label>
                                <select name="weather" className="form-input" value={formData.weather} onChange={handleInputChange} disabled={saving}>
                                    <option value="Clear">Clear / Sunny</option>
                                    <option value="Rainy">Rainy</option>
                                    <option value="Windy">Windy</option>
                                    <option value="Overcast">Overcast</option>
                                    <option value="Stormy">Stormy</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Site Supervisor</label>
                                <select name="supervisor" className="form-input" value={formData.supervisor} onChange={handleInputChange} disabled={saving}>
                                    <option value="">-- Choose Supervisor --</option>
                                    {supervisors.map(s => (
                                        <option key={s._id} value={s._id}>{s.fullName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Work Shift</label>
                                <select name="shift" className="form-input" value={formData.shift} onChange={handleInputChange} disabled={saving}>
                                    <option value="General">General</option>
                                    <option value="Day">Day</option>
                                    <option value="Night">Night</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Work Summary */}
                    <div className="form-step-card">
                        <div className="form-step-title">
                            <FaTasks /> Work Summary
                        </div>
                        <div className="form-group">
                            <label className="form-label">Work Completed Today *</label>
                            <textarea 
                                name="workCompleted"
                                className={`form-input ${errors.workCompleted ? 'error' : ''}`}
                                rows="3"
                                placeholder="Describe masonry completed, steel bars set, foundations poured..."
                                value={formData.workCompleted}
                                onChange={handleInputChange}
                                disabled={saving}
                            />
                            {errors.workCompleted && <span className="input-error-msg">{errors.workCompleted}</span>}
                        </div>

                        <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Ongoing / Active Activities</label>
                                <textarea 
                                    name="ongoingWork"
                                    className="form-input"
                                    rows="2"
                                    placeholder="List structures curing, excavations in progress..."
                                    value={formData.ongoingWork}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Planned Work for Tomorrow</label>
                                <textarea 
                                    name="plannedWork"
                                    className="form-input"
                                    rows="2"
                                    placeholder="List concrete pourings, scaffolding set, electrical runs planned..."
                                    value={formData.plannedWork}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '16px', width: '220px' }}>
                            <label className="form-label">Project Cumulative Progress (%) *</label>
                            <input 
                                type="number" 
                                name="progressPercentage"
                                className={`form-input ${errors.progressPercentage ? 'error' : ''}`}
                                min="0"
                                max="100"
                                placeholder="e.g. 55"
                                value={formData.progressPercentage}
                                onChange={handleInputChange}
                                disabled={saving}
                            />
                            {errors.progressPercentage && <span className="input-error-msg">{errors.progressPercentage}</span>}
                        </div>
                    </div>

                    {/* Section 3: Workforce */}
                    <div className="form-step-card">
                        <div className="form-step-title">
                            <FaUsers /> Workforce Log
                        </div>
                        <div className="form-grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Total Labour Count</label>
                                <input 
                                    type="number" 
                                    name="labourCount"
                                    className="form-input"
                                    placeholder="e.g. 45"
                                    value={formData.labourCount}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Skilled Workers Count</label>
                                <input 
                                    type="number" 
                                    name="skilledLabourCount"
                                    className="form-input"
                                    placeholder="e.g. 20"
                                    value={formData.skilledLabourCount}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Unskilled Workers Count</label>
                                <input 
                                    type="number" 
                                    name="unskilledLabourCount"
                                    className="form-input"
                                    placeholder="e.g. 25"
                                    value={formData.unskilledLabourCount}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Issues & Delays */}
                    <div className="form-step-card">
                        <div className="form-step-title">
                            <FaExclamationTriangle /> Issues & Work Delays
                        </div>
                        <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Encountered Issues</label>
                                <textarea name="issues" className="form-input" rows="2" placeholder="e.g. Soil cave-in sector B" value={formData.issues} onChange={handleInputChange} disabled={saving} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Work Delays Reasons</label>
                                <textarea name="delays" className="form-input" rows="2" placeholder="e.g. Rainy storm halted concrete pour" value={formData.delays} onChange={handleInputChange} disabled={saving} />
                            </div>
                        </div>

                        <div className="form-grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Safety Incidents</label>
                                <input type="text" name="safetyIncidents" placeholder="None" className="form-input" value={formData.safetyIncidents} onChange={handleInputChange} disabled={saving} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Material Shortages</label>
                                <input type="text" name="materialShortages" placeholder="None" className="form-input" value={formData.materialShortages} onChange={handleInputChange} disabled={saving} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Equipment Problems</label>
                                <input type="text" name="equipmentProblems" placeholder="None" className="form-input" value={formData.equipmentProblems} onChange={handleInputChange} disabled={saving} />
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Photos */}
                    <div className="form-step-card">
                        <div className="form-step-title">
                            <FaCamera /> Photo Documentation
                        </div>
                        
                        {['beforeWorkPhotos', 'duringWorkPhotos', 'afterWorkPhotos'].map(key => {
                            const label = key === 'beforeWorkPhotos' ? 'Before Work' : key === 'duringWorkPhotos' ? 'During Work' : 'After Work';
                            return (
                                <div key={key} style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <h5 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>{label} Photos ({formData[key].length})</h5>
                                        <button type="button" className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => handlePhotoUpload(key)} disabled={saving}>
                                            Mock Upload Photos
                                        </button>
                                    </div>

                                    {formData[key].length === 0 ? (
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No photos uploaded for this stage.</span>
                                    ) : (
                                        <div className="photo-gallery-grid">
                                            {formData[key].map((url, idx) => (
                                                <div key={idx} className="gallery-photo-item">
                                                    <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                                        PHOTO_{idx + 1} ({url.split('/').pop()})
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px' }}
                                                        onClick={() => handleRemovePhoto(key, idx)}
                                                    >
                                                        <FaTrash style={{ fontSize: '11px' }} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Section 6: Additional Notes */}
                    <div className="form-step-card">
                        <div className="form-step-title">
                            <FaRegStickyNote /> Additional Notes & Remarks
                        </div>
                        <div className="form-group">
                            <label className="form-label">Accounting & General Comments</label>
                            <textarea name="remarks" className="form-input" rows="2" placeholder="Internal accounting remarks..." value={formData.remarks} onChange={handleInputChange} disabled={saving} />
                        </div>
                    </div>

                    {/* Actions toolbar */}
                    <div className="form-actions-bar" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <a href="#/reports/list" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                            Cancel
                        </a>
                        <button type="button" className="btn btn-secondary" onClick={() => handleSubmitReport('Draft')} disabled={saving}>
                            Save as Draft
                        </button>
                        <button type="button" className="btn btn-primary" onClick={() => handleSubmitReport('Submitted')} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <FaCheck /> Submit Report
                        </button>
                    </div>

                </div>
            )}
        </DashboardLayout>
    );
}
