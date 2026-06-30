const express = require('express');
const router = express.Router();
const reportExportService = require('../service/reportExportService');
const { protect } = require('../../../middlewares/authMiddleware');

router.get('/pdf', protect, async (req, res) => {
    try {
        const { module: moduleType } = req.query;
        if (!moduleType) {
            return res.status(400).json({ success: false, message: 'Module parameter is required' });
        }
        const data = await reportExportService.getReportData(moduleType, req.query);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/excel', protect, async (req, res) => {
    try {
        const { module: moduleType } = req.query;
        if (!moduleType) {
            return res.status(400).json({ success: false, message: 'Module parameter is required' });
        }
        
        const data = await reportExportService.getReportData(moduleType, req.query);
        const csvContent = reportExportService.convertToCSV(data);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${moduleType}_report_${Date.now()}.csv`);
        return res.status(200).send(csvContent);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
