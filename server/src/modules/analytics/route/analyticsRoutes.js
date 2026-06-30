const express = require('express');
const router = express.Router();
const analyticsController = require('../controller/analyticsController');
const { protect } = require('../../../middlewares/authMiddleware');

// Secure all analytics routes
router.use(protect);

router.get('/dashboard', (req, res) => analyticsController.getDashboardKPIs(req, res));
router.get('/attendance', (req, res) => analyticsController.getAttendanceAnalytics(req, res));
router.get('/expenses', (req, res) => analyticsController.getExpenseAnalytics(req, res));
router.get('/payroll', (req, res) => analyticsController.getPayrollAnalytics(req, res));
router.get('/labour', (req, res) => analyticsController.getLabourAnalytics(req, res));
router.get('/projects', (req, res) => analyticsController.getProjectAnalytics(req, res));
router.get('/site-reports', (req, res) => analyticsController.getSiteReportAnalytics(req, res));
router.get('/executive-summary', (req, res) => analyticsController.getExecutiveSummary(req, res));

module.exports = router;
