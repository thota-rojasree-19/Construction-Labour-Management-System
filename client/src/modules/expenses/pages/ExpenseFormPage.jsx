import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import { 
    FaArrowLeft, 
    FaFolderOpen, 
    FaCoins, 
    FaReceipt, 
    FaRegStickyNote,
    FaCheck,
    FaSync
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/expenses.css';

export default function ExpenseFormPage({ mode = 'create', expenseId = null }) {
    // Check hash route parameter if none passed
    const getExpenseIdFromHash = () => {
        if (mode !== 'edit') return null;
        const hash = window.location.hash;
        const parts = hash.split('/');
        return parts[parts.length - 1];
    };

    const targetExpenseId = expenseId || getExpenseIdFromHash();

    const initialFormState = {
        project: '',
        category: 'Materials',
        expenseTitle: '',
        description: '',
        vendor: '',
        amount: '',
        currency: 'INR',
        paymentMethod: 'Cash',
        expenseDate: new Date().toISOString().split('T')[0],
        invoiceNumber: '',
        receiptUrl: '',
        receiptType: '',
        remarks: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [projects, setProjects] = useState([]);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

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

        // Check if there is a duplication payload in localstorage
        const dupItem = localStorage.getItem('duplicateExpense');
        if (dupItem && mode === 'create') {
            try {
                const parsed = JSON.parse(dupItem);
                setFormData(prev => ({ ...prev, ...parsed }));
                toast.info('Form pre-populated with duplicated values.');
            } catch (e) {}
            localStorage.removeItem('duplicateExpense');
        }

        // Fetch details if edit mode
        if (mode === 'edit' && targetExpenseId) {
            setLoading(true);
            fetch(`/api/v1/expenses/${targetExpenseId}`, { headers })
                .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Failed to retrieve details');
                    return data;
                })
                .then((data) => {
                    const formatted = {
                        ...data,
                        project: data.project?._id || data.project || '',
                        expenseDate: data.expenseDate ? new Date(data.expenseDate).toISOString().split('T')[0] : ''
                    };
                    setFormData(formatted);
                    setLoading(false);
                })
                .catch((err) => {
                    setLoading(false);
                    toast.error(err.message);
                });
        }
    }, [mode, targetExpenseId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? (value === '' ? '' : parseFloat(value)) : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Mock receipt upload
    const handleMockUpload = () => {
        setSaving(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        fetch('/api/v1/expenses/upload-receipt', {
            method: 'POST',
            headers
        })
        .then(res => res.json())
        .then(data => {
            setSaving(false);
            setFormData(prev => ({
                ...prev,
                receiptUrl: data.receiptUrl,
                receiptType: data.receiptType
            }));
            toast.success('Mock receipt file uploaded successfully!');
        })
        .catch(() => {
            setSaving(false);
            toast.error('Mock upload trigger failed');
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.project) newErrors.project = 'Project site allocation is required';
        if (!formData.category) newErrors.category = 'Expense category is required';
        if (!formData.expenseTitle.trim()) newErrors.expenseTitle = 'Expense title is required';
        if (!formData.vendor.trim()) newErrors.vendor = 'Vendor / Supplier name is required';
        if (formData.amount === '' || isNaN(formData.amount) || formData.amount <= 0) {
            newErrors.amount = 'Valid positive amount is required';
        }
        if (!formData.expenseDate) newErrors.expenseDate = 'Expense date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix form validation errors.');
            return;
        }

        setSaving(true);
        const token = localStorage.getItem('token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const endpoint = mode === 'create' ? '/api/v1/expenses' : `/api/v1/expenses/${targetExpenseId}`;
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
            toast.success(mode === 'create' ? 'Expense logged successfully!' : 'Expense updated successfully!');
            setTimeout(() => {
                window.location.hash = '#/expenses';
            }, 1200);
        })
        .catch((err) => {
            setSaving(false);
            toast.error(err.message);
        });
    };

    return (
        <DashboardLayout activePage="Expenses">
            <ToastContainer />

            <div className="db-header no-print" style={{ marginBottom: '20px' }}>
                <div className="db-header-titles">
                    <a href="#/expenses" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                        <FaArrowLeft /> Back to Dashboard
                    </a>
                    <h1>{mode === 'create' ? 'Log Project Expense' : `Edit Expense (${formData.expenseCode || ''})`}</h1>
                    <p>{mode === 'create' ? 'Record material purchases, machinery rentals, utilities bills, or safety equipment outflows.' : 'Modify recorded expense parameters, vendors, or invoice references.'}</p>
                </div>
            </div>

            {loading ? (
                <div className="dashboard-card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner-icon" style={{ borderColor: 'var(--primary) transparent var(--primary) transparent', width: '32px', height: '32px' }}></div>
                    <span style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Retrieving data parameters...</span>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="form-step-container">
                    
                    {/* Section 1: Basic Info */}
                    <div className="form-step-card">
                        <div className="form-step-title">
                            <FaFolderOpen /> Basic Information
                        </div>
                        <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Expense Title *</label>
                                <input 
                                    type="text" 
                                    className={`form-input ${errors.expenseTitle ? 'error' : ''}`}
                                    name="expenseTitle"
                                    placeholder="e.g. Cement bag purchases batch A"
                                    value={formData.expenseTitle}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                />
                                {errors.expenseTitle && <span className="input-error-msg">{errors.expenseTitle}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Project Site *</label>
                                <select 
                                    className={`form-input ${errors.project ? 'error' : ''}`}
                                    name="project"
                                    value={formData.project}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                >
                                    <option value="">-- Select Project Site --</option>
                                    {projects.map(p => (
                                        <option key={p._id} value={p._id}>{p.projectName}</option>
                                    ))}
                                </select>
                                {errors.project && <span className="input-error-msg">{errors.project}</span>}
                            </div>
                        </div>

                        <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Expense Category *</label>
                                <select 
                                    className="form-input"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                >
                                    {categories.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Vendor / Supplier *</label>
                                <input 
                                    type="text" 
                                    className={`form-input ${errors.vendor ? 'error' : ''}`}
                                    name="vendor"
                                    placeholder="e.g. Birla Cement Corporation"
                                    value={formData.vendor}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                />
                                {errors.vendor && <span className="input-error-msg">{errors.vendor}</span>}
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label className="form-label">Scope Description</label>
                            <textarea 
                                className="form-input" 
                                name="description" 
                                rows="2" 
                                placeholder="Enter specifications, quantities, variants details..."
                                value={formData.description}
                                onChange={handleInputChange}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* Section 2: Financial Details */}
                    <div className="form-step-card">
                        <div className="form-step-title">
                            <FaCoins /> Financial Details
                        </div>
                        <div className="form-grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Expense Amount (₹) *</label>
                                <input 
                                    type="number" 
                                    className={`form-input ${errors.amount ? 'error' : ''}`}
                                    name="amount"
                                    placeholder="e.g. 75000"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                />
                                {errors.amount && <span className="input-error-msg">{errors.amount}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Payment Method *</label>
                                <select 
                                    className="form-input"
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Card">Card</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Expense Date *</label>
                                <input 
                                    type="date" 
                                    className={`form-input ${errors.expenseDate ? 'error' : ''}`}
                                    name="expenseDate"
                                    value={formData.expenseDate}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                />
                                {errors.expenseDate && <span className="input-error-msg">{errors.expenseDate}</span>}
                            </div>
                        </div>

                        <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Invoice Number</label>
                                <input 
                                    type="text" 
                                    className="form-input"
                                    name="invoiceNumber"
                                    placeholder="e.g. INV-2026-987"
                                    value={formData.invoiceNumber}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Receipt Upload */}
                    <div className="form-step-card">
                        <div className="form-step-title">
                            <FaReceipt /> Receipt / Invoice Attachment
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                            {formData.receiptUrl ? (
                                <div className="receipt-preview-frame">
                                    <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--success)' }}>
                                        Receipt Loaded: {formData.receiptUrl}
                                    </span>
                                    <div style={{ padding: '20px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaReceipt style={{ fontSize: '24px', color: 'var(--primary)' }} />
                                        <span style={{ fontSize: '12px' }}>Click view receipt on details page to audit file receipt.</span>
                                    </div>
                                    <button type="button" className="btn btn-secondary" style={{ marginTop: '12px', fontSize: '12px' }} onClick={() => setFormData(prev => ({ ...prev, receiptUrl: '', receiptType: '' }))}>
                                        Remove Receipt
                                    </button>
                                </div>
                            ) : (
                                <div className="receipt-preview-frame" style={{ width: '100%' }}>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                                        Upload invoice vouchers, cash receipts, or PDF bills.
                                    </p>
                                    <button type="button" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={handleMockUpload} disabled={saving}>
                                        <FaReceipt /> Upload Mock Receipt
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 4: Notes */}
                    <div className="form-step-card">
                        <div className="form-step-title">
                            <FaRegStickyNote /> Remarks & Additional Notes
                        </div>
                        <div className="form-group">
                            <textarea 
                                className="form-input" 
                                name="remarks" 
                                rows="2" 
                                placeholder="Enter internal accounting comments or budget variance notes..."
                                value={formData.remarks}
                                onChange={handleInputChange}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="form-actions-bar" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <a href="#/expenses/list" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                            Cancel
                        </a>
                        <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} disabled={saving}>
                            <FaCheck /> {saving ? 'Saving...' : (mode === 'create' ? 'Record Expense' : 'Save Changes')}
                        </button>
                    </div>

                </form>
            )}
        </DashboardLayout>
    );
}
