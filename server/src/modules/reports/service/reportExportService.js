const Project = require('../../projects/model/Project');
const Labour = require('../../labour/model/Labour');
const Attendance = require('../../attendance/model/Attendance');
const Payroll = require('../../payroll/model/Payroll');
const Expense = require('../../expenses/model/Expense');
const SiteReport = require('../model/SiteReport');

class ReportExportService {
    async getReportData(moduleType, filters = {}) {
        const query = { isDeleted: { $ne: true } };
        
        switch (moduleType) {
            case 'projects':
                const projects = await Project.find(query);
                return projects.map(p => ({
                    'Code': p.projectCode,
                    'Project Name': p.projectName,
                    'Type': p.projectType,
                    'Client': p.clientName,
                    'Budget': p.budget,
                    'Progress (%)': p.progress,
                    'Status': p.status,
                    'Start Date': p.startDate ? new Date(p.startDate).toLocaleDateString() : ''
                }));

            case 'labour':
                const labour = await Labour.find(query).populate('assignedProject');
                return labour.map(l => ({
                    'Employee ID': l.employeeId,
                    'Name': l.fullName,
                    'Mobile': l.mobileNumber,
                    'Trade Category': l.tradeCategory,
                    'Skill Level': l.skillLevel,
                    'Daily Wage': l.dailyWage,
                    'Assigned Project': l.assignedProject ? l.assignedProject.projectName : 'Unassigned',
                    'Status': l.status
                }));

            case 'attendance':
                const attendance = await Attendance.find(query).populate('worker project');
                return attendance.map(a => ({
                    'Date': a.date ? new Date(a.date).toLocaleDateString() : '',
                    'Worker': a.worker ? a.worker.fullName : 'N/A',
                    'Project': a.project ? a.project.projectName : 'N/A',
                    'Status': a.status,
                    'Shift': a.shift,
                    'Working Hours': a.workingHours
                }));

            case 'payroll':
                const payroll = await Payroll.find(query).populate('worker project');
                return payroll.map(p => ({
                    'Payroll Code': p.payrollCode,
                    'Worker': p.worker ? p.worker.fullName : 'N/A',
                    'Project': p.project ? p.project.projectName : 'N/A',
                    'Month': p.month,
                    'Days Worked': p.attendanceDays,
                    'Gross Salary': p.grossSalary,
                    'Net Paid': p.netPayable,
                    'Status': p.paymentStatus
                }));

            case 'expenses':
                const expenses = await Expense.find(query).populate('project');
                return expenses.map(e => ({
                    'Expense Code': e.expenseCode,
                    'Title': e.expenseTitle,
                    'Project': e.project ? e.project.projectName : 'N/A',
                    'Category': e.category,
                    'Vendor': e.vendor,
                    'Amount': e.amount,
                    'Date': e.expenseDate ? new Date(e.expenseDate).toLocaleDateString() : '',
                    'Payment Method': e.paymentMethod
                }));

            case 'site-reports':
                const reports = await SiteReport.find(query).populate('project');
                return reports.map(r => ({
                    'Report Code': r.reportCode,
                    'Project': r.project ? r.project.projectName : 'N/A',
                    'Date': r.reportDate ? new Date(r.reportDate).toLocaleDateString() : '',
                    'Weather': r.weather,
                    'Labour Count': r.labourCount,
                    'Progress (%)': r.progressPercentage,
                    'Status': r.status
                }));

            default:
                return [];
        }
    }

    convertToCSV(data) {
        if (!data || data.length === 0) return '';
        const headers = Object.keys(data[0]);
        const csvRows = [];
        
        // Header row
        csvRows.push(headers.join(','));

        // Data rows
        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header];
                const escaped = ('' + val).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }
}

module.exports = new ReportExportService();
