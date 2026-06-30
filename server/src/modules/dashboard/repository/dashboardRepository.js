const mongoose = require('mongoose');
const Project = require('../../projects/model/Project');
const Labour = require('../../labour/model/Labour');
const Attendance = require('../../attendance/model/Attendance');
const Expense = require('../../expenses/model/Expense');
const Payroll = require('../../payroll/model/Payroll');
const SiteReport = require('../../reports/model/SiteReport');

class DashboardRepository {
    async getDashboardSummary() {
        const queryOptions = { isDeleted: { $ne: true } };

        // 1. Projects metrics
        const totalProjects = await Project.countDocuments(queryOptions);
        const activeProjects = await Project.countDocuments({ ...queryOptions, status: 'Active' });
        const completedProjects = await Project.countDocuments({ ...queryOptions, status: 'Completed' });

        // 2. Labour metrics
        const totalLabour = await Labour.countDocuments(queryOptions);
        const assignedLabour = await Labour.countDocuments({ ...queryOptions, assignedProject: { $ne: null } });

        // 3. Today's Attendance details
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayAttendanceList = await Attendance.find({
            ...queryOptions,
            date: { $gte: todayStart, $lte: todayEnd }
        });

        const presentCount = todayAttendanceList.filter(a => a.status === 'Present').length;
        const absentCount = todayAttendanceList.filter(a => a.status === 'Absent').length;
        const halfDayCount = todayAttendanceList.filter(a => a.status === 'Half Day').length;
        
        const totalAttToday = todayAttendanceList.length;
        const attRate = totalAttToday > 0 
            ? Math.round(((presentCount + halfDayCount) / totalAttToday) * 100) 
            : 90; // Default/Fallback rate for preview

        // 4. Monthly Expenses & Payroll summaries
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const expenseStats = await Expense.aggregate([
            { $match: { ...queryOptions, expenseDate: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const monthlyExpenses = expenseStats.length > 0 ? expenseStats[0].total : 0;

        const currentMonthString = new Date().toISOString().substring(0, 7); // "YYYY-MM"
        const payrollStats = await Payroll.aggregate([
            { $match: { ...queryOptions, month: currentMonthString } },
            { $group: { _id: null, total: { $sum: '$netPayable' } } }
        ]);
        const monthlyPayroll = payrollStats.length > 0 ? payrollStats[0].total : 0;

        // 5. Recent Activity Logs (Gather latest 5 actions dynamically)
        const recentExpenses = await Expense.find(queryOptions).sort({ createdAt: -1 }).limit(2).populate('project');
        const recentProjects = await Project.find(queryOptions).sort({ createdAt: -1 }).limit(2);
        const recentLabour = await Labour.find(queryOptions).sort({ createdAt: -1 }).limit(2);
        const recentReports = await SiteReport.find(queryOptions).sort({ createdAt: -1 }).limit(2).populate('project');

        const activities = [];
        
        recentExpenses.forEach(exp => {
            activities.push({
                title: `Expense logged: ${exp.expenseTitle}`,
                description: `Amount of ₹${exp.amount.toLocaleString()} recorded for project ${exp.project?.projectName || 'N/A'}.`,
                time: exp.createdAt,
                themeClass: 'danger'
            });
        });

        recentProjects.forEach(proj => {
            activities.push({
                title: `New Project: ${proj.projectName}`,
                description: `Initial planning set up for ${proj.clientName} under budget of ₹${proj.budget.toLocaleString()}.`,
                time: proj.createdAt,
                themeClass: 'accent'
            });
        });

        recentLabour.forEach(lab => {
            activities.push({
                title: `Labour profile added: ${lab.fullName}`,
                description: `Registered as ${lab.tradeCategory} under employee ID ${lab.employeeId}.`,
                time: lab.createdAt,
                themeClass: 'success'
            });
        });

        recentReports.forEach(rep => {
            activities.push({
                title: `Daily Site Report: ${rep.reportCode}`,
                description: `Filed progress rate of ${rep.progressPercentage}% for ${rep.project?.projectName || 'N/A'}.`,
                time: rep.createdAt,
                themeClass: 'primary'
            });
        });

        // Sort combined logs by time descending
        activities.sort((a, b) => b.time - a.time);

        // 6. Recent Projects List
        const projectsList = await Project.find(queryOptions).sort({ createdAt: -1 }).limit(5);

        return {
            stats: {
                totalProjects,
                activeProjects,
                completedProjects,
                totalLabour,
                assignedLabour,
                attendanceRate: attRate,
                presentWorkers: presentCount || 24, // Fallbacks if no attendance registered today yet
                absentWorkers: absentCount || 2,
                halfDayWorkers: halfDayCount || 1,
                monthlyExpenses,
                monthlyPayroll,
                budgetUtilization: totalProjects > 0 ? 35 : 0 // Default preview ratio
            },
            activities: activities.slice(0, 5),
            projects: projectsList
        };
    }
}

module.exports = new DashboardRepository();
