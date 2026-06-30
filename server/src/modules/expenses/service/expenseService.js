const expenseRepository = require('../repository/expenseRepository');
const Project = require('../../projects/model/Project');
const Expense = require('../model/Expense');

const createExpense = async (expenseData, userEmail) => {
    // Optionally check project budget warning threshold
    const project = await Project.findOne({ _id: expenseData.project, isDeleted: false });
    if (!project) throw new Error('Allocated project site not found.');

    const expense = await expenseRepository.create({
        ...expenseData,
        createdBy: userEmail
    });

    return expense;
};

const updateExpense = async (id, updateData, userEmail) => {
    const expense = await Expense.findOne({ _id: id, isDeleted: false });
    if (!expense) throw new Error('Expense record not found');

    return await expenseRepository.update(id, {
        ...updateData,
        updatedBy: userEmail
    });
};

const deleteExpense = async (id) => {
    const expense = await Expense.findOne({ _id: id, isDeleted: false });
    if (!expense) throw new Error('Expense record not found');
    return await expenseRepository.softDelete(id);
};

const getExpenseById = async (id) => {
    const expense = await expenseRepository.findById(id);
    if (!expense) throw new Error('Expense record not found');
    return expense;
};

const getExpensesList = async (queryParams) => {
    const {
        search,
        project,
        category,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        paymentMethod,
        sortBy = 'expenseDate',
        sortOrder = 'desc',
        page = 1,
        limit = 10
    } = queryParams;

    const filter = {};

    if (project) filter.project = project;
    if (category) filter.category = category;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    // Amount range
    if (minAmount || maxAmount) {
        filter.amount = {};
        if (minAmount) filter.amount.$gte = parseFloat(minAmount);
        if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }

    // Date range
    if (startDate || endDate) {
        filter.expenseDate = {};
        if (startDate) filter.expenseDate.$gte = new Date(startDate);
        if (endDate) filter.expenseDate.$lte = new Date(endDate);
    }

    // Search query matching
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
            { expenseTitle: searchRegex },
            { vendor: searchRegex },
            { description: searchRegex }
        ];
    }

    const sort = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    if (['amount', 'expenseDate', 'createdAt'].includes(sortBy)) {
        sort[sortBy] = order;
    } else {
        sort.expenseDate = -1;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const expenses = await expenseRepository.find(filter, sort, skip, limitNum);
    const totalResults = await expenseRepository.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limitNum);

    // Compute Executive Dashboard Financial Statistics
    const allExpenses = await Expense.find({ isDeleted: false }).populate('project');

    let totalVal = 0;
    let todayVal = 0;
    let monthlyVal = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const categorySummary = {};
    const projectSummary = {};

    allExpenses.forEach(exp => {
        const amt = exp.amount || 0;
        totalVal += amt;

        // Group by category
        categorySummary[exp.category] = (categorySummary[exp.category] || 0) + amt;

        // Group by project
        if (exp.project) {
            const pId = exp.project._id.toString();
            if (!projectSummary[pId]) {
                projectSummary[pId] = {
                    projectName: exp.project.projectName,
                    budget: exp.project.budget || 0,
                    spent: 0
                };
            }
            projectSummary[pId].spent += amt;
        }

        const expDate = new Date(exp.expenseDate);
        const expDateStr = expDate.toISOString().split('T')[0];
        
        // Today check
        if (expDateStr === todayStr) {
            todayVal += amt;
        }

        // Current Month check
        if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
            monthlyVal += amt;
        }
    });

    // Determine highest category
    let highestCat = 'N/A';
    let maxCatVal = 0;
    Object.entries(categorySummary).forEach(([cat, val]) => {
        if (val > maxCatVal) {
            maxCatVal = val;
            highestCat = cat;
        }
    });

    // Compile project budget utilization details
    const budgetUtilization = Object.entries(projectSummary).map(([id, info]) => {
        const utilization = info.budget > 0
            ? Math.round((info.spent / info.budget) * 100)
            : 0;

        return {
            projectId: id,
            projectName: info.projectName,
            budget: info.budget,
            spent: info.spent,
            remaining: Math.max(0, info.budget - info.spent),
            utilizationPercentage: utilization,
            exceedsThreshold: utilization > 90
        };
    });

    return {
        expenses,
        pagination: {
            page: pageNum,
            limit: limitNum,
            totalPages,
            totalResults
        },
        statistics: {
            totalExpenses: totalVal,
            todayExpenses: todayVal,
            monthlyExpenses: monthlyVal,
            highestCategory: highestCat,
            categorySummary,
            budgetUtilization
        }
    };
};

const getExpensesByProject = async (projectId) => {
    return await Expense.find({ project: projectId, isDeleted: false });
};

const getExpensesByCategory = async (category) => {
    return await Expense.find({ category, isDeleted: false }).populate('project');
};

module.exports = {
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseById,
    getExpensesList,
    getExpensesByProject,
    getExpensesByCategory
};
