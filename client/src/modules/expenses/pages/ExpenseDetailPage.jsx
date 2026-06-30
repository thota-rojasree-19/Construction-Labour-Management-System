import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import ExpenseCategoryBadge from '../components/ExpenseCategoryBadge';
import { 
    FaArrowLeft, 
    FaEdit, 
    FaReceipt, 
    FaCoins, 
    FaBuilding, 
    FaInfoCircle,
    FaCalendarAlt,
    FaUser
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/expenses.css';

export default function ExpenseDetailPage({ expenseId: propExpenseId = null }) {
    const getExpenseIdFromHash = () => {
        const hash = window.location.hash;
        const parts = hash.split('/');
        return parts[parts.length - 1];
    };

    const targetExpenseId = propExpenseId || getExpenseIdFromHash();

    const [loading, setLoading] = useState(true);
    const [expense, setExpense] = useState(null);

    useEffect(() => {
        if (!targetExpenseId) return;

        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        fetch(`/api/v1/expenses/${targetExpenseId}`, { headers })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to load details');
                return data;
            })
            .then((data) => {
                setExpense(data);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                toast.error(err.message);
            });
    }, [targetExpenseId]);

    return (
        <DashboardLayout activePage="Expenses">
            <ToastContainer />

            <div className="db-header no-print" style={{ marginBottom: '20px' }}>
                <div className="db-header-titles">
                    <a href="#/expenses/list" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                        <FaArrowLeft /> Back to Ledger
                    </a>
                    <h1>Expense Details Audit</h1>
                    <p>Review financial outlays, project budget consumption, and vendor receipts.</p>
                </div>
                {expense && (
                    <a href={`#/expenses/edit/${expense._id}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                        <FaEdit /> Edit Expense Details
                    </a>
                )}
            </div>

            {loading ? (
                <div className="dashboard-card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner-icon" style={{ borderColor: 'var(--primary) transparent var(--primary) transparent', width: '32px', height: '32px' }}></div>
                    <span style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Retrieving expense metrics...</span>
                </div>
            ) : !expense ? (
                <div className="dashboard-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <h3>Expense Not Found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>The requested expense log reference does not exist or has been deleted.</p>
                </div>
            ) : (
                <div className="details-grid">
                    
                    {/* Expense Details Card Left */}
                    <div className="grid-col-7">
                        <div className="dashboard-card" style={{ gap: '20px' }}>
                            <div className="card-header-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--secondary)', color: 'white' }}>
                                        {expense.expenseCode}
                                    </span>
                                    <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>{expense.expenseTitle}</h3>
                                </div>
                                <ExpenseCategoryBadge category={expense.category} />
                            </div>

                            {/* Info list */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', fontSize: '13px' }}>
                                <div>
                                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Project Site</span>
                                    <strong>{expense.project?.projectName || 'Unassigned'}</strong>
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vendor / Supplier</span>
                                    <strong>{expense.vendor}</strong>
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expense Amount</span>
                                    <strong style={{ fontSize: '16px', color: 'var(--primary)' }}>₹{expense.amount.toLocaleString('en-IN')}</strong>
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payment Method</span>
                                    <strong>{expense.paymentMethod}</strong>
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expense Date</span>
                                    <strong>{new Date(expense.expenseDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</strong>
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Invoice Number</span>
                                    <strong>{expense.invoiceNumber || 'No invoice registered'}</strong>
                                </div>
                            </div>

                            {expense.description && (
                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Description / Details</span>
                                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>{expense.description}</p>
                                </div>
                            )}

                            {expense.remarks && (
                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Accounting Remarks</span>
                                    <div style={{ padding: '8px 12px', borderLeft: '3px solid var(--primary)', backgroundColor: 'var(--background)', borderRadius: '0 6px 6px 0', fontSize: '12px', fontStyle: 'italic' }}>
                                        "{expense.remarks}"
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div style={{ display: 'flex', gap: '20px', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <FaUser /> Recorded By: {expense.createdBy}
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <FaCalendarAlt /> Created: {new Date(expense.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Preview Card Right */}
                    <div className="grid-col-5">
                        <div className="dashboard-card" style={{ gap: '16px' }}>
                            <div className="card-header-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                <h3><FaReceipt /> Receipt Attachment Preview</h3>
                            </div>

                            {expense.receiptUrl ? (
                                <div className="receipt-preview-frame">
                                    {/* Mock receipt view frame */}
                                    <div style={{ padding: '32px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                        <FaReceipt style={{ fontSize: '40px', color: 'var(--primary)' }} />
                                        <span style={{ fontSize: '13px', fontWeight: 700 }}>{expense.receiptUrl.split('/').pop()}</span>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MimeType: {expense.receiptType || 'image/png'}</span>
                                        <a href={expense.receiptUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ textDecoration: 'none', fontSize: '12px' }}>
                                            Download Invoice Receipt
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
                                    No receipt file attached to this expense record.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </DashboardLayout>
    );
}
