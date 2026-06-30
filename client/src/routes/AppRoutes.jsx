import React, { useState, useEffect } from 'react';
import LandingPage from '../modules/dashboard/pages/LandingPage';
import LoginPage from '../modules/auth/pages/LoginPage';
import RegisterPage from '../modules/auth/pages/RegisterPage';
import ForgotPasswordPage from '../modules/auth/pages/ForgotPasswordPage';
import OTPVerificationPage from '../modules/auth/pages/OTPVerificationPage';
import ResetPasswordPage from '../modules/auth/pages/ResetPasswordPage';
import DashboardPage from '../modules/dashboard/pages/DashboardPage';
import ProjectListPage from '../modules/projects/pages/ProjectListPage';
import ProjectFormPage from '../modules/projects/pages/ProjectFormPage';
import ProjectDetailPage from '../modules/projects/pages/ProjectDetailPage';
import LabourListPage from '../modules/labour/pages/LabourListPage';
import LabourFormPage from '../modules/labour/pages/LabourFormPage';
import LabourDetailPage from '../modules/labour/pages/LabourDetailPage';
import AttendanceDashboardPage from '../modules/attendance/pages/AttendanceDashboardPage';
import BulkAttendancePage from '../modules/attendance/pages/BulkAttendancePage';
import AttendanceHistoryPage from '../modules/attendance/pages/AttendanceHistoryPage';
import WorkerAttendanceProfilePage from '../modules/attendance/pages/WorkerAttendanceProfilePage';
import PayrollDashboardPage from '../modules/payroll/pages/PayrollDashboardPage';
import PayrollListPage from '../modules/payroll/pages/PayrollListPage';
import GeneratePayrollPage from '../modules/payroll/pages/GeneratePayrollPage';
import AdvanceFormPage from '../modules/payroll/pages/AdvanceFormPage';
import PayrollDetailPage from '../modules/payroll/pages/PayrollDetailPage';
import ExpenseDashboardPage from '../modules/expenses/pages/ExpenseDashboardPage';
import ExpenseListPage from '../modules/expenses/pages/ExpenseListPage';
import ExpenseFormPage from '../modules/expenses/pages/ExpenseFormPage';
import ExpenseDetailPage from '../modules/expenses/pages/ExpenseDetailPage';
import SiteReportDashboardPage from '../modules/siteReports/pages/SiteReportDashboardPage';
import SiteReportListPage from '../modules/siteReports/pages/SiteReportListPage';
import SiteReportFormPage from '../modules/siteReports/pages/SiteReportFormPage';
import SiteReportDetailPage from '../modules/siteReports/pages/SiteReportDetailPage';
import AnalyticsDashboardPage from '../modules/analytics/pages/AnalyticsDashboardPage';
import ProfileDashboardPage from '../modules/profile/pages/ProfileDashboardPage';

export default function AppRoutes() {
    const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentPath(window.location.hash || '#/');
            setIsAuthenticated(!!localStorage.getItem('token'));
        };
        
        window.addEventListener('hashchange', handleHashChange);
        window.addEventListener('storage', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('storage', handleHashChange);
        };
    }, []);

    // Route protector and redirect logic
    const authPaths = ['#/login', '#/register', '#/forgot-password', '#/verify', '#/reset-password'];
    
    if (isAuthenticated) {
        // If authenticated, auth pages redirect to dashboard
        if (authPaths.includes(currentPath)) {
            window.location.hash = '#/';
            return <DashboardPage />;
        }
    } else {
        // If not authenticated, trying to access dashboard, projects, labour, attendance, payroll, expenses, or reports redirects to login
        if (
            currentPath === '#/dashboard' || 
            currentPath.startsWith('#/projects') || 
            currentPath.startsWith('#/labour') ||
            currentPath.startsWith('#/attendance') ||
            currentPath.startsWith('#/payroll') ||
            currentPath.startsWith('#/expenses') ||
            currentPath.startsWith('#/reports') ||
            currentPath.startsWith('#/analytics') ||
            currentPath.startsWith('#/profile')
        ) {
            window.location.hash = '#/login';
            return <LoginPage />;
        }
    }

    // Custom Switchboard for hash routing
    if (currentPath === '#/login') return <LoginPage />;
    if (currentPath === '#/register') return <RegisterPage />;
    if (currentPath === '#/forgot-password') return <ForgotPasswordPage />;
    if (currentPath === '#/verify') return <OTPVerificationPage />;
    if (currentPath === '#/reset-password') return <ResetPasswordPage />;
    
    if (currentPath === '#/dashboard') return <DashboardPage />;
    
    // Project routes
    if (currentPath === '#/projects') return <ProjectListPage />;
    if (currentPath === '#/projects/new') return <ProjectFormPage mode="create" />;
    if (currentPath.startsWith('#/projects/edit/')) {
        const id = currentPath.replace('#/projects/edit/', '');
        return <ProjectFormPage mode="edit" projectId={id} />;
    }
    if (currentPath.startsWith('#/projects/')) {
        const id = currentPath.replace('#/projects/', '');
        return <ProjectDetailPage projectId={id} />;
    }

    // Labour routes
    if (currentPath === '#/labour') return <LabourListPage />;
    if (currentPath === '#/labour/new') return <LabourFormPage mode="create" />;
    if (currentPath.startsWith('#/labour/edit/')) {
        const id = currentPath.replace('#/labour/edit/', '');
        return <LabourFormPage mode="edit" labourId={id} />;
    }
    if (currentPath.startsWith('#/labour/')) {
        const id = currentPath.replace('#/labour/', '');
        return <LabourDetailPage labourId={id} />;
    }
    
    // Attendance routes
    if (currentPath === '#/attendance') return <AttendanceDashboardPage />;
    if (currentPath === '#/attendance/bulk') return <BulkAttendancePage />;
    if (currentPath === '#/attendance/history') return <AttendanceHistoryPage />;
    if (currentPath.startsWith('#/attendance/worker/')) {
        const id = currentPath.replace('#/attendance/worker/', '');
        return <WorkerAttendanceProfilePage workerId={id} />;
    }
    
    // Payroll routes
    if (currentPath === '#/payroll') return <PayrollDashboardPage />;
    if (currentPath === '#/payroll/list') return <PayrollListPage />;
    if (currentPath === '#/payroll/generate') return <GeneratePayrollPage />;
    if (currentPath === '#/payroll/advance') return <AdvanceFormPage />;
    if (currentPath.startsWith('#/payroll/')) {
        const id = currentPath.replace('#/payroll/', '');
        return <PayrollDetailPage payrollId={id} />;
    }

    // Expense routes
    if (currentPath === '#/expenses') return <ExpenseDashboardPage />;
    if (currentPath === '#/expenses/list') return <ExpenseListPage />;
    if (currentPath === '#/expenses/new') return <ExpenseFormPage mode="create" />;
    if (currentPath.startsWith('#/expenses/edit/')) {
        const id = currentPath.replace('#/expenses/edit/', '');
        return <ExpenseFormPage mode="edit" expenseId={id} />;
    }
    if (currentPath.startsWith('#/expenses/')) {
        const id = currentPath.replace('#/expenses/', '');
        return <ExpenseDetailPage expenseId={id} />;
    }

    // Site Report routes
    if (currentPath === '#/reports') return <SiteReportDashboardPage />;
    if (currentPath === '#/reports/list') return <SiteReportListPage />;
    if (currentPath === '#/reports/new') return <SiteReportFormPage mode="create" />;
    if (currentPath.startsWith('#/reports/edit/')) {
        const id = currentPath.replace('#/reports/edit/', '');
        return <SiteReportFormPage mode="edit" reportId={id} />;
    }
    if (currentPath.startsWith('#/reports/')) {
        const id = currentPath.replace('#/reports/', '');
        return <SiteReportDetailPage reportId={id} />;
    }
    
    // Analytics routes
    if (currentPath.startsWith('#/analytics')) return <AnalyticsDashboardPage />;
    
    // Profile routes
    if (currentPath.startsWith('#/profile')) return <ProfileDashboardPage />;

    
    if (currentPath === '#/') {
        return isAuthenticated ? <DashboardPage /> : <LandingPage />;
    }
    
    // Default fallback
    return isAuthenticated ? <DashboardPage /> : <LandingPage />;
}
