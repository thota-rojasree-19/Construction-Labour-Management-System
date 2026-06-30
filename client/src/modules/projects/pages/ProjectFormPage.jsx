import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import { FaArrowLeft, FaBriefcase, FaUser, FaMapMarkerAlt, FaCoins, FaUsers, FaTasks, FaRegStickyNote, FaCheck } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/projects.css';

export default function ProjectFormPage({ mode = 'create', projectId = null }) {
    // 1. Initial State structure
    const initialFormState = {
        projectName: '',
        projectType: 'Residential',
        description: '',
        clientName: '',
        clientEmail: '',
        clientContact: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        budget: '',
        currency: 'INR',
        projectManager: '',
        siteEngineer: '',
        supervisor: '',
        startDate: '',
        expectedEndDate: '',
        status: 'Planning',
        progress: 0,
        notes: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch existing details if edit mode is active
    useEffect(() => {
        if (mode === 'edit' && projectId) {
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
                // Format dates to YYYY-MM-DD for date inputs
                const formattedData = {
                    ...data,
                    startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
                    expectedEndDate: data.expectedEndDate ? new Date(data.expectedEndDate).toISOString().split('T')[0] : ''
                };
                setFormData(formattedData);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                toast.error(err.message);
            });
        }
    }, [mode, projectId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'progress' || name === 'budget' ? (value === '' ? '' : parseFloat(value)) : value
        }));
        // Clear error as user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Form Client validations
    const validateForm = () => {
        const newErrors = {};
        if (!formData.projectName.trim()) newErrors.projectName = 'Project name is required';
        if (!formData.projectType) newErrors.projectType = 'Project type is required';
        if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
        if (!formData.city.trim()) newErrors.city = 'City location is required';
        
        if (formData.budget === '' || isNaN(formData.budget) || formData.budget < 0) {
            newErrors.budget = 'Valid estimated budget amount is required';
        }
        if (!formData.projectManager.trim()) newErrors.projectManager = 'Project manager name is required';
        if (!formData.startDate) newErrors.startDate = 'Timeline start date is required';
        if (!formData.expectedEndDate) newErrors.expectedEndDate = 'Expected end date is required';

        if (formData.startDate && formData.expectedEndDate) {
            if (new Date(formData.startDate) > new Date(formData.expectedEndDate)) {
                newErrors.expectedEndDate = 'Expected end date cannot be earlier than start date';
            }
        }

        if (formData.progress === '' || isNaN(formData.progress) || formData.progress < 0 || formData.progress > 100) {
            newErrors.progress = 'Progress must be a percentage between 0 and 100';
        }

        if (formData.clientEmail.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.clientEmail)) {
                newErrors.clientEmail = 'Invalid email address format';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the errors in the form before submitting');
            return;
        }

        setSaving(true);
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const endpoint = mode === 'create' ? '/api/v1/projects' : `/api/v1/projects/${projectId}`;
        const method = mode === 'create' ? 'POST' : 'PUT';

        fetch(endpoint, {
            method,
            headers,
            body: JSON.stringify(formData)
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Operation failed');
            return data;
        })
        .then(() => {
            setSaving(false);
            toast.success(mode === 'create' ? 'Project created successfully!' : 'Project details updated successfully!');
            setTimeout(() => {
                window.location.hash = '#/projects';
            }, 1200);
        })
        .catch((err) => {
            setSaving(false);
            toast.error(err.message);
        });
    };

    const handleResetForm = () => {
        if (window.confirm('Are you sure you want to clear all form fields?')) {
            setFormData(initialFormState);
            setErrors({});
            toast.info('Form cleared');
        }
    };

    return (
        <DashboardLayout activePage="Projects">
            <ToastContainer />

            {/* Back action title header */}
            <div className="db-header" style={{ marginBottom: '20px' }}>
                <div className="db-header-titles">
                    <a href="#/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                        <FaArrowLeft /> Back to Project List
                    </a>
                    <h1>{mode === 'create' ? 'Create Project Site' : `Edit Project (${formData.projectCode || ''})`}</h1>
                    <p>{mode === 'create' ? 'Setup and allocate timelines for a new construction project site.' : 'Update financials, locations, and supervisor contact states.'}</p>
                </div>
            </div>

            {loading ? (
                <div className="dashboard-card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner-icon" style={{ borderColor: 'var(--primary) transparent var(--primary) transparent', width: '32px', height: '32px' }}></div>
                    <span style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Retrieving data fields...</span>
                </div>
            ) : (
                <form onSubmit={handleFormSubmit}>
                    <div className="form-section-container">
                        
                        {/* Section 1: General Info */}
                        <div className="form-step-section">
                            <div className="form-section-header">
                                <FaBriefcase /> <span>General Site Information</span>
                            </div>
                            <div className="form-grid-2col">
                                <div className="form-group">
                                    <label className="form-label">Project Name *</label>
                                    <input 
                                        type="text" 
                                        className={`form-input ${errors.projectName ? 'error' : ''}`}
                                        name="projectName"
                                        placeholder="e.g. Skyline Luxury Heights"
                                        value={formData.projectName}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                    />
                                    {errors.projectName && <span className="input-error-msg">{errors.projectName}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Project Type *</label>
                                    <select 
                                        className={`form-input ${errors.projectType ? 'error' : ''}`}
                                        name="projectType"
                                        value={formData.projectType}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                    >
                                        <option value="Residential">Residential</option>
                                        <option value="Commercial">Commercial</option>
                                        <option value="Infrastructure">Infrastructure</option>
                                        <option value="Industrial">Industrial</option>
                                        <option value="Roadwork">Roadwork</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.projectType && <span className="input-error-msg">{errors.projectType}</span>}
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label className="form-label">Description / Scope of Work</label>
                                <textarea 
                                    className="form-input" 
                                    name="description" 
                                    rows="3" 
                                    placeholder="Enter details of building specifications, layout plans, etc..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        {/* Section 2: Client Info */}
                        <div className="form-step-section">
                            <div className="form-section-header">
                                <FaUser /> <span>Client Details</span>
                            </div>
                            <div className="form-grid-3col">
                                <div className="form-group">
                                    <label className="form-label">Client Name *</label>
                                    <input 
                                        type="text" 
                                        className={`form-input ${errors.clientName ? 'error' : ''}`}
                                        name="clientName"
                                        placeholder="e.g. Skyline Developers Inc"
                                        value={formData.clientName}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                    />
                                    {errors.clientName && <span className="input-error-msg">{errors.clientName}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Client Email</label>
                                    <input 
                                        type="text" 
                                        className={`form-input ${errors.clientEmail ? 'error' : ''}`}
                                        name="clientEmail"
                                        placeholder="client@corporate.com"
                                        value={formData.clientEmail}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                    />
                                    {errors.clientEmail && <span className="input-error-msg">{errors.clientEmail}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Client Contact Phone</label>
                                    <input 
                                        type="text" 
                                        className="form-input"
                                        name="clientContact"
                                        placeholder="e.g. +91 98765 43210"
                                        value={formData.clientContact}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Project Location */}
                        <div className="form-step-section">
                            <div className="form-section-header">
                                <FaMapMarkerAlt /> <span>Location Details</span>
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">Site Address</label>
                                <input 
                                    type="text" 
                                    className="form-input"
                                    name="address"
                                    placeholder="Plot number, Sector, landmark details..."
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                />
                            </div>
                            <div className="form-grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">City *</label>
                                    <input 
                                        type="text" 
                                        className={`form-input ${errors.city ? 'error' : ''}`}
                                        name="city"
                                        placeholder="e.g. Mumbai"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                    />
                                    {errors.city && <span className="input-error-msg">{errors.city}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State</label>
                                    <input 
                                        type="text" 
                                        className="form-input"
                                        name="state"
                                        placeholder="e.g. Maharashtra"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Country</label>
                                    <input 
                                        type="text" 
                                        className="form-input"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Pincode</label>
                                    <input 
                                        type="text" 
                                        className="form-input"
                                        name="pincode"
                                        placeholder="400001"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Timelines & Finance */}
                        <div className="form-step-section">
                            <div className="form-section-header">
                                <FaCoins /> <span>Financial & Timelines</span>
                            </div>
                            <div className="form-grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Estimated Budget *</label>
                                    <input 
                                        type="number" 
                                        className={`form-input ${errors.budget ? 'error' : ''}`}
                                        name="budget"
                                        placeholder="e.g. 25000000"
                                        value={formData.budget}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                    />
                                    {errors.budget && <span className="input-error-msg">{errors.budget}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Currency</label>
                                    <select className="form-input" name="currency" value={formData.currency} onChange={handleInputChange} disabled={saving}>
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Start Date *</label>
                                    <input 
                                        type="date" 
                                        className={`form-input ${errors.startDate ? 'error' : ''}`}
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                    />
                                    {errors.startDate && <span className="input-error-msg">{errors.startDate}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Expected End Date *</label>
                                    <input 
                                        type="date" 
                                        className={`form-input ${errors.expectedEndDate ? 'error' : ''}`}
                                        name="expectedEndDate"
                                        value={formData.expectedEndDate}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                    />
                                    {errors.expectedEndDate && <span className="input-error-msg">{errors.expectedEndDate}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Team */}
                        <div className="form-step-section">
                            <div className="form-section-header">
                                <FaUsers /> <span>Project Supervisory Team</span>
                            </div>
                            <div className="form-grid-3col">
                                <div className="form-group">
                                    <label className="form-label">Project Manager *</label>
                                    <input 
                                        type="text" 
                                        className={`form-input ${errors.projectManager ? 'error' : ''}`}
                                        name="projectManager"
                                        placeholder="e.g. Ramesh Sharma"
                                        value={formData.projectManager}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                    />
                                    {errors.projectManager && <span className="input-error-msg">{errors.projectManager}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Site Engineer</label>
                                    <input 
                                        type="text" 
                                        className="form-input"
                                        name="siteEngineer"
                                        placeholder="e.g. Rajesh Kumar"
                                        value={formData.siteEngineer}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Site Supervisor</label>
                                    <input 
                                        type="text" 
                                        className="form-input"
                                        name="supervisor"
                                        placeholder="e.g. Sunil Yadav"
                                        value={formData.supervisor}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Status & Progress */}
                        <div className="form-step-section">
                            <div className="form-section-header">
                                <FaTasks /> <span>Execution Progress & Status</span>
                            </div>
                            <div className="form-grid-2col">
                                <div className="form-group">
                                    <label className="form-label">Execution Status *</label>
                                    <select className="form-input" name="status" value={formData.status} onChange={handleInputChange} disabled={saving}>
                                        <option value="Planning">Planning</option>
                                        <option value="Active">Active</option>
                                        <option value="On Hold">On Hold</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Work Progress (%) *</label>
                                    <input 
                                        type="number" 
                                        className={`form-input ${errors.progress ? 'error' : ''}`}
                                        name="progress"
                                        min="0"
                                        max="100"
                                        placeholder="e.g. 45"
                                        value={formData.progress}
                                        onChange={handleInputChange}
                                        disabled={saving}
                                    />
                                    {errors.progress && <span className="input-error-msg">{errors.progress}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Section 7: Notes */}
                        <div className="form-step-section" style={{ border: 'none', marginBottom: 0 }}>
                            <div className="form-section-header">
                                <FaRegStickyNote /> <span>Additional Operational Notes</span>
                            </div>
                            <div className="form-group">
                                <textarea 
                                    className="form-input" 
                                    name="notes" 
                                    rows="2" 
                                    placeholder="Enter details on contract variants, environmental approvals, local permits..."
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {/* Form Submission Controls buttons */}
                        <div className="form-actions-bar">
                            {mode === 'create' && (
                                <button type="button" className="btn btn-secondary" onClick={handleResetForm} disabled={saving}>
                                    Reset Form
                                </button>
                            )}
                            <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} disabled={saving}>
                                <FaCheck /> {saving ? 'Saving...' : (mode === 'create' ? 'Create Project Site' : 'Update Project')}
                            </button>
                        </div>
                        
                    </div>
                </form>
            )}
        </DashboardLayout>
    );
}
