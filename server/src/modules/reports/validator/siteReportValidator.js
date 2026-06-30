const mongoose = require('mongoose');

const validateCreateReport = (req, res, next) => {
    const { project, reportDate, workCompleted, progressPercentage, labourCount } = req.body;

    if (!project || !mongoose.Types.ObjectId.isValid(project)) {
        return res.status(400).json({ message: 'Valid project reference (ID) is required.' });
    }

    if (!reportDate || isNaN(Date.parse(reportDate))) {
        return res.status(400).json({ message: 'Valid report date is required.' });
    }

    if (!workCompleted || workCompleted.trim() === '') {
        return res.status(400).json({ message: 'Work completed summary is required.' });
    }

    if (progressPercentage !== undefined && (isNaN(progressPercentage) || progressPercentage < 0 || progressPercentage > 100)) {
        return res.status(400).json({ message: 'Progress percentage must be between 0 and 100.' });
    }

    if (labourCount !== undefined && (isNaN(labourCount) || labourCount < 0)) {
        return res.status(400).json({ message: 'Labour count must be a non-negative number.' });
    }

    next();
};

module.exports = {
    validateCreateReport
};
