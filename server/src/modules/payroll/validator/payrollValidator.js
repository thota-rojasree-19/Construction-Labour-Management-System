const mongoose = require('mongoose');

const validateCreatePayroll = (req, res, next) => {
    const { worker, project, month, dailyWage } = req.body;

    if (!worker || !mongoose.Types.ObjectId.isValid(worker)) {
        return res.status(400).json({ message: 'Valid worker reference (ID) is required.' });
    }

    if (project && !mongoose.Types.ObjectId.isValid(project)) {
        return res.status(400).json({ message: 'Provided project reference is invalid.' });
    }

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ message: 'Valid month in YYYY-MM format is required.' });
    }

    next();
};

const validateRecordAdvance = (req, res, next) => {
    const { worker, project, amount, date } = req.body;

    if (!worker || !mongoose.Types.ObjectId.isValid(worker)) {
        return res.status(400).json({ message: 'Valid worker reference (ID) is required.' });
    }

    if (!project || !mongoose.Types.ObjectId.isValid(project)) {
        return res.status(400).json({ message: 'Valid project reference (ID) is required.' });
    }

    if (amount === undefined || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Advance amount must be a positive number.' });
    }

    if (date && isNaN(Date.parse(date))) {
        return res.status(400).json({ message: 'Provided date is invalid.' });
    }

    next();
};

module.exports = {
    validateCreatePayroll,
    validateRecordAdvance
};
