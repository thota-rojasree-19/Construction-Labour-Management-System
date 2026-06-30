import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import ChartCard from '../../dashboard/components/ChartCard';
import AttendanceSummaryCard from '../../attendance/components/AttendanceSummaryCard';
import BudgetProgressCard from '../components/BudgetProgressCard';
import EmptyState from '../../attendance/components/EmptyState';
import { 
    FaCoins, 
    FaCalendarDay, 
    FaCalendarAlt, 
    FaExclamationTriangle,
    FaPlus,
    FaHistory,
    FaSync,
    FaFolderOpen
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/expenses.css';

export default function ExpenseDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalExpenses: 0,
        todayExpenses: 0,
        monthlyExpenses: 0,
        highestCategory: 'N/A',
        categorySummary: {},
        budgetUtilization: []
    });
    const [selectedProject, setSelectedProject] = useState('');
    const [projects, setProjects] = useState([]);

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
    }, []);

    const fetchDashboardStats = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        let url = '/api/v1/expenses?limit=100';
        if (selectedProject) url += `&project=${selectedProject}`;

        fetch(url, { headers })
            .then(res => res.json())
            .then(data => {
                if (data && data.statistics) {
                    setStats(data.statistics);
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                toast.error('Failed to load expense dashboard statistics');
            });
    };

    useEffect(() => {
        fetchDashboardStats();
    }, [selectedProject]);

    // Analytics Mock Charts Data
    const monthlyTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Wages & Materials Cost (₹)',
            data: [150000, 280000, 310000, 240000, 380000, stats.monthlyExpenses || 450000],
            borderColor: '#F97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            tension: 0.3,
            fill: true
        }]
    };

    const categorySummaryKeys = Object.keys(stats.categorySummary || {});
    const categorySummaryVals = Object.values(stats.categorySummary || {});

    const categoryChartData = {
        labels: categorySummaryKeys.length > 0 ? categorySummaryKeys : ['Materials', 'Labour', 'Fuel', 'Rental'],
        datasets: [{
            data: categorySummaryVals.length > 0 ? categorySummaryVals : [180000, 120000, 50000, 40000],
            backgroundColor: [
                '#F97316', '#2563EB', '#F59E0B', '#22C55E', 
                '#A855F7', '#EC4899', '#EF4444', '#14B8A6', 
                '#4F46E5', '#78716C', '#6366F1', '#64748B'
            ]
        }]
    };

    const projectCostDistribution = {
        labels: stats.budgetUtilization.map(u => u.projectName).slice(0, 4),
        datasets: [{
            label: 'Cost (₹)',
            data: stats.budgetUtilization.map(u => u.spent).slice(0, 4),
            backgroundColor: '#334155'
        }]
    };

    return (
        <DashboardLayout activePage="Expenses">
            <ToastContainer />

            {/* Header section */}
            <div className="db-header">
                <div className="db-header-titles">
                    <h1>Project Financial Expenses</h1>
                    <p>Track project actual costs, categorize cash spends, upload receipts, and check budgets in real-time.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <a href="#/expenses/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                        <FaPlus /> Record New Expense
                    </a>
                    <a href="#/expenses/list" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                        <FaHistory /> Expenses Ledger
                    </a>
                </div>
            </div>

            {/* Filter panel */}
            <div className="attendance-filters-panel" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>FILTER BY PROJECT SITE</span>
                        <select 
                            className="form-input" 
                            style={{ width: '220px', padding: '8px 12px', fontSize: '13px' }}
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                        >
                            <option value="">All Projects</option>
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.projectName}</option>
                            ))}
                        </select>
                    </div>

                    <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '38px', alignSelf: 'flex-end' }} onClick={fetchDashboardStats}>
                        <FaSync /> Reload Metrics
                    </button>
                </div>
            </div>

            {/* Metrics cards grid */}
            <div className="stat-grid">
                <AttendanceSummaryCard 
                    title="Total Spending" 
                    value={`₹${stats.totalExpenses.toLocaleString('en-IN')}`} 
                    type="primary"
                    icon={<FaCoins />}
                />
                <AttendanceSummaryCard 
                    title="Today's Outflow" 
                    value={`₹${stats.todayExpenses.toLocaleString('en-IN')}`} 
                    type="accent"
                    icon={<FaCalendarDay />}
                />
                <AttendanceSummaryCard 
                    title="Monthly Spending" 
                    value={`₹${stats.monthlyExpenses.toLocaleString('en-IN')}`} 
                    type="success"
                    icon={<FaCalendarAlt />}
                />
                <AttendanceSummaryCard 
                    title="Highest Outflow Category" 
                    value={stats.highestCategory} 
                    type="warning"
                    icon={<FaFolderOpen />}
                />
            </div>

            {/* Project Budgets Utilization list */}
            <div className="details-grid">
                <div className="grid-col-12">
                    <div className="dashboard-card">
                        <div className="card-header-row" style={{ marginBottom: '16px' }}>
                            <h3>Real-time Project Budget Utilization</h3>
                        </div>

                        {loading ? (
                            <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
                                <div className="spinner-icon" style={{ borderColor: 'var(--primary) transparent var(--primary) transparent', width: '24px', height: '24px' }}></div>
                            </div>
                        ) : stats.budgetUtilization.length === 0 ? (
                            <EmptyState 
                                title="No Budgets Loaded"
                                description="Record project expenses to begin compiling utilization percentage sheets."
                            />
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                {stats.budgetUtilization.map(u => (
                                    <BudgetProgressCard 
                                        key={u.projectId}
                                        projectName={u.projectName}
                                        budget={u.budget}
                                        spent={u.spent}
                                        remaining={u.remaining}
                                        utilizationPercentage={u.utilizationPercentage}
                                        exceedsThreshold={u.exceedsThreshold}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Charts analytics */}
            <div className="details-grid">
                <div className="grid-col-4">
                    <ChartCard 
                        title="Outflows by Category" 
                        type="pie" 
                        data={categoryChartData}
                    />
                </div>
                <div className="grid-col-8">
                    <ChartCard 
                        title="Actual Outflows by Project Site" 
                        type="bar" 
                        data={projectCostDistribution}
                    />
                </div>
            </div>

            <div className="details-grid">
                <div className="grid-col-12">
                    <ChartCard 
                        title="6-Month Outflow Growth Trend" 
                        type="area" 
                        data={monthlyTrendData}
                    />
                </div>
            </div>

        </DashboardLayout>
    );
}
