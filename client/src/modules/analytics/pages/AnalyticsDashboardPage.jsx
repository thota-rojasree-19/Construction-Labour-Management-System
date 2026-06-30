import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import LoadingSkeleton from '../../attendance/components/LoadingSkeleton';
import EmptyState from '../../attendance/components/EmptyState';
import AttendanceSummaryCard from '../../attendance/components/AttendanceSummaryCard';
import FilterPanel from '../components/FilterPanel';
import ExportModal from '../components/ExportModal';
import { 
    FaChartLine, 
    FaHardHat, 
    FaFileInvoice, 
    FaMoneyBillWave, 
    FaCalculator, 
    FaHistory, 
    FaCloudDownloadAlt,
    FaArrowRight,
    FaTrophy,
    FaBuilding
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/analytics.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function AnalyticsDashboardPage() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ project: '', startDate: '', endDate: '' });
    const [isExportOpen, setIsExportOpen] = useState(false);

    // Dynamic state databases
    const [kpiData, setKpiData] = useState({});
    const [attendanceData, setAttendanceData] = useState({});
    const [expenseData, setExpenseData] = useState({});
    const [payrollData, setPayrollData] = useState({});
    const [labourData, setLabourData] = useState({});
    const [projectData, setProjectData] = useState([]);
    const [siteReportData, setSiteReportData] = useState({});
    const [executiveSummary, setExecutiveSummary] = useState({});

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const fetchAllAnalytics = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        let queryParams = '';
        const params = [];
        if (filters.project) params.push(`project=${filters.project}`);
        if (filters.startDate) params.push(`startDate=${filters.startDate}`);
        if (filters.endDate) params.push(`endDate=${filters.endDate}`);
        if (params.length > 0) queryParams = '?' + params.join('&');

        Promise.all([
            fetch(`/api/v1/analytics/dashboard${queryParams}`, { headers }).then(res => res.json()),
            fetch(`/api/v1/analytics/attendance${queryParams}`, { headers }).then(res => res.json()),
            fetch(`/api/v1/analytics/expenses${queryParams}`, { headers }).then(res => res.json()),
            fetch(`/api/v1/analytics/payroll${queryParams}`, { headers }).then(res => res.json()),
            fetch(`/api/v1/analytics/labour${queryParams}`, { headers }).then(res => res.json()),
            fetch(`/api/v1/analytics/projects${queryParams}`, { headers }).then(res => res.json()),
            fetch(`/api/v1/analytics/site-reports${queryParams}`, { headers }).then(res => res.json()),
            fetch(`/api/v1/analytics/executive-summary${queryParams}`, { headers }).then(res => res.json())
        ]).then(([kpi, attendance, exp, pay, lab, proj, reports, exec]) => {
            if (kpi.success) setKpiData(kpi.data);
            if (attendance.success) setAttendanceData(attendance.data);
            if (exp.success) setExpenseData(exp.data);
            if (pay.success) setPayrollData(pay.data);
            if (lab.success) setLabourData(lab.data);
            if (proj.success) setProjectData(proj.data);
            if (reports.success) setSiteReportData(reports.data);
            if (exec.success) setExecutiveSummary(exec.data);
            setLoading(false);
        }).catch(err => {
            setLoading(false);
            toast.error('Failed to load reports and analytics data');
        });
    };

    useEffect(() => {
        fetchAllAnalytics();
    }, [filters]);

    // Graph visual structures config
    const getAttendanceChart = () => {
        if (!attendanceData.dailyTrend || attendanceData.dailyTrend.length === 0) return null;
        return {
            labels: attendanceData.dailyTrend.map(t => t._id),
            datasets: [
                {
                    label: 'Present Workers',
                    data: attendanceData.dailyTrend.map(t => t.present),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true
                },
                {
                    label: 'Absent Workers',
                    data: attendanceData.dailyTrend.map(t => t.absent),
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true
                }
            ]
        };
    };

    const getExpenseCategoryChart = () => {
        if (!expenseData.categoryWise || expenseData.categoryWise.length === 0) return null;
        return {
            labels: expenseData.categoryWise.map(c => c._id),
            datasets: [{
                data: expenseData.categoryWise.map(c => c.amount),
                backgroundColor: [
                    '#F97316', '#3B82F6', '#10B981', '#6366F1', '#EC4899', 
                    '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6', '#64748B'
                ]
            }]
        };
    };

    const getLabourTradeChart = () => {
        if (!labourData.trades || labourData.trades.length === 0) return null;
        return {
            labels: labourData.trades.map(t => t._id),
            datasets: [{
                data: labourData.trades.map(t => t.count),
                backgroundColor: ['#6366F1', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#EC4899', '#8B5CF6']
            }]
        };
    };

    const getPayrollTrendChart = () => {
        if (!payrollData.monthlyTrend || payrollData.monthlyTrend.length === 0) return null;
        return {
            labels: payrollData.monthlyTrend.map(m => m._id),
            datasets: [{
                label: 'Salary Net Paid (INR)',
                data: payrollData.monthlyTrend.map(m => m.total),
                backgroundColor: '#3B82F6',
                borderRadius: 4
            }]
        };
    };

    const getSiteReportsActivityChart = () => {
        if (!siteReportData.dailyReportsTrend || siteReportData.dailyReportsTrend.length === 0) return null;
        return {
            labels: siteReportData.dailyReportsTrend.map(t => t._id),
            datasets: [
                {
                    label: 'Labour Logged',
                    data: siteReportData.dailyReportsTrend.map(t => t.labourCount),
                    borderColor: '#F97316',
                    yAxisID: 'y'
                }
            ]
        };
    };

    return (
        <DashboardLayout activePage="Analytics">
            <ToastContainer />
            
            {/* Header */}
            <div className="db-header">
                <div className="db-header-titles">
                    <h1>Executive BI Reports & Analytics</h1>
                    <p>Track business health, labor productivity metrics, financial summaries, and project allocations.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsExportOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <FaCloudDownloadAlt /> Download Reports / Export
                </button>
            </div>

            {/* Filter Panel */}
            <FilterPanel onFilterChange={handleFilterChange} onReload={fetchAllAnalytics} />

            {/* Navigation Tabs */}
            <div className="analytics-tabs">
                <button className={`analytics-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Executive KPI Summary</button>
                <button className={`analytics-tab ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>Attendance Insights</button>
                <button className={`analytics-tab ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>Operations Expenses</button>
                <button className={`analytics-tab ${activeTab === 'labour' ? 'active' : ''}`} onClick={() => setActiveTab('labour')}>Workforce & Trades</button>
                <button className={`analytics-tab ${activeTab === 'payroll' ? 'active' : ''}`} onClick={() => setActiveTab('payroll')}>Payroll Budgets</button>
                <button className={`analytics-tab ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>Projects Progress</button>
            </div>

            {loading ? (
                <LoadingSkeleton rows={8} cols={6} table={false} />
            ) : (
                <div className="analytics-container">
                    
                    {/* 1. EXECUTIVE KPI SUMMARY TAB */}
                    {activeTab === 'dashboard' && (
                        <>
                            {/* Stats Cards */}
                            <div className="stat-grid" style={{ marginBottom: '28px' }}>
                                <AttendanceSummaryCard 
                                    title="Active / Total Projects" 
                                    value={`${kpiData.activeProjects || 0} / ${kpiData.totalProjects || 0}`} 
                                    type="primary"
                                    icon={<FaBuilding />}
                                />
                                <AttendanceSummaryCard 
                                    title="Active Workforce Pool" 
                                    value={kpiData.totalWorkers || 0} 
                                    type="success"
                                    icon={<FaHardHat />}
                                />
                                <AttendanceSummaryCard 
                                    title="Avg Attendance Rate" 
                                    value={`${kpiData.attendanceRate || 0}%`} 
                                    type="accent"
                                    icon={<FaChartLine />}
                                />
                                <AttendanceSummaryCard 
                                    title="Total Monthly Outgoings" 
                                    value={`₹${((kpiData.totalPayroll || 0) + (kpiData.totalExpenses || 0)).toLocaleString()}`} 
                                    type="danger"
                                    icon={<FaMoneyBillWave />}
                                />
                            </div>

                            {/* Executive Summary Cards */}
                            <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>Critical Business Insights</h3>
                            <div className="insight-grid">
                                <div className="insight-card info">
                                    <span className="insight-card-title">Most Expensive Project</span>
                                    <span className="insight-card-value">{executiveSummary.mostExpensiveProject || 'N/A'}</span>
                                </div>
                                <div className="insight-card success">
                                    <span className="insight-card-title">Best Attendance Project</span>
                                    <span className="insight-card-value">{executiveSummary.bestAttendanceProject || 'N/A'}</span>
                                </div>
                                <div className="insight-card info">
                                    <span className="insight-card-title">Highest Labour Allocation</span>
                                    <span className="insight-card-value">{executiveSummary.highestLabourAllocation || 'N/A'}</span>
                                </div>
                                <div className="insight-card danger">
                                    <span className="insight-card-title">Most Delayed Project</span>
                                    <span className="insight-card-value">{executiveSummary.mostDelayedProject || 'None'}</span>
                                </div>
                            </div>

                            {/* Main Dash Charts */}
                            <div className="details-grid">
                                <div className="grid-col-8">
                                    <div className="dashboard-card" style={{ height: '360px' }}>
                                        <h3>Monthly Salary Payout trends</h3>
                                        <div style={{ position: 'relative', height: '280px' }}>
                                            {getPayrollTrendChart() ? (
                                                <Bar data={getPayrollTrendChart()} options={{ responsive: true, maintainAspectRatio: false }} />
                                            ) : (
                                                <EmptyState title="No payroll data available" description="Payroll charts require salary sheets to be generated." />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid-col-4">
                                    <div className="dashboard-card" style={{ height: '360px' }}>
                                        <h3>Expense Category Distribution</h3>
                                        <div style={{ position: 'relative', height: '280px', display: 'flex', justifyContent: 'center' }}>
                                            {getExpenseCategoryChart() ? (
                                                <Doughnut data={getExpenseCategoryChart()} options={{ responsive: true, maintainAspectRatio: false }} />
                                            ) : (
                                                <EmptyState title="No expenses registered" description="Expense categories will display when payments are logged." />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* 2. ATTENDANCE INSIGHTS TAB */}
                    {activeTab === 'attendance' && (
                        <div className="details-grid">
                            <div className="grid-col-8">
                                <div className="dashboard-card" style={{ height: '380px' }}>
                                    <h3>Daily Workforce Attendance Trend (Last 30 Days)</h3>
                                    <div style={{ position: 'relative', height: '300px' }}>
                                        {getAttendanceChart() ? (
                                            <Line data={getAttendanceChart()} options={{ responsive: true, maintainAspectRatio: false }} />
                                        ) : (
                                            <EmptyState title="No attendance logs found" description="Attendance trends will load when logs are stored." />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid-col-4">
                                <div className="dashboard-card">
                                    <h3>Project-wise Attendance Rate</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                                        {attendanceData.projectWise && attendanceData.projectWise.length > 0 ? (
                                            attendanceData.projectWise.map((p, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{p.projectName}</span>
                                                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{p.rate.toFixed(1)}%</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No projects to compare.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. OPERATIONS EXPENSES TAB */}
                    {activeTab === 'expenses' && (
                        <div className="details-grid">
                            <div className="grid-col-6">
                                <div className="dashboard-card">
                                    <h3>Expense Categories Allocation</h3>
                                    <div style={{ position: 'relative', height: '300px', display: 'flex', justifyContent: 'center' }}>
                                        {getExpenseCategoryChart() ? (
                                            <Pie data={getExpenseCategoryChart()} options={{ responsive: true, maintainAspectRatio: false }} />
                                        ) : (
                                            <EmptyState title="No categories found" description="Add expenses to build allocation metrics." />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid-col-6">
                                <div className="dashboard-card">
                                    <h3>Project Expenses Ledger</h3>
                                    <div className="table-responsive">
                                        <table className="project-table">
                                            <thead>
                                                <tr>
                                                    <th>Project Name</th>
                                                    <th>Total Spent</th>
                                                    <th>Allocated Budget</th>
                                                    <th>Burn Rate</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expenseData.projectWise && expenseData.projectWise.length > 0 ? (
                                                    expenseData.projectWise.map((p, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{ fontWeight: 600 }}>{p.projectName}</td>
                                                            <td>₹{p.amount.toLocaleString()}</td>
                                                            <td>₹{p.budget.toLocaleString()}</td>
                                                            <td>
                                                                <strong style={{ color: p.amount > p.budget ? 'var(--danger)' : 'var(--success)' }}>
                                                                    {p.budget > 0 ? ((p.amount / p.budget) * 100).toFixed(0) : 0}%
                                                                </strong>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4">No project data logged.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. WORKFORCE & TRADES TAB */}
                    {activeTab === 'labour' && (
                        <div className="details-grid">
                            <div className="grid-col-6">
                                <div className="dashboard-card">
                                    <h3>Workforce Demographics (Trades Category)</h3>
                                    <div style={{ position: 'relative', height: '300px', display: 'flex', justifyContent: 'center' }}>
                                        {getLabourTradeChart() ? (
                                            <Doughnut data={getLabourTradeChart()} options={{ responsive: true, maintainAspectRatio: false }} />
                                        ) : (
                                            <EmptyState title="No worker records" description="Workforce profiles will populate the trade charts." />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid-col-6">
                                <div className="dashboard-card">
                                    <h3>Project-wise Workforce Allocations</h3>
                                    <div className="table-responsive">
                                        <table className="project-table">
                                            <thead>
                                                <tr>
                                                    <th>Project Name</th>
                                                    <th>Active Workers Count</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {labourData.projectAllocation && labourData.projectAllocation.length > 0 ? (
                                                    labourData.projectAllocation.map((p, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{ fontWeight: 600 }}>{p.projectName}</td>
                                                            <td><strong>{p.count}</strong> workers allocated</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="2">No active project workers found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 5. PAYROLL BUDGETS TAB */}
                    {activeTab === 'payroll' && (
                        <div className="details-grid">
                            <div className="grid-col-8">
                                <div className="dashboard-card">
                                    <h3>Total Monthly Payroll Expenditures</h3>
                                    <div style={{ position: 'relative', height: '300px' }}>
                                        {getPayrollTrendChart() ? (
                                            <Bar data={getPayrollTrendChart()} options={{ responsive: true, maintainAspectRatio: false }} />
                                        ) : (
                                            <EmptyState title="No payroll data" description="Salary records build the trend reports." />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid-col-4">
                                <div className="dashboard-card">
                                    <h3>Payout Status Ledger</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                                        {payrollData.statusDistribution && payrollData.statusDistribution.length > 0 ? (
                                            payrollData.statusDistribution.map((status, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                                                    <span style={{ fontWeight: 600 }}>{status._id}</span>
                                                    <span>₹{status.total.toLocaleString()}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No salary records filed.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 6. PROJECTS PROGRESS TAB */}
                    {activeTab === 'projects' && (
                        <div className="dashboard-card">
                            <h3>Detailed Projects Portfolio Ledger</h3>
                            <div className="table-responsive">
                                <table className="project-table">
                                    <thead>
                                        <tr>
                                            <th>Project Code</th>
                                            <th>Project Name</th>
                                            <th>Total Budget</th>
                                            <th>Spent Total (Exp + Pay)</th>
                                            <th>Current Progress %</th>
                                            <th>Project Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projectData.length > 0 ? (
                                            projectData.map((proj, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ fontWeight: 700 }}>{proj.projectCode}</td>
                                                    <td style={{ fontWeight: 600 }}>{proj.projectName}</td>
                                                    <td>₹{proj.budget.toLocaleString()}</td>
                                                    <td>₹{((proj.totalExpenses || 0) + (proj.totalPayroll || 0)).toLocaleString()}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div className="progress-bar-container" style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '3px' }}>
                                                                <div style={{ width: `${proj.progress}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                                                            </div>
                                                            <strong>{proj.progress}%</strong>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${proj.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                                                            {proj.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6">No projects registered.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            )}

            {/* Export modal */}
            <ExportModal 
                isOpen={isExportOpen} 
                onClose={() => setIsExportOpen(false)} 
                filters={filters} 
            />
        </DashboardLayout>
    );
}
