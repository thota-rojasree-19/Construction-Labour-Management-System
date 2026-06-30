const mongoose = require('mongoose');

const validateCreateExpense = (req, res, next) => {
    const { project, category, expenseTitle, vendor, amount, expenseDate } = req.body;

    if (!project || !mongoose.Types.ObjectId.isValid(project)) {
        return res.status(400).json({ message: 'Valid project reference (ID) is required.' });
    }

    if (!expenseTitle || expenseTitle.trim() === '') {
        return res.status(400).json({ message: 'Expense title is required.' });
    }

    if (!vendor || vendor.trim() === '') {
        return res.status(400).json({ message: 'Vendor/Supplier name is required.' });
    }

    if (amount === undefined || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Expense amount must be a positive number.' });
    }

    if (!expenseDate || isNaN(Date.parse(expenseDate))) {
        return res.status(400).json({ message: 'Valid expense date is required.' });
    }

    const validCategories = [
        'Labour', 'Transport', 'Food', 'Machinery', 'Fuel', 'Materials', 
        'Equipment Rental', 'Safety Equipment', 'Accommodation', 'Utilities', 
        'Maintenance', 'Miscellaneous'
    ];
    
    if (category && !validCategories.includes(category)) {
        return res.status(400).json({ message: `Expense category must be one of: ${validCategories.join(', ')}` });
    }

    next();
};

module.exports = {
    validateCreateExpense
};
