import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import QuickActionCard from '../components/QuickActionCard';
import ChartCard from '../components/ChartCard';
import ActivityTimeline from '../components/ActivityTimeline';
import WeatherWidget from '../components/WeatherWidget';
import CalendarWidget from '../components/CalendarWidget';
import PerformanceCard from '../components/PerformanceCard';
import ProjectStatusTable from '../components/ProjectStatusTable';
import LoadingSkeleton from '../../attendance/components/LoadingSkeleton';

import { 
    FaBriefcase, 
    FaHardHat, 
    FaClipboardCheck, 
    FaMoneyBillWave, 
    FaCalculator, 
    FaPlus, 
    FaFileInvoice, 
    FaUserPlus, 
    FaRegSmile
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/dashboard.css';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalProjects: 0,
            activeProjects: 0,
            totalLabour: 0,
            attendanceRate: 0,
            monthlyExpenses: 0,
            monthlyPayroll: 0
        },
        activities: [],
        projects: []
    });

    const fetchDashboardSummary = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        fetch('/api/v1/dashboard/summary', { headers })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setDashboardData(data);
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                toast.error('Failed to load command center overview');
            });
    };

    useEffect(() => {
        fetchDashboardSummary();
    }, []);

    // 1. Dynamic Stats Cards
    const statCardsData = [
        { title: 'Total Projects', value: String(dashboardData.stats.totalProjects), icon: <FaBriefcase />, trend: 'Live', trendUp: true, description: 'Registered sites', themeClass: 'primary' },
        { title: 'Active Projects', value: String(dashboardData.stats.activeProjects), icon: <FaHardHat />, trend: 'Active', trendUp: true, description: 'Sites operating', themeClass: 'accent' },
        { title: 'Total Labour Force', value: String(dashboardData.stats.totalLabour), icon: <FaUserPlus />, trend: 'Pool', trendUp: true, description: 'Contractors pool', themeClass: 'info' },
        { title: 'Today\'s Attendance', value: `${dashboardData.stats.attendanceRate}%`, icon: <FaClipboardCheck />, trend: 'Present', trendUp: true, description: 'Today sign-in rate', themeClass: 'success' },
        { title: 'Monthly Expenses', value: `₹${dashboardData.stats.monthlyExpenses.toLocaleString()}`, icon: <FaMoneyBillWave />, trend: 'Month', trendUp: false, description: 'Wages and materials', themeClass: 'danger' },
        { title: 'Payroll Summary', value: `₹${dashboardData.stats.monthlyPayroll.toLocaleString()}`, icon: <FaCalculator />, trend: 'Disbursals', trendUp: true, description: 'Released payroll', themeClass: 'warning' }
    ];

    // 2. Charts Data
    const projectsOverviewData = {
        labels: dashboardData.projects.map(p => p.projectName.substring(0, 15)),
        datasets: [
            {
                label: 'Project Progress Completion %',
                data: dashboardData.projects.map(p => p.progress),
                backgroundColor: 'rgba(249, 115, 22, 0.85)',
                borderColor: '#F97316',
                borderWidth: 1,
                borderRadius: 6
            }
        ]
    };

    const attendanceTrendData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [
            {
                label: 'Sign-in Rate %',
                data: [85, 92, 88, 92, 90, 80],
                borderColor: '#22C55E',
                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                tension: 0.35,
                fill: true,
                pointBackgroundColor: '#22C55E'
            }
        ]
    };

    const expenseDistributionData = {
        labels: ['Materials', 'Wages', 'Transport', 'Machinery', 'Others'],
        datasets: [
            {
                label: 'Expense Share',
                data: [35, 40, 10, 10, 5],
                backgroundColor: ['#F97316', '#334155', '#2563EB', '#F59E0B', '#EF4444'],
                borderWidth: 1
            }
        ]
    };

    const payrollOverviewData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Monthly Disbursals (₹)',
                data: [120000, 140000, 135000, 150000, 160000, dashboardData.stats.monthlyPayroll || 145000],
                borderColor: '#F97316',
                backgroundColor: 'rgba(249, 115, 22, 0.15)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    // 3. Quick Actions Router triggers
    const navigateTo = (path) => {
        window.location.hash = path;
    };

    return (
        <DashboardLayout activePage={activeTab} onPageChange={setActiveTab}>
            <ToastContainer />
            
            {activeTab === 'Dashboard' ? (
                <>
                    {/* Dashboard Welcome Header */}
                    <div className="db-header">
                        <div className="db-header-titles">
                            <h1>Executive Command Center</h1>
                            <p>
                                <FaRegSmile style={{ color: '#F97316', marginRight: '6px' }} />
                                Welcome back, Administrator. Keep track of active site progress and labor deployments.
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <LoadingSkeleton rows={6} cols={3} />
                    ) : (
                        <>
                            {/* Core Statistics Cards */}
                            <div className="stat-grid">
                                {statCardsData.map((card, idx) => (
                                    <StatCard key={idx} {...card} />
                                ))}
                            </div>

                            {/* Quick Actions Shortcuts */}
                            <div className="quick-actions-section">
                                <h2 className="section-title">Common Operations</h2>
                                <div className="quick-actions-grid">
                                    <QuickActionCard label="Create Project" icon={<FaPlus />} onClick={() => navigateTo('#/projects/new')} />
                                    <QuickActionCard label="Add Labour" icon={<FaHardHat />} onClick={() => navigateTo('#/labour/new')} />
                                    <QuickActionCard label="Mark Attendance" icon={<FaClipboardCheck />} onClick={() => navigateTo('#/attendance/bulk')} />
                                    <QuickActionCard label="Generate Payroll" icon={<FaCalculator />} onClick={() => navigateTo('#/payroll/generate')} />
                                    <QuickActionCard label="Add Expense" icon={<FaMoneyBillWave />} onClick={() => navigateTo('#/expenses/new')} />
                                    <QuickActionCard label="Site Reports" icon={<FaFileInvoice />} onClick={() => navigateTo('#/reports/new')} />
                                </div>
                            </div>

                            {/* Analytics Graphics & Operational Logs */}
                            <div className="details-grid">
                                {/* Project Overview Bar Chart */}
                                <div className="grid-col-8">
                                    <ChartCard 
                                        title="Project Construction Progress completion %" 
                                        type="bar" 
                                        data={projectsOverviewData} 
                                    />
                                </div>

                                {/* Recent Activity Logs */}
                                <div className="grid-col-4">
                                    <ActivityTimeline activities={dashboardData.activities} />
                                </div>

                                {/* Attendance Trend Line Chart */}
                                <div className="grid-col-6">
                                    <ChartCard 
                                        title="Daily Sign-in presence (Weekly)" 
                                        type="line" 
                                        data={attendanceTrendData} 
                                    />
                                </div>

                                {/* Expense Doughnut Chart */}
                                <div className="grid-col-6">
                                    <ChartCard 
                                        title="Expense Category Distribution Share" 
                                        type="doughnut" 
                                        data={expenseDistributionData} 
                                    />
                                </div>
                            </div>

                            {/* Execution status & Supplementary widgets */}
                            <div className="details-grid">
                                {/* Table list of projects */}
                                <div className="grid-col-8">
                                    <ProjectStatusTable projects={dashboardData.projects.map(p => ({
                                        id: p._id,
                                        name: p.projectName,
                                        location: p.city,
                                        manager: p.projectManager,
                                        progress: p.progress,
                                        status: p.status,
                                        budget: `₹${p.budget.toLocaleString()}`
                                    }))} />
                                </div>

                                {/* Performance Rates */}
                                <div className="grid-col-4">
                                    <PerformanceCard />
                                </div>

                                {/* Weather conditions */}
                                <div className="grid-col-4">
                                    <WeatherWidget />
                                </div>

                                {/* Calendar timeline */}
                                <div className="grid-col-4">
                                    <CalendarWidget />
                                </div>

                                {/* Area Payroll Chart */}
                                <div className="grid-col-4">
                                    <ChartCard 
                                        title="Monthly Payroll Expenses Trend" 
                                        type="area" 
                                        data={payrollOverviewData} 
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <div className="dashboard-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '12px' }}>{activeTab} Module</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        This is the module showcase page for the <strong>{activeTab}</strong> section. 
                        Under active construction to connect real-time API integrations.
                    </p>
                </div>
            )}
        </DashboardLayout>
    );
}
