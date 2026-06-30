const mongoose = require('mongoose');

const validateCreateAttendance = (req, res, next) => {
    const { worker, project, date, status, shift } = req.body;

    if (!worker || !mongoose.Types.ObjectId.isValid(worker)) {
        return res.status(400).json({ message: 'Valid worker reference (ID) is required.' });
    }

    if (!project || !mongoose.Types.ObjectId.isValid(project)) {
        return res.status(400).json({ message: 'Valid project reference (ID) is required.' });
    }

    if (!date || isNaN(Date.parse(date))) {
        return res.status(400).json({ message: 'Valid date is required.' });
    }

    const validStatuses = ['Present', 'Absent', 'Half Day', 'Leave', 'Holiday', 'Site Closed'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const validShifts = ['General', 'Day', 'Night'];
    if (shift && !validShifts.includes(shift)) {
        return res.status(400).json({ message: `Shift must be one of: ${validShifts.join(', ')}` });
    }

    next();
};

const validateUpdateAttendance = (req, res, next) => {
    const { worker, project, date, status, shift } = req.body;

    if (worker && !mongoose.Types.ObjectId.isValid(worker)) {
        return res.status(400).json({ message: 'Worker must be a valid ObjectId.' });
    }

    if (project && !mongoose.Types.ObjectId.isValid(project)) {
        return res.status(400).json({ message: 'Project must be a valid ObjectId.' });
    }

    if (date && isNaN(Date.parse(date))) {
        return res.status(400).json({ message: 'Provided date is invalid.' });
    }

    const validStatuses = ['Present', 'Absent', 'Half Day', 'Leave', 'Holiday', 'Site Closed'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const validShifts = ['General', 'Day', 'Night'];
    if (shift && !validShifts.includes(shift)) {
        return res.status(400).json({ message: `Shift must be one of: ${validShifts.join(', ')}` });
    }

    next();
};

const validateBulkAttendance = (req, res, next) => {
    const { records } = req.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ message: 'Request must contain a non-empty array of records.' });
    }

    const validStatuses = ['Present', 'Absent', 'Half Day', 'Leave', 'Holiday', 'Site Closed'];
    const validShifts = ['General', 'Day', 'Night'];

    for (let i = 0; i < records.length; i++) {
        const r = records[i];
        if (!r.worker || !mongoose.Types.ObjectId.isValid(r.worker)) {
            return res.status(400).json({ message: `Record at index ${i} has an invalid or missing worker ID.` });
        }
        if (!r.project || !mongoose.Types.ObjectId.isValid(r.project)) {
            return res.status(400).json({ message: `Record at index ${i} has an invalid or missing project ID.` });
        }
        if (!r.date || isNaN(Date.parse(r.date))) {
            return res.status(400).json({ message: `Record at index ${i} has an invalid or missing date.` });
        }
        if (r.status && !validStatuses.includes(r.status)) {
            return res.status(400).json({ message: `Record at index ${i} has an invalid status: ${r.status}` });
        }
        if (r.shift && !validShifts.includes(r.shift)) {
            return res.status(400).json({ message: `Record at index ${i} has an invalid shift: ${r.shift}` });
        }
    }

    next();
};

module.exports = {
    validateCreateAttendance,
    validateUpdateAttendance,
    validateBulkAttendance
};
