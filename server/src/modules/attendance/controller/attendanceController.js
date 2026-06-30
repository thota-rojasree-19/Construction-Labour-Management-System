const attendanceService = require('../service/attendanceService');

const getAttendances = async (req, res) => {
    try {
        const result = await attendanceService.getAttendanceList(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAttendanceById = async (req, res) => {
    try {
        const { id } = req.params;
        const attendance = await attendanceService.getAttendanceById(id);
        res.status(200).json(attendance);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const createAttendance = async (req, res) => {
    try {
        const recorderEmail = req.user ? req.user.email : 'system';
        const attendance = await attendanceService.createAttendance(req.body, recorderEmail);
        res.status(201).json({
            message: 'Attendance recorded successfully',
            attendance
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const recorderEmail = req.user ? req.user.email : 'system';
        const attendance = await attendanceService.updateAttendance(id, req.body, recorderEmail);
        res.status(200).json({
            message: 'Attendance record updated successfully',
            attendance
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        await attendanceService.deleteAttendance(id);
        res.status(200).json({
            message: 'Attendance record deleted successfully (soft-deleted)'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const bulkMarkAttendance = async (req, res) => {
    try {
        const recorderEmail = req.user ? req.user.email : 'system';
        const result = await attendanceService.bulkMarkAttendance(req.body.records, recorderEmail);
        res.status(200).json({
            message: 'Bulk attendance saved successfully',
            result
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAttendanceByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const result = await attendanceService.getAttendanceByProject(projectId, req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAttendanceByWorker = async (req, res) => {
    try {
        const { workerId } = req.params;
        const result = await attendanceService.getAttendanceByWorker(workerId);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const result = await attendanceService.getAttendanceByDate(date);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAttendances,
    getAttendanceById,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    bulkMarkAttendance,
    getAttendanceByProject,
    getAttendanceByWorker,
    getAttendanceByDate
};
