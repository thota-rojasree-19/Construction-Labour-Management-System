import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import { 
    FaArrowLeft, 
    FaPrint, 
    FaUser, 
    FaBriefcase, 
    FaCalculator, 
    FaCheckCircle,
    FaRegCalendarAlt,
    FaCheck
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/payroll.css';

export default function PayrollDetailPage({ payrollId: propPayrollId = null }) {
    const getPayrollIdFromHash = () => {
        const hash = window.location.hash;
        const parts = hash.split('/');
        return parts[parts.length - 1];
    };

    const payrollId = propPayrollId || getPayrollIdFromHash();

    const [loading, setLoading] = useState(true);
    const [payroll, setPayroll] = useState(null);

    useEffect(() => {
        if (!payrollId) return;

        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        fetch(`/api/v1/payroll/${payrollId}`, { headers })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to load details');
                return data;
            })
            .then((data) => {
                setPayroll(data);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                toast.error(err.message);
            });
    }, [payrollId]);

    const handlePrint = () => {
        window.print();
    };

    const handleMarkAsPaid = () => {
        if (!window.confirm('Mark this payroll as PAID?')) return;

        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        fetch(`/api/v1/payroll/${payrollId}/mark-paid`, {
            method: 'PATCH',
            headers
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to pay');
            return data;
        })
        .then((data) => {
            setPayroll(data.payroll);
            toast.success('Payroll marked paid!');
        })
        .catch((err) => toast.error(err.message));
    };

    return (
        <DashboardLayout activePage="Payroll">
            <ToastContainer />

            <div className="db-header no-print" style={{ marginBottom: '20px' }}>
                <div className="db-header-titles">
                    <a href="#/payroll/list" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                        <FaArrowLeft /> Back to Ledger
                    </a>
                    <h1>Payroll Details audit</h1>
                    <p>Audit worker payroll details, salary calculations equations, and print payslips.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {payroll && payroll.paymentStatus !== 'Paid' && (
                        <button type="button" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--success)', borderColor: 'var(--success)' }} onClick={handleMarkAsPaid}>
                            <FaCheck /> Mark as Paid
                        </button>
                    )}
                    <button type="button" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={handlePrint}>
                        <FaPrint /> Print Payslip
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="dashboard-card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner-icon" style={{ borderColor: 'var(--primary) transparent var(--primary) transparent', width: '32px', height: '32px' }}></div>
                    <span style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Retrieving payroll metrics...</span>
                </div>
            ) : !payroll ? (
                <div className="dashboard-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <h3>Record Not Found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>The requested payroll details could not be retrieved.</p>
                </div>
            ) : (
                <div className="details-grid">
                    
                    {/* Calculation details left */}
                    <div className="grid-col-5 no-print">
                        <div className="dashboard-card" style={{ gap: '20px' }}>
                            <div className="card-header-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                <h3><FaCalculator /> Salary Equation Steps</h3>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    Calculation formula:
                                    <div style={{ padding: '8px', marginTop: '6px', backgroundColor: 'var(--background)', borderRadius: '6px', fontFamily: 'monospace', fontWeight: 600, fontSize: '11px' }}>
                                        Gross = Days * Wage<br/>
                                        Net = Gross - Advance + Bonus - Penalty
                                    </div>
                                </div>

                                <div className="calc-breakdown-card">
                                    <div className="calc-step-row">
                                        <span className="calc-step-label">Attendance Days</span>
                                        <span className="calc-step-value">{payroll.attendanceDays} days</span>
                                    </div>
                                    <div className="calc-step-row">
                                        <span className="calc-step-label">Daily Wage Rate</span>
                                        <span className="calc-step-value">₹{payroll.dailyWage} / day</span>
                                    </div>
                                    <div className="calc-step-row" style={{ borderBottom: '2px solid var(--border-color)' }}>
                                        <span className="calc-step-label" style={{ fontWeight: 700, color: 'var(--text-main)' }}>Gross Wage</span>
                                        <span className="calc-step-value" style={{ fontSize: '16px', color: 'var(--primary)' }}>₹{payroll.grossSalary}</span>
                                    </div>
                                    <div className="calc-step-row">
                                        <span className="calc-step-label">Advance deducted</span>
                                        <span className="calc-step-value" style={{ color: 'var(--danger)' }}>-₹{payroll.advanceAmount}</span>
                                    </div>
                                    <div className="calc-step-row">
                                        <span className="calc-step-label">Bonus additions</span>
                                        <span className="calc-step-value" style={{ color: 'var(--success)' }}>+₹{payroll.bonus}</span>
                                    </div>
                                    <div className="calc-step-row">
                                        <span className="calc-step-label">Penalty deduction</span>
                                        <span className="calc-step-value" style={{ color: 'var(--danger)' }}>-₹{payroll.penalty}</span>
                                    </div>
                                    <div className="calc-step-total">
                                        <span style={{ fontWeight: 700, fontSize: '15px' }}>Net Payable Payout</span>
                                        <strong style={{ fontSize: '20px', color: 'var(--success)' }}>₹{payroll.netPayable.toLocaleString('en-IN')}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payslip Print Container right */}
                    <div className="grid-col-7 payslip-print-area">
                        <div className="payslip-container">
                            <div className="payslip-header">
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>ConstroConnect ERP</h2>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Construction Workforce Management Solutions</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>PAYSLIP REGISTER</h3>
                                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Period: {payroll.month}</span>
                                </div>
                            </div>

                            <div className="payslip-grid">
                                <div>
                                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 6px 0' }}>Employee Details</h4>
                                    <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                        <span>Worker Name: <strong>{payroll.worker?.fullName}</strong></span>
                                        <span>Employee ID: <strong>{payroll.worker?.employeeId}</strong></span>
                                        <span>Trade Role: <strong>{payroll.worker?.tradeCategory}</strong></span>
                                        <span>Daily wage: <strong>₹{payroll.dailyWage} / day</strong></span>
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 6px 0' }}>Payroll Information</h4>
                                    <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                        <span>Project Site: <strong>{payroll.project?.projectName}</strong></span>
                                        <span>Payroll ID: <strong>{payroll.payrollCode}</strong></span>
                                        <span>Payment Status: <strong>{payroll.paymentStatus}</strong></span>
                                        <span>Generated By: <strong>{payroll.generatedBy}</strong></span>
                                    </div>
                                </div>
                            </div>

                            <table className="payslip-table">
                                <thead>
                                    <tr>
                                        <th>Earnings Details</th>
                                        <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                                        <th>Deductions Details</th>
                                        <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Basic salary (calculated from {payroll.attendanceDays} working days)</td>
                                        <td style={{ textAlign: 'right' }}>₹{payroll.grossSalary}</td>
                                        <td>Advance Deductions</td>
                                        <td style={{ textAlign: 'right' }}>₹{payroll.advanceAmount}</td>
                                    </tr>
                                    <tr>
                                        <td>Bonus allocations</td>
                                        <td style={{ textAlign: 'right' }}>₹{payroll.bonus}</td>
                                        <td>Penalty Deductions</td>
                                        <td style={{ textAlign: 'right' }}>₹{payroll.penalty}</td>
                                    </tr>
                                    <tr style={{ fontWeight: 700, backgroundColor: '#F8FAFC' }}>
                                        <td>Gross Additions</td>
                                        <td style={{ textAlign: 'right' }}>₹{payroll.grossSalary + payroll.bonus}</td>
                                        <td>Total Deductions</td>
                                        <td style={{ textAlign: 'right' }}>₹{payroll.advanceAmount + payroll.penalty}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '2px solid #0F172A', padding: '16px', borderRadius: '8px', marginTop: '20px' }}>
                                <span style={{ fontWeight: 800, fontSize: '14px' }}>TOTAL NET PAYABLE DISBURSED:</span>
                                <strong style={{ fontSize: '20px', color: '#16A34A' }}>
                                    ₹{payroll.netPayable.toLocaleString('en-IN')}
                                </strong>
                            </div>

                            <div className="payslip-footer">
                                <div>
                                    <div style={{ height: '40px' }}></div>
                                    <div style={{ width: '180px', borderTop: '1px solid #0F172A', fontSize: '11px', textAlign: 'center', paddingTop: '6px', fontWeight: 600 }}>
                                        Receiver's Signature
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', alignSelf: 'center' }}>
                                    {/* Mock QR Placeholder */}
                                    <div style={{ width: '60px', height: '60px', border: '1px solid var(--border-color)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                        QR CODE
                                    </div>
                                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Verify digitally</span>
                                </div>
                                <div>
                                    <div style={{ height: '40px' }}></div>
                                    <div style={{ width: '180px', borderTop: '1px solid #0F172A', fontSize: '11px', textAlign: 'center', paddingTop: '6px', fontWeight: 600 }}>
                                        Authorized Signatory
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </DashboardLayout>
    );
}
