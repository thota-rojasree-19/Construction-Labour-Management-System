import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import { 
    FaArrowLeft, FaUser, FaBriefcase, FaExchangeAlt, FaFileAlt, 
    FaCheck, FaChevronLeft, FaChevronRight, FaCamera
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/labour.css';

export default function LabourFormPage({ mode = 'create', labourId = null }) {
    // 1. Initial State structure
    const initialFormState = {
        firstName: '',
        lastName: '',
        gender: 'Male',
        dateOfBirth: '',
        email: '',
        mobileNumber: '',
        emergencyContact: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        tradeCategory: 'Helper',
        skillLevel: 'Unskilled',
        experience: 0,
        dailyWage: '',
        employmentType: 'Contract',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        assignedProject: '',
        supervisor: '',
        shift: 'General',
        photo: '',
        notes: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [projects, setProjects] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch projects for assignment dropdown list
    useEffect(() => {
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
            if (res.ok) setProjects(data.projects);
        })
        .catch(err => console.error('Failed to load projects:', err.message));
    }, []);

    // Fetch existing details if edit mode is active
    useEffect(() => {
        if (mode === 'edit' && labourId) {
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
                const formattedData = {
                    ...data,
                    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
                    joiningDate: data.joiningDate ? new Date(data.joiningDate).toISOString().split('T')[0] : '',
                    assignedProject: data.assignedProject ? (data.assignedProject._id || data.assignedProject) : ''
                };
                setFormData(formattedData);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                toast.error(err.message);
            });
        }
    }, [mode, labourId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'experience' || name === 'dailyWage' ? (value === '' ? '' : parseFloat(value)) : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Age Auto-Calculation
    const getCalculatedAge = () => {
        if (!formData.dateOfBirth) return 'N/A';
        const dob = new Date(formData.dateOfBirth);
        const ageDiff = Date.now() - dob.getTime();
        const ageDate = new Date(ageDiff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    // Step verification validations
    const validateStep = (step) => {
        const stepErrors = {};
        
        if (step === 1) {
            if (!formData.firstName.trim()) stepErrors.firstName = 'First name is required';
            if (!formData.gender) stepErrors.gender = 'Gender selection is required';
            if (!formData.dateOfBirth) stepErrors.dateOfBirth = 'Date of birth is required';
            if (!formData.mobileNumber.trim()) stepErrors.mobileNumber = 'Mobile number is required';
            if (!formData.emergencyContact.trim()) stepErrors.emergencyContact = 'Emergency contact phone is required';
            if (!formData.city.trim()) stepErrors.city = 'City location is required';

            if (formData.email.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) {
                    stepErrors.email = 'Invalid email address format';
                }
            }
        }
        
        if (step === 2) {
            if (!formData.tradeCategory) stepErrors.tradeCategory = 'Trade category is required';
            if (!formData.skillLevel) stepErrors.skillLevel = 'Skill level selection is required';
            if (formData.dailyWage === '' || isNaN(formData.dailyWage) || formData.dailyWage <= 0) {
                stepErrors.dailyWage = 'Valid daily wage amount (₹) is required';
            }
            if (formData.experience === '' || isNaN(formData.experience) || formData.experience < 0) {
                stepErrors.experience = 'Experience must be a positive integer';
            }
            if (!formData.joiningDate) stepErrors.joiningDate = 'Employment joining date is required';
        }

        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    const handleNextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        } else {
            toast.error('Please resolve missing required fields before proceeding');
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1);
        setErrors({});
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        // Validate final step
        if (!validateStep(2)) {
            setCurrentStep(2);
            toast.error('Please fix errors in step 2 (Employment Info)');
            return;
        }
        if (!validateStep(1)) {
            setCurrentStep(1);
            toast.error('Please fix errors in step 1 (Personal Info)');
            return;
        }

        setSaving(true);
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const endpoint = mode === 'create' ? '/api/v1/labours' : `/api/v1/labours/${labourId}`;
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
            toast.success(mode === 'create' ? 'Labour profile registered successfully!' : 'Labour details updated successfully!');
            setTimeout(() => {
                window.location.hash = '#/labour';
            }, 1200);
        })
        .catch((err) => {
            setSaving(false);
            toast.error(err.message);
        });
    };

    return (
        <DashboardLayout activePage="Labour">
            <ToastContainer />

            {/* Back action title header */}
            <div className="db-header" style={{ marginBottom: '20px' }}>
                <div className="db-header-titles">
                    <a href="#/labour" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                        <FaArrowLeft /> Back to Workforce List
                    </a>
                    <h1>{mode === 'create' ? 'Register Workforce Profile' : `Edit Workforce Profile (${formData.employeeId || ''})`}</h1>
                    <p>{mode === 'create' ? 'Fill out the 4-step wizard form to onboard a new worker.' : 'Update personal info, skills, or active assignments.'}</p>
                </div>
            </div>

            {loading ? (
                <div className="dashboard-card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner-icon" style={{ borderColor: 'var(--primary) transparent var(--primary) transparent', width: '32px', height: '32px' }}></div>
                    <span style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Retrieving fields...</span>
                </div>
            ) : (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    
                    {/* Step wizard progress bar */}
                    <div className="wizard-progress-bar">
                        <div className={`wizard-step ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>1</div>
                        <div className={`wizard-step ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>2</div>
                        <div className={`wizard-step ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>3</div>
                        <div className={`wizard-step ${currentStep === 4 ? 'active' : ''}`}>4</div>
                    </div>

                    <form onSubmit={handleFormSubmit}>
                        <div className="form-section-container">
                            
                            {/* STEP 1: Personal Info */}
                            {currentStep === 1 && (
                                <div className="form-step-section" style={{ border: 'none', margin: 0, padding: 0 }}>
                                    <div className="form-section-header">
                                        <FaUser /> <span>1. Personal Information</span>
                                    </div>
                                    
                                    <div className="form-grid-2col">
                                        <div className="form-group">
                                            <label className="form-label">First Name *</label>
                                            <input type="text" className={`form-input ${errors.firstName ? 'error' : ''}`} name="firstName" placeholder="e.g. Ramesh" value={formData.firstName} onChange={handleInputChange} disabled={saving} />
                                            {errors.firstName && <span className="input-error-msg">{errors.firstName}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Last Name</label>
                                            <input type="text" className="form-input" name="lastName" placeholder="e.g. Yadav" value={formData.lastName} onChange={handleInputChange} disabled={saving} />
                                        </div>
                                    </div>

                                    <div className="form-grid-3col" style={{ marginTop: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Gender *</label>
                                            <select className="form-input" name="gender" value={formData.gender} onChange={handleInputChange} disabled={saving}>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Date of Birth *</label>
                                            <input type="date" className={`form-input ${errors.dateOfBirth ? 'error' : ''}`} name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} disabled={saving} />
                                            {errors.dateOfBirth && <span className="input-error-msg">{errors.dateOfBirth}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Age (Auto-computed)</label>
                                            <input type="text" className="form-input" value={getCalculatedAge()} disabled style={{ opacity: 0.7, backgroundColor: 'var(--background)' }} />
                                        </div>
                                    </div>

                                    <div className="form-grid-3col" style={{ marginTop: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Mobile Number *</label>
                                            <input type="tel" className={`form-input ${errors.mobileNumber ? 'error' : ''}`} name="mobileNumber" placeholder="9876543210" value={formData.mobileNumber} onChange={handleInputChange} disabled={saving} />
                                            {errors.mobileNumber && <span className="input-error-msg">{errors.mobileNumber}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Email Address</label>
                                            <input type="email" className={`form-input ${errors.email ? 'error' : ''}`} name="email" placeholder="worker@gmail.com" value={formData.email} onChange={handleInputChange} disabled={saving} />
                                            {errors.email && <span className="input-error-msg">{errors.email}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Emergency Contact Phone *</label>
                                            <input type="tel" className={`form-input ${errors.emergencyContact ? 'error' : ''}`} name="emergencyContact" placeholder="98765 00000" value={formData.emergencyContact} onChange={handleInputChange} disabled={saving} />
                                            {errors.emergencyContact && <span className="input-error-msg">{errors.emergencyContact}</span>}
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginTop: '16px' }}>
                                        <label className="form-label">Home Address</label>
                                        <input type="text" className="form-input" name="address" placeholder="House number, Street, Landmark details..." value={formData.address} onChange={handleInputChange} disabled={saving} />
                                    </div>

                                    <div className="form-grid-3col" style={{ marginTop: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">City *</label>
                                            <input type="text" className={`form-input ${errors.city ? 'error' : ''}`} name="city" placeholder="e.g. Pune" value={formData.city} onChange={handleInputChange} disabled={saving} />
                                            {errors.city && <span className="input-error-msg">{errors.city}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">State</label>
                                            <input type="text" className="form-input" name="state" placeholder="e.g. Maharashtra" value={formData.state} onChange={handleInputChange} disabled={saving} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Pincode</label>
                                            <input type="text" className="form-input" name="pincode" placeholder="411001" value={formData.pincode} onChange={handleInputChange} disabled={saving} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Employment Details */}
                            {currentStep === 2 && (
                                <div className="form-step-section" style={{ border: 'none', margin: 0, padding: 0 }}>
                                    <div className="form-section-header">
                                        <FaBriefcase /> <span>2. Employment Details</span>
                                    </div>
                                    
                                    <div className="form-grid-3col">
                                        <div className="form-group">
                                            <label className="form-label">Trade Category *</label>
                                            <select className="form-input" name="tradeCategory" value={formData.tradeCategory} onChange={handleInputChange} disabled={saving}>
                                                <option value="Helper">Helper</option>
                                                <option value="Mason">Mason</option>
                                                <option value="Carpenter">Carpenter</option>
                                                <option value="Electrician">Electrician</option>
                                                <option value="Plumber">Plumber</option>
                                                <option value="Painter">Painter</option>
                                                <option value="Steel Fixer">Steel Fixer</option>
                                                <option value="Welder">Welder</option>
                                                <option value="Machine Operator">Machine Operator</option>
                                                <option value="Civil Engineer">Civil Engineer</option>
                                                <option value="Site Supervisor">Site Supervisor</option>
                                                <option value="Surveyor">Surveyor</option>
                                                <option value="Crane Operator">Crane Operator</option>
                                                <option value="Concrete Worker">Concrete Worker</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Skill Level *</label>
                                            <select className="form-input" name="skillLevel" value={formData.skillLevel} onChange={handleInputChange} disabled={saving}>
                                                <option value="Unskilled">Unskilled</option>
                                                <option value="Semi-skilled">Semi-skilled</option>
                                                <option value="Skilled">Skilled</option>
                                                <option value="Highly-skilled">Highly-skilled</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Daily Work Wage (₹) *</label>
                                            <input type="number" className={`form-input ${errors.dailyWage ? 'error' : ''}`} name="dailyWage" placeholder="e.g. 600" value={formData.dailyWage} onChange={handleInputChange} disabled={saving} />
                                            {errors.dailyWage && <span className="input-error-msg">{errors.dailyWage}</span>}
                                        </div>
                                    </div>

                                    <div className="form-grid-3col" style={{ marginTop: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Years of Experience *</label>
                                            <input type="number" className={`form-input ${errors.experience ? 'error' : ''}`} name="experience" placeholder="e.g. 4" value={formData.experience} onChange={handleInputChange} disabled={saving} />
                                            {errors.experience && <span className="input-error-msg">{errors.experience}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Employment Type *</label>
                                            <select className="form-input" name="employmentType" value={formData.employmentType} onChange={handleInputChange} disabled={saving}>
                                                <option value="Permanent">Permanent</option>
                                                <option value="Contract">Contract</option>
                                                <option value="Casual">Casual</option>
                                                <option value="Temporary">Temporary</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Joining Date *</label>
                                            <input type="date" className={`form-input ${errors.joiningDate ? 'error' : ''}`} name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} disabled={saving} />
                                            {errors.joiningDate && <span className="input-error-msg">{errors.joiningDate}</span>}
                                        </div>
                                    </div>

                                    <div className="form-grid-2col" style={{ marginTop: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Employment Status *</label>
                                            <select className="form-input" name="status" value={formData.status} onChange={handleInputChange} disabled={saving}>
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                                <option value="Suspended">Suspended</option>
                                                <option value="Left">Left</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Project Assignment */}
                            {currentStep === 3 && (
                                <div className="form-step-section" style={{ border: 'none', margin: 0, padding: 0 }}>
                                    <div className="form-section-header">
                                        <FaExchangeAlt /> <span>3. Initial Project Site Assignment</span>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Assign Construction Site</label>
                                        <select className="form-input" name="assignedProject" value={formData.assignedProject} onChange={handleInputChange} disabled={saving}>
                                            <option value="">-- Leave Unassigned (Mark Available) --</option>
                                            {projects.map(p => (
                                                <option key={p._id} value={p._id}>{p.projectName} ({p.projectCode})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-grid-2col" style={{ marginTop: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Site Supervisor Name</label>
                                            <input type="text" className="form-input" name="supervisor" placeholder="e.g. Sunil Yadav" value={formData.supervisor} onChange={handleInputChange} disabled={saving} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Daily Shift Schedule</label>
                                            <select className="form-input" name="shift" value={formData.shift} onChange={handleInputChange} disabled={saving}>
                                                <option value="General">General</option>
                                                <option value="Day">Day</option>
                                                <option value="Night">Night</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: Photo & notes */}
                            {currentStep === 4 && (
                                <div className="form-step-section" style={{ border: 'none', margin: 0, padding: 0 }}>
                                    <div className="form-section-header">
                                        <FaFileAlt /> <span>4. Profile Documents & Notes</span>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Profile Photo URL (Optional)</label>
                                        <div className="photo-input-row">
                                            <div className="profile-avatar-frame">
                                                {formData.photo ? (
                                                    <img src={formData.photo} alt="Preview Avatar" />
                                                ) : (
                                                    <FaCamera className="profile-avatar-placeholder" />
                                                )}
                                            </div>
                                            <input 
                                                type="text" 
                                                className="form-input" 
                                                style={{ flex: 1 }}
                                                name="photo" 
                                                placeholder="https://images.unsplash.com/... or avatar image url" 
                                                value={formData.photo}
                                                onChange={handleInputChange}
                                                disabled={saving}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginTop: '20px' }}>
                                        <label className="form-label">Medical History / Safety Notes</label>
                                        <textarea 
                                            className="form-input" 
                                            name="notes" 
                                            rows="4" 
                                            placeholder="Specify medical histories, site safety violations, or special capabilities..."
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            disabled={saving}
                                            style={{ resize: 'vertical' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Navigation wizard controls */}
                            <div className="form-actions-bar" style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                                {currentStep > 1 && (
                                    <button type="button" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={handlePrevStep} disabled={saving}>
                                        <FaChevronLeft /> Prev Step
                                    </button>
                                )}
                                
                                {currentStep < 4 ? (
                                    <button type="button" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={handleNextStep}>
                                        Next Step <FaChevronRight />
                                    </button>
                                ) : (
                                    <button type="submit" className="btn btn-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--success)' }} disabled={saving}>
                                        <FaCheck /> {saving ? 'Registering...' : (mode === 'create' ? 'Register worker Profile' : 'Update Profile')}
                                    </button>
                                )}
                            </div>

                        </div>
                    </form>

                </div>
            )}
        </DashboardLayout>
    );
}
