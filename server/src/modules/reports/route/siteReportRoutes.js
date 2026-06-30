const express = require('express');
const router = express.Router();
const siteReportController = require('../controller/siteReportController');
const { protect } = require('../../../middlewares/authMiddleware');
const { validateCreateReport } = require('../validator/siteReportValidator');

// Read endpoints
router.get('/', siteReportController.getReports);
router.get('/project/:projectId', siteReportController.getReportsByProject);
router.get('/:id', siteReportController.getReportById);

// Write endpoints (protected)
router.post('/', protect, validateCreateReport, siteReportController.createReport);
router.put('/:id', protect, siteReportController.updateReport);
router.delete('/:id', protect, siteReportController.deleteReport);
router.post('/upload-photos', protect, siteReportController.uploadPhotos);

module.exports = router;
