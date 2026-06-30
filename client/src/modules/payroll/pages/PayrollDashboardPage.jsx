import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import ChartCard from '../../dashboard/components/ChartCard';
import AttendanceSummaryCard from '../../attendance/components/AttendanceSummaryCard';
import { 
    FaMoneyBillWave, 
    FaCheckCircle, 
    FaClock, 
    FaUsers, 
    FaUserCheck, 
    FaCalendarAlt, 
    FaPlus, 
    FaHistory, 
    FaSync
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/payroll.css';

export default function PayrollDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPayrollThisMonth: 0,
        totalPaidAmount: 0,
        pendingPayments: 0,
        workersPaid: 0,
        workersPending: 0,
        averageDailyWage: 0,
        totalAdvances: 0,
        totalBonuses: 0,
        totalPenalties: 0
    });
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const fetchDashboardStats = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        fetch(`/api/v1/payroll?month=${selectedMonth}`, { headers })
            .then(res => res.json())
            .then(data => {
                if (data && data.statistics) {
                    setStats(data.statistics);
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                toast.error('Failed to load payroll stats');
            });
    };

    useEffect(() => {
        fetchDashboardStats();
    }, [selectedMonth]);

    // Analytics Mock Charts Data
    const monthlyTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Total Cost (₹)',
            data: [420000, 480000, 510000, 490000, 530000, stats.totalPayrollThisMonth || 580000],
            borderColor: '#F97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            tension: 0.3,
            fill: true
        }]
    };

    const costDistributionData = {
        labels: ['Paid Wages', 'Pending', 'Advances', 'Bonuses'],
        datasets: [{
            data: [
                stats.totalPaidAmount || 350000,
                stats.pendingPayments || 200000,
                stats.totalAdvances || 30000,
                stats.totalBonuses || 15000
            ],
            backgroundColor: ['#22C55E', '#EF4444', '#2563EB', '#F59E0B']
        }]
    };

    const projectCostData = {
        labels: ['Skyline Heights', 'Alpha Bridge', 'Metro Line 3', 'Highway Phase 1'],
        datasets: [
            {
                label: 'Gross Paid (₹)',
                data: [250000, 180000, 120000, 95000],
                backgroundColor: '#334155'
            }
        ]
    };

    return (
        <DashboardLayout activePage="Payroll">
            <ToastContainer />

            {/* Header section */}
            <div className="db-header">
                <div className="db-header-titles">
                    <h1>HRMS Payroll</h1>
                    <p>Track site payroll distributions, worker payouts, cash advances, and financial aggregates.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <a href="#/payroll/advance" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                        <FaMoneyBillWave /> Record Cash Advance
                    </a>
                    <a href="#/payroll/generate" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                        <FaPlus /> Generate Payroll
                    </a>
                    <a href="#/payroll/list" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                        <FaHistory /> Payroll Ledger
                    </a>
                </div>
            </div>

            {/* Month selector */}
            <div className="attendance-filters-panel" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PAYROLL PERIOD</span>
                        <input 
                            type="month" 
                            className="form-input"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            style={{ width: '180px', padding: '8px 12px', fontSize: '13px' }}
                        />
                    </div>

                    <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '38px', alignSelf: 'flex-end' }} onClick={fetchDashboardStats}>
                        <FaSync /> Reload Stats
                    </button>
                </div>
            </div>

            {/* Metrics cards grid */}
            <div className="stat-grid">
                <AttendanceSummaryCard 
                    title="Total Payroll Cost" 
                    value={`₹${stats.totalPayrollThisMonth.toLocaleString('en-IN')}`} 
                    type="primary"
                    icon={<FaMoneyBillWave />}
                />
                <AttendanceSummaryCard 
                    title="Wages Paid" 
                    value={`₹${stats.totalPaidAmount.toLocaleString('en-IN')}`} 
                    type="success"
                    icon={<FaCheckCircle />}
                    trendVal={`${stats.workersPaid} workers`}
                    trendDirection="up"
                    trendText="completed"
                />
                <AttendanceSummaryCard 
                    title="Pending Payouts" 
                    value={`₹${stats.pendingPayments.toLocaleString('en-IN')}`} 
                    type="danger"
                    icon={<FaClock />}
                    trendVal={`${stats.workersPending} workers`}
                    trendDirection="down"
                    trendText="awaiting payment"
                />
                <AttendanceSummaryCard 
                    title="Advances Disbursed" 
                    value={`₹${stats.totalAdvances.toLocaleString('en-IN')}`} 
                    type="warning"
                    icon={<FaMoneyBillWave />}
                />
            </div>

            {/* Secondary metrics grid */}
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '32px' }}>
                <div className="dashboard-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Avg Daily Wage</span>
                    <strong style={{ fontSize: '20px' }}>₹{stats.averageDailyWage}</strong>
                </div>
                <div className="dashboard-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Bonus Payouts</span>
                    <strong style={{ fontSize: '20px', color: 'var(--success)' }}>₹{stats.totalBonuses.toLocaleString('en-IN')}</strong>
                </div>
                <div className="dashboard-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Penalties Deducted</span>
                    <strong style={{ fontSize: '20px', color: 'var(--danger)' }}>₹{stats.totalPenalties.toLocaleString('en-IN')}</strong>
                </div>
            </div>

            {/* Charts analytics */}
            <div className="details-grid">
                <div className="grid-col-4">
                    <ChartCard 
                        title="Payroll Distribution" 
                        type="doughnut" 
                        data={costDistributionData}
                    />
                </div>
                <div className="grid-col-8">
                    <ChartCard 
                        title="Payroll Cost by Project Site" 
                        type="bar" 
                        data={projectCostData}
                    />
                </div>
            </div>

            <div className="details-grid">
                <div className="grid-col-12">
                    <ChartCard 
                        title="6-Month Payroll Spending Trend" 
                        type="area" 
                        data={monthlyTrendData}
                    />
                </div>
            </div>

        </DashboardLayout>
    );
}
