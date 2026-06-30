const expenseService = require('../service/expenseService');

const getExpenses = async (req, res) => {
    try {
        const result = await expenseService.getExpensesList(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await expenseService.getExpenseById(id);
        res.status(200).json(expense);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const createExpense = async (req, res) => {
    try {
        const userEmail = req.user ? req.user.email : 'system-admin';
        const expense = await expenseService.createExpense(req.body, userEmail);
        res.status(201).json({
            message: 'Expense recorded successfully',
            expense
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userEmail = req.user ? req.user.email : 'system-admin';
        const expense = await expenseService.updateExpense(id, req.body, userEmail);
        res.status(200).json({
            message: 'Expense record updated successfully',
            expense
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        await expenseService.deleteExpense(id);
        res.status(200).json({
            message: 'Expense record soft-deleted successfully'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getExpensesByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const result = await expenseService.getExpensesByProject(projectId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getExpensesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const result = await expenseService.getExpensesByCategory(category);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const uploadReceipt = async (req, res) => {
    try {
        // Return a mock receipt URL path for the client
        const mockUrl = `/uploads/receipts/rec-${Date.now()}.png`;
        res.status(200).json({
            message: 'Receipt uploaded successfully (mock-stored)',
            receiptUrl: mockUrl,
            receiptType: 'image/png'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpensesByProject,
    getExpensesByCategory,
    uploadReceipt
};
