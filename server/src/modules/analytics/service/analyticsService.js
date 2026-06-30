const analyticsRepository = require('../repository/analyticsRepository');
const Project = require('../../projects/model/Project');
const Attendance = require('../../attendance/model/Attendance');
const Expense = require('../../expenses/model/Expense');
const Payroll = require('../../payroll/model/Payroll');
const Labour = require('../../labour/model/Labour');

class AnalyticsService {
    async getDashboardKPIs(filters) {
        return await analyticsRepository.getDashboardKPIs(filters);
    }

    async getAttendanceAnalytics(filters) {
        return await analyticsRepository.getAttendanceAnalytics(filters);
    }

    async getExpenseAnalytics(filters) {
        return await analyticsRepository.getExpenseAnalytics(filters);
    }

    async getPayrollAnalytics(filters) {
        return await analyticsRepository.getPayrollAnalytics(filters);
    }

    async getLabourAnalytics(filters) {
        return await analyticsRepository.getLabourAnalytics(filters);
    }

    async getProjectAnalytics(filters) {
        return await analyticsRepository.getProjectAnalytics(filters);
    }

    async getSiteReportAnalytics(filters) {
        return await analyticsRepository.getSiteReportAnalytics(filters);
    }

    async getExecutiveSummary(filters = {}) {
        // Calculate insights across all modules
        const projects = await Project.find({ isDeleted: { $ne: true } });
        if (projects.length === 0) {
            return {
                mostExpensiveProject: 'N/A',
                bestAttendanceProject: 'N/A',
                highestLabourAllocation: 'N/A',
                lowestBudgetConsumption: 'N/A',
                mostDelayedProject: 'N/A',
                highestPayrollProject: 'N/A',
                fastestProgressingProject: 'N/A'
            };
        }

        // 1. Most Expensive Project & Highest Payroll Project
        // We aggregate payroll & expenses by project
        const expensesByProject = await Expense.aggregate([
            { $match: { isDeleted: { $ne: true } } },
            { $group: { _id: "$project", amount: { $sum: "$amount" } } }
        ]);

        const payrollsByProject = await Payroll.aggregate([
            { $match: { isDeleted: { $ne: true } } },
            { $group: { _id: "$project", amount: { $sum: "$netPayable" } } }
        ]);

        const projectCosts = {};
        const projectPayrolls = {};
        
        projects.forEach(p => {
            projectCosts[p._id.toString()] = { name: p.projectName, cost: 0, budget: p.budget };
            projectPayrolls[p._id.toString()] = { name: p.projectName, amount: 0 };
        });

        expensesByProject.forEach(item => {
            if (projectCosts[item._id.toString()]) {
                projectCosts[item._id.toString()].cost += item.amount;
            }
        });

        payrollsByProject.forEach(item => {
            const pId = item._id.toString();
            if (projectCosts[pId]) {
                projectCosts[pId].cost += item.amount;
            }
            if (projectPayrolls[pId]) {
                projectPayrolls[pId].amount += item.amount;
            }
        });

        let mostExpensive = { name: 'None', cost: 0 };
        let highestPayroll = { name: 'None', amount: 0 };
        let lowestConsumption = { name: 'None', ratio: Infinity };

        Object.keys(projectCosts).forEach(pId => {
            const p = projectCosts[pId];
            if (p.cost > mostExpensive.cost) {
                mostExpensive = { name: p.name, cost: p.cost };
            }
            
            const ratio = p.budget > 0 ? (p.cost / p.budget) : 0;
            if (ratio < lowestConsumption.ratio && p.cost > 0) {
                lowestConsumption = { name: p.name, ratio };
            }
        });

        Object.keys(projectPayrolls).forEach(pId => {
            const p = projectPayrolls[pId];
            if (p.amount > highestPayroll.amount) {
                highestPayroll = { name: p.name, amount: p.amount };
            }
        });

        // 2. Best Attendance Project
        const attendanceByProject = await Attendance.aggregate([
            { $match: { isDeleted: { $ne: true } } },
            {
                $group: {
                    _id: "$project",
                    total: { $sum: 1 },
                    present: { $sum: { $cond: [{ $in: ["$status", ["Present", "Half Day"]] }, 1, 0] } }
                }
            }
        ]);

        let bestAttendance = { name: 'None', rate: 0 };
        const attendanceMap = {};
        attendanceByProject.forEach(item => {
            attendanceMap[item._id.toString()] = item.present / item.total;
        });

        projects.forEach(p => {
            const rate = attendanceMap[p._id.toString()] || 0;
            if (rate > bestAttendance.rate) {
                bestAttendance = { name: p.projectName, rate };
            }
        });

        // 3. Highest Labour Allocation
        const labourByProject = await Labour.aggregate([
            { $match: { isDeleted: { $ne: true }, status: 'Active' } },
            { $group: { _id: "$assignedProject", count: { $sum: 1 } } }
        ]);

        let highestAllocation = { name: 'None', count: 0 };
        const allocationMap = {};
        labourByProject.forEach(item => {
            if (item._id) {
                allocationMap[item._id.toString()] = item.count;
            }
        });

        projects.forEach(p => {
            const count = allocationMap[p._id.toString()] || 0;
            if (count > highestAllocation.count) {
                highestAllocation = { name: p.projectName, count };
            }
        });

        // 4. Most Delayed Project & Fastest Progressing Project
        let mostDelayed = 'None';
        let fastestProgressing = 'None';
        let maxDelayDays = 0;
        let maxProgress = 0;

        projects.forEach(p => {
            if (p.status === 'Active' || p.status === 'On Hold') {
                const today = new Date();
                const expected = new Date(p.expectedEndDate);
                if (today > expected) {
                    const diffDays = Math.ceil((today - expected) / (1000 * 60 * 60 * 24));
                    if (diffDays > maxDelayDays) {
                        maxDelayDays = diffDays;
                        mostDelayed = p.projectName;
                    }
                }
            }

            if (p.progress > maxProgress) {
                maxProgress = p.progress;
                fastestProgressing = p.projectName;
            }
        });

        if (mostDelayed === 'None' && projects.some(p => p.status === 'On Hold')) {
            const onHold = projects.find(p => p.status === 'On Hold');
            mostDelayed = onHold ? onHold.projectName : 'None';
        }

        return {
            mostExpensiveProject: mostExpensive.name,
            bestAttendanceProject: bestAttendance.name !== 'None' ? `${bestAttendance.name} (${(bestAttendance.rate * 100).toFixed(0)}%)` : 'N/A',
            highestLabourAllocation: highestAllocation.name !== 'None' ? `${highestAllocation.name} (${highestAllocation.count} Workers)` : 'N/A',
            lowestBudgetConsumption: lowestConsumption.name !== 'None' ? lowestConsumption.name : 'N/A',
            mostDelayedProject: mostDelayed,
            highestPayrollProject: highestPayroll.name,
            fastestProgressingProject: fastestProgressing !== 'None' ? `${fastestProgressing} (${maxProgress}%)` : 'N/A'
        };
    }
}

module.exports = new AnalyticsService();
