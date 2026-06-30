import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import LoadingSkeleton from '../../attendance/components/LoadingSkeleton';
import EmptyState from '../../attendance/components/EmptyState';
import { 
    FaArrowLeft, 
    FaSync, 
    FaCalculator, 
    FaSave, 
    FaUserCircle,
    FaInfoCircle
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/payroll.css';

export default function GeneratePayrollPage() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    
    const [loading, setLoading] = useState(false);
    const [workforce, setWorkforce] = useState([]); // List of worker preview calculations
    const [saving, setSaving] = useState(false);

    // Fetch projects dropdown
    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        fetch('/api/v1/projects', { headers })
            .then(res => res.json())
            .then(data => {
                if (data && data.projects) {
                    setProjects(data.projects);
                    if (data.projects.length > 0) {
                        setSelectedProject(data.projects[0]._id);
                    }
                }
            })
            .catch(() => {});
    }, []);

    // Load workforce and calculate preview salaries
    const calculateSalaries = () => {
        if (!selectedProject || !selectedMonth) return;

        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        // 1. Fetch active workers for project
        fetch(`/api/v1/labours?assignedProject=${selectedProject}&limit=100`, { headers })
            .then(res => res.json())
            .then(async (data) => {
                const workersList = data.labours || [];
                if (workersList.length === 0) {
                    setWorkforce([]);
                    setLoading(false);
                    return;
                }

                // 2. Fetch previews for each worker
                const previewPromises = workersList.map(worker => {
                    return fetch(`/api/v1/payroll/preview?workerId=${worker._id}&month=${selectedMonth}`, { headers })
                        .then(res => res.json())
                        .then(preview => ({
                            ...preview,
                            workerId: worker._id,
                            employeeId: worker.employeeId,
                            fullName: worker.fullName,
                            tradeCategory: worker.tradeCategory,
                            bonusInput: 0,
                            penaltyInput: 0,
                            remarksInput: '',
                            isGenerated: false
                        }))
                        .catch(() => null);
                });

                const results = await Promise.all(previewPromises);
                setWorkforce(results.filter(r => r !== null));
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                toast.error(err.message);
            });
    };

    useEffect(() => {
        calculateSalaries();
    }, [selectedProject, selectedMonth]);

    const handleValueChange = (workerId, field, val) => {
        setWorkforce(prev => prev.map(w => {
            if (w.workerId === workerId) {
                const updated = {
                    ...w,
                    [field]: val
                };
                
                // Recalculate netPayable
                const bonus = field === 'bonusInput' ? parseFloat(val) || 0 : parseFloat(w.bonusInput) || 0;
                const penalty = field === 'penaltyInput' ? parseFloat(val) || 0 : parseFloat(w.penaltyInput) || 0;
                const gross = w.grossSalary;
                const advance = w.advanceAmount;
                
                updated.netPayable = Math.max(0, gross - advance + bonus - penalty);
                return updated;
            }
            return w;
        }));
    };

    // Save individual payroll record
    const handleGeneratePayrollRow = (row) => {
        setSaving(true);
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const payload = {
            worker: row.workerId,
            project: selectedProject,
            month: selectedMonth,
            bonus: parseFloat(row.bonusInput) || 0,
            penalty: parseFloat(row.penaltyInput) || 0,
            remarks: row.remarksInput || ''
        };

        fetch('/api/v1/payroll/generate', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Generation failed');
            return data;
        })
        .then(() => {
            setSaving(false);
            toast.success(`Payroll generated successfully for ${row.fullName}`);
            // Flag as generated in state
            setWorkforce(prev => prev.map(w => {
                if (w.workerId === row.workerId) {
                    return { ...w, isGenerated: true };
                }
                return w;
            }));
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
                    <h1>Payroll Generation Wizard</h1>
                    <p>Select month and project site to compile attendance records and automatically compute salaries.</p>
                </div>
            </div>

            {/* Select panel */}
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
                        <label className="form-label" style={{ fontWeight: 700 }}>Payroll Month Period *</label>
                        <input 
                            type="month" 
                            className="form-input"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {selectedProject && (
                <div className="dashboard-card">
                    <div className="card-header-row" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '15px' }}>Calculation Preview sheet ({workforce.length})</h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <FaInfoCircle /> Calculations: Days × Wage - Advance + Bonus - Penalty.
                        </span>
                    </div>

                    <div className="table-responsive">
                        <table className="project-table">
                            <thead>
                                <tr>
                                    <th>Worker</th>
                                    <th>Attendance Days</th>
                                    <th>Daily Wage</th>
                                    <th>Gross Wage</th>
                                    <th>Advances Deducted</th>
                                    <th>Bonus Amount</th>
                                    <th>Penalty Amount</th>
                                    <th>Net Payable</th>
                                    <th>Remarks</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            {loading ? (
                                <LoadingSkeleton rows={4} cols={10} />
                            ) : workforce.length === 0 ? (
                                <tbody>
                                    <tr>
                                        <td colSpan="10">
                                            <EmptyState 
                                                title="No Workers Allocated"
                                                description="There are no active workers assigned to this project site."
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            ) : (
                                <tbody>
                                    {workforce.map(row => (
                                        <tr key={row.workerId} style={{ opacity: row.isGenerated ? 0.6 : 1 }}>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 600 }}>{row.fullName}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.employeeId} | {row.tradeCategory}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <strong>{row.attendanceDays} days</strong>
                                            </td>
                                            <td>₹{row.dailyWage}</td>
                                            <td>₹{row.grossSalary}</td>
                                            <td style={{ color: 'var(--danger)' }}>
                                                {row.advanceAmount > 0 ? `-₹${row.advanceAmount}` : '₹0'}
                                            </td>
                                            <td>
                                                <input 
                                                    type="number"
                                                    className="form-input"
                                                    style={{ width: '80px', padding: '4px 6px', fontSize: '12px' }}
                                                    value={row.bonusInput}
                                                    disabled={row.isGenerated}
                                                    onChange={(e) => handleValueChange(row.workerId, 'bonusInput', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="number"
                                                    className="form-input"
                                                    style={{ width: '80px', padding: '4px 6px', fontSize: '12px' }}
                                                    value={row.penaltyInput}
                                                    disabled={row.isGenerated}
                                                    onChange={(e) => handleValueChange(row.workerId, 'penaltyInput', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <strong style={{ color: 'var(--success)', fontSize: '14px' }}>
                                                    ₹{row.netPayable.toLocaleString('en-IN')}
                                                </strong>
                                            </td>
                                            <td>
                                                <input 
                                                    type="text"
                                                    placeholder="Remarks..."
                                                    className="form-input"
                                                    style={{ width: '120px', padding: '4px 8px', fontSize: '12px' }}
                                                    value={row.remarksInput}
                                                    disabled={row.isGenerated}
                                                    onChange={(e) => handleValueChange(row.workerId, 'remarksInput', e.target.value)}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                {row.isGenerated ? (
                                                    <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '12px' }}>Generated</span>
                                                ) : (
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-primary"
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '6px 10px' }}
                                                        onClick={() => handleGeneratePayrollRow(row)}
                                                        disabled={saving}
                                                    >
                                                        <FaCalculator /> Generate
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            )}
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
