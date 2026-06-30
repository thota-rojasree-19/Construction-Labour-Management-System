const express = require('express');
const router = express.Router();
const attendanceController = require('../controller/attendanceController');
const { protect } = require('../../../middlewares/authMiddleware');
const { 
    validateCreateAttendance, 
    validateUpdateAttendance, 
    validateBulkAttendance 
} = require('../validator/attendanceValidator');

// Read endpoints
router.get('/', attendanceController.getAttendances);
router.get('/project/:projectId', attendanceController.getAttendanceByProject);
router.get('/worker/:workerId', attendanceController.getAttendanceByWorker);
router.get('/date/:date', attendanceController.getAttendanceByDate);
router.get('/:id', attendanceController.getAttendanceById);

// Write endpoints (protected)
router.post('/', protect, validateCreateAttendance, attendanceController.createAttendance);
router.put('/:id', protect, validateUpdateAttendance, attendanceController.updateAttendance);
router.delete('/:id', protect, attendanceController.deleteAttendance);
router.post('/bulk', protect, validateBulkAttendance, attendanceController.bulkMarkAttendance);

module.exports = router;
