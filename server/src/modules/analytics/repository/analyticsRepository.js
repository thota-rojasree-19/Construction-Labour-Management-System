const mongoose = require('mongoose');
const Project = require('../../projects/model/Project');
const Labour = require('../../labour/model/Labour');
const Attendance = require('../../attendance/model/Attendance');
const Payroll = require('../../payroll/model/Payroll');
const Expense = require('../../expenses/model/Expense');
const SiteReport = require('../../reports/model/SiteReport');

class AnalyticsRepository {
    // 1. Dashboard Executive KPIs
    async getDashboardKPIs(filters = {}) {
        const projectMatch = { isDeleted: { $ne: true } };
        const labourMatch = { isDeleted: { $ne: true } };
        const attendanceMatch = { isDeleted: { $ne: true } };
        const expenseMatch = { isDeleted: { $ne: true } };
        const payrollMatch = { isDeleted: { $ne: true } };

        if (filters.project) {
            const projId = new mongoose.Types.ObjectId(filters.project);
            projectMatch._id = projId;
            labourMatch.assignedProject = projId;
            attendanceMatch.project = projId;
            expenseMatch.project = projId;
            payrollMatch.project = projId;
        }

        // Handle date bounds if present
        if (filters.startDate || filters.endDate) {
            const dateQ = {};
            if (filters.startDate) dateQ.$gte = new Date(filters.startDate);
            if (filters.endDate) dateQ.$lte = new Date(filters.endDate);
            attendanceMatch.date = dateQ;
            expenseMatch.expenseDate = dateQ;
        }

        // Projects statistics
        const totalProjects = await Project.countDocuments({ isDeleted: { $ne: true } });
        const activeProjects = await Project.countDocuments({ isDeleted: { $ne: true }, status: 'Active' });
        
        // Labour statistics
        const totalWorkers = await Labour.countDocuments(labourMatch);
        
        // Average attendance
        const attendanceStats = await Attendance.aggregate([
            { $match: attendanceMatch },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    present: {
                        $sum: {
                            $cond: [
                                { $in: ["$status", ["Present", "Half Day"]] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);
        const attendanceRate = attendanceStats.length > 0 
            ? parseFloat(((attendanceStats[0].present / attendanceStats[0].total) * 100).toFixed(2)) 
            : 85.0; // default/fallback average

        // Monthly Payroll
        const payrollStats = await Payroll.aggregate([
            { $match: payrollMatch },
            { $group: { _id: null, total: { $sum: "$netPayable" } } }
        ]);
        const totalPayroll = payrollStats.length > 0 ? payrollStats[0].total : 0;

        // Monthly Expenses
        const expenseStats = await Expense.aggregate([
            { $match: expenseMatch },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalExpenses = expenseStats.length > 0 ? expenseStats[0].total : 0;

        // Budget utilization
        const budgetStats = await Project.aggregate([
            { $match: projectMatch },
            { $group: { _id: null, totalBudget: { $sum: "$budget" }, avgProgress: { $avg: "$progress" } } }
        ]);
        const totalBudget = budgetStats.length > 0 ? budgetStats[0].totalBudget : 0;
        const avgProgress = budgetStats.length > 0 ? parseFloat(budgetStats[0].avgProgress.toFixed(2)) : 0;

        return {
            totalProjects,
            activeProjects,
            totalWorkers,
            attendanceRate,
            totalPayroll,
            totalExpenses,
            totalBudget,
            avgProgress
        };
    }

    // 2. Attendance Analytics
    async getAttendanceAnalytics(filters = {}) {
        const match = { isDeleted: { $ne: true } };
        if (filters.project) {
            match.project = new mongoose.Types.ObjectId(filters.project);
        }
        if (filters.startDate || filters.endDate) {
            match.date = {};
            if (filters.startDate) match.date.$gte = new Date(filters.startDate);
            if (filters.endDate) match.date.$lte = new Date(filters.endDate);
        }

        // Daily trend
        const dailyTrend = await Attendance.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
                    halfDay: { $sum: { $cond: [{ $eq: ["$status", "Half Day"] }, 1, 0] } },
                    absent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 30 }
        ]);

        // Status Distribution
        const distribution = await Attendance.aggregate([
            { $match: match },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Project wise Attendance
        const projectWise = await Attendance.aggregate([
            { $match: match },
            {
                $group: {
                    _id: "$project",
                    total: { $sum: 1 },
                    present: { $sum: { $cond: [{ $in: ["$status", ["Present", "Half Day"]] }, 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: "projects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "projectInfo"
                }
            },
            { $unwind: "$projectInfo" },
            {
                $project: {
                    projectName: "$projectInfo.projectName",
                    rate: { $multiply: [{ $divide: ["$present", "$total"] }, 100] }
                }
            }
        ]);

        return {
            dailyTrend,
            distribution,
            projectWise
        };
    }

    // 3. Expense Analytics
    async getExpenseAnalytics(filters = {}) {
        const match = { isDeleted: { $ne: true } };
        if (filters.project) {
            match.project = new mongoose.Types.ObjectId(filters.project);
        }
        if (filters.startDate || filters.endDate) {
            match.expenseDate = {};
            if (filters.startDate) match.expenseDate.$gte = new Date(filters.startDate);
            if (filters.endDate) match.expenseDate.$lte = new Date(filters.endDate);
        }

        // Monthly trends
        const monthlyTrend = await Expense.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$expenseDate" } },
                    amount: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Categories
        const categoryWise = await Expense.aggregate([
            { $match: match },
            { $group: { _id: "$category", amount: { $sum: "$amount" } } },
            { $sort: { amount: -1 } }
        ]);

        // Projects
        const projectWise = await Expense.aggregate([
            { $match: match },
            { $group: { _id: "$project", amount: { $sum: "$amount" } } },
            {
                $lookup: {
                    from: "projects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "projectInfo"
                }
            },
            { $unwind: "$projectInfo" },
            {
                $project: {
                    projectName: "$projectInfo.projectName",
                    amount: 1,
                    budget: "$projectInfo.budget"
                }
            }
        ]);

        return {
            monthlyTrend,
            categoryWise,
            projectWise
        };
    }

    // 4. Payroll Analytics
    async getPayrollAnalytics(filters = {}) {
        const match = { isDeleted: { $ne: true } };
        if (filters.project) {
            match.project = new mongoose.Types.ObjectId(filters.project);
        }

        // Monthly trend
        const monthlyTrend = await Payroll.aggregate([
            { $match: match },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: "$netPayable" },
                    bonus: { $sum: "$bonus" },
                    penalty: { $sum: "$penalty" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Status
        const statusDistribution = await Payroll.aggregate([
            { $match: match },
            { $group: { _id: "$paymentStatus", count: { $sum: 1 }, total: { $sum: "$netPayable" } } }
        ]);

        // Projects
        const projectWise = await Payroll.aggregate([
            { $match: match },
            { $group: { _id: "$project", amount: { $sum: "$netPayable" } } },
            {
                $lookup: {
                    from: "projects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "projectInfo"
                }
            },
            { $unwind: "$projectInfo" },
            { $project: { projectName: "$projectInfo.projectName", amount: 1 } }
        ]);

        return {
            monthlyTrend,
            statusDistribution,
            projectWise
        };
    }

    // 5. Labour Analytics
    async getLabourAnalytics(filters = {}) {
        const match = { isDeleted: { $ne: true } };
        if (filters.project) {
            match.assignedProject = new mongoose.Types.ObjectId(filters.project);
        }

        // Trade Distribution
        const trades = await Labour.aggregate([
            { $match: match },
            { $group: { _id: "$tradeCategory", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Skills Level
        const skills = await Labour.aggregate([
            { $match: match },
            { $group: { _id: "$skillLevel", count: { $sum: 1 } } }
        ]);

        // Project wise Allocation
        const projectAllocation = await Labour.aggregate([
            { $match: match },
            { $group: { _id: "$assignedProject", count: { $sum: 1 } } },
            {
                $lookup: {
                    from: "projects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "projectInfo"
                }
            },
            {
                $project: {
                    projectName: { 
                        $cond: [
                            { $gt: [{ $size: "$projectInfo" }, 0] },
                            { $arrayElemAt: ["$projectInfo.projectName", 0] },
                            "Unassigned"
                        ]
                    },
                    count: 1
                }
            }
        ]);

        return {
            trades,
            skills,
            projectAllocation
        };
    }

    // 6. Project Analytics
    async getProjectAnalytics(filters = {}) {
        const match = { isDeleted: { $ne: true } };
        if (filters.project) {
            match._id = new mongoose.Types.ObjectId(filters.project);
        }

        const projectList = await Project.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "expenses",
                    localField: "_id",
                    foreignField: "project",
                    pipeline: [{ $match: { isDeleted: { $ne: true } } }],
                    as: "expensesList"
                }
            },
            {
                $lookup: {
                    from: "payrolls",
                    localField: "_id",
                    foreignField: "project",
                    pipeline: [{ $match: { isDeleted: { $ne: true } } }],
                    as: "payrollList"
                }
            },
            {
                $project: {
                    projectName: 1,
                    budget: 1,
                    progress: 1,
                    status: 1,
                    startDate: 1,
                    expectedEndDate: 1,
                    totalExpenses: { $sum: "$expensesList.amount" },
                    totalPayroll: { $sum: "$payrollList.netPayable" }
                }
            }
        ]);

        return projectList;
    }

    // 7. Site Report Analytics
    async getSiteReportAnalytics(filters = {}) {
        const match = { isDeleted: { $ne: true } };
        if (filters.project) {
            match.project = new mongoose.Types.ObjectId(filters.project);
        }
        if (filters.startDate || filters.endDate) {
            match.reportDate = {};
            if (filters.startDate) match.reportDate.$gte = new Date(filters.startDate);
            if (filters.endDate) match.reportDate.$lte = new Date(filters.endDate);
        }

        const dailyReportsTrend = await SiteReport.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$reportDate" } },
                    count: { $sum: 1 },
                    labourCount: { $sum: "$labourCount" },
                    avgProgress: { $avg: "$progressPercentage" }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 30 }
        ]);

        return {
            dailyReportsTrend
        };
    }
}

module.exports = new AnalyticsRepository();
