import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import LoadingSkeleton from '../../attendance/components/LoadingSkeleton';
import { 
    FaArrowLeft, 
    FaCoins, 
    FaSave, 
    FaUserCircle,
    FaRegCalendarAlt,
    FaInfoCircle
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/payroll.css';

export default function AdvanceFormPage() {
    const [workers, setWorkers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [saving, setSaving] = useState(false);
    const [advances, setAdvances] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    const [formData, setFormData] = useState({
        worker: '',
        project: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        reason: '',
        remarks: ''
    });

    const [errors, setErrors] = useState({});

    // Fetch workers and projects dropdown
    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        fetch('/api/v1/labours?limit=100', { headers })
            .then(res => res.json())
            .then(data => {
                if (data && data.labours) setWorkers(data.labours);
            })
            .catch(() => {});

        fetch('/api/v1/projects', { headers })
            .then(res => res.json())
            .then(data => {
                if (data && data.projects) setProjects(data.projects);
            })
            .catch(() => {});

        fetchAdvances();
    }, []);

    const fetchAdvances = () => {
        setLoadingList(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        fetch('/api/v1/payroll/advance', { headers })
            .then(res => res.json())
            .then(data => {
                setAdvances(data || []);
                setLoadingList(false);
            })
            .catch(() => setLoadingList(false));
    };

    // Auto fill worker project if assigned project changes
    const handleWorkerChange = (e) => {
        const workerId = e.target.value;
        const selected = workers.find(w => w._id === workerId);
        
        setFormData(prev => ({
            ...prev,
            worker: workerId,
            project: selected && selected.assignedProject ? selected.assignedProject._id : ''
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? (value === '' ? '' : parseFloat(value)) : value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.worker) newErrors.worker = 'Worker selection is required';
        if (!formData.project) newErrors.project = 'Project site allocation is required';
        if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0) {
            newErrors.amount = 'Valid positive advance amount is required';
        }
        if (!formData.date) newErrors.date = 'Date of disbursement is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSaving(true);
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        fetch('/api/v1/payroll/advance', {
            method: 'POST',
            headers,
            body: JSON.stringify(formData)
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Saving failed');
            return data;
        })
        .then(() => {
            setSaving(false);
            toast.success('Cash advance registered successfully!');
            // Reset form except date
            setFormData({
                worker: '',
                project: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                reason: '',
                remarks: ''
            });
            fetchAdvances();
        })
        .catch((err) => {
            setSaving(false);
            toast.error(err.message);
        });
    };

    return (
        <DashboardLayout activePage="Payroll">
            <ToastContainer />

            <div className="db-header" style={{ marginBottom: '20px' }}>
                <div className="db-header-titles">
                    <a href="#/payroll" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                        <FaArrowLeft /> Back to Dashboard
                    </a>
                    <h1>Record Cash Advance</h1>
                    <p>Record salary advances given to workers. Outstanding balances will be auto-deducted on month-end calculations.</p>
                </div>
            </div>

            <div className="details-grid">
                
                {/* Advance entry form */}
                <div className="grid-col-5">
                    <div className="dashboard-card">
                        <div className="card-header-row" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '15px' }}><FaCoins /> New Advance Disbursement</h3>
                        </div>

                        <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">Select Worker *</label>
                                <select 
                                    className={`form-input ${errors.worker ? 'error' : ''}`}
                                    name="worker"
                                    value={formData.worker}
                                    onChange={handleWorkerChange}
                                >
                                    <option value="">-- Choose Worker --</option>
                                    {workers.map(w => (
                                        <option key={w._id} value={w._id}>{w.fullName} ({w.employeeId})</option>
                                    ))}
                                </select>
                                {errors.worker && <span className="input-error-msg">{errors.worker}</span>}
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">Project Site *</label>
                                <select 
                                    className={`form-input ${errors.project ? 'error' : ''}`}
                                    name="project"
                                    value={formData.project}
                                    onChange={handleInputChange}
                                >
                                    <option value="">-- Choose Project --</option>
                                    {projects.map(p => (
                                        <option key={p._id} value={p._id}>{p.projectName}</option>
                                    ))}
                                </select>
                                {errors.project && <span className="input-error-msg">{errors.project}</span>}
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">Advance Amount (₹) *</label>
                                <input 
                                    type="number"
                                    name="amount"
                                    placeholder="e.g. 5000"
                                    className={`form-input ${errors.amount ? 'error' : ''}`}
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                />
                                {errors.amount && <span className="input-error-msg">{errors.amount}</span>}
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">Disbursement Date *</label>
                                <input 
                                    type="date"
                                    name="date"
                                    className={`form-input ${errors.date ? 'error' : ''}`}
                                    value={formData.date}
                                    onChange={handleInputChange}
                                />
                                {errors.date && <span className="input-error-msg">{errors.date}</span>}
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">Reason / Notes</label>
                                <input 
                                    type="text"
                                    name="reason"
                                    placeholder="e.g. Medical emergency"
                                    className="form-input"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center', marginTop: '12px' }} disabled={saving}>
                                <FaSave /> {saving ? 'Recording...' : 'Record Advance Payout'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* History Ledger list */}
                <div className="grid-col-7">
                    <div className="dashboard-card">
                        <div className="card-header-row" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '15px' }}>Recent Disbursed Advances</h3>
                        </div>

                        <div className="table-responsive" style={{ marginTop: '16px' }}>
                            <table className="project-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Worker</th>
                                        <th>Project</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                {loadingList ? (
                                    <LoadingSkeleton rows={4} cols={5} />
                                ) : advances.length === 0 ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                                No cash advances recorded recently.
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    <tbody>
                                        {advances.map(adv => (
                                            <tr key={adv._id}>
                                                <td>
                                                    <span style={{ fontSize: '12px', fontWeight: 600 }}>
                                                        {new Date(adv.date).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: 600 }}>{adv.worker?.fullName}</span>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{adv.worker?.employeeId}</span>
                                                    </div>
                                                </td>
                                                <td>{adv.project?.projectName}</td>
                                                <td>
                                                    <strong>₹{adv.amount}</strong>
                                                </td>
                                                <td>
                                                    <span style={{ 
                                                        fontSize: '10px', 
                                                        fontWeight: 700, 
                                                        padding: '2px 8px', 
                                                        borderRadius: '12px', 
                                                        backgroundColor: adv.isDeducted ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', 
                                                        color: adv.isDeducted ? 'var(--success)' : 'var(--warning)',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {adv.isDeducted ? 'Deducted' : 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                )}
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
