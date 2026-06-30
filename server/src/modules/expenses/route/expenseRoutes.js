const express = require('express');
const router = express.Router();
const expenseController = require('../controller/expenseController');
const { protect } = require('../../../middlewares/authMiddleware');
const { validateCreateExpense } = require('../validator/expenseValidator');

// Read endpoints
router.get('/', expenseController.getExpenses);
router.get('/project/:projectId', expenseController.getExpensesByProject);
router.get('/category/:category', expenseController.getExpensesByCategory);
router.get('/:id', expenseController.getExpenseById);

// Write endpoints (protected)
router.post('/', protect, validateCreateExpense, expenseController.createExpense);
router.put('/:id', protect, expenseController.updateExpense);
router.delete('/:id', protect, expenseController.deleteExpense);
router.post('/upload-receipt', protect, expenseController.uploadReceipt);

module.exports = router;
