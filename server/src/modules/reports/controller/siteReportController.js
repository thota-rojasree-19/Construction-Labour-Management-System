const siteReportService = require('../service/siteReportService');

const getReports = async (req, res) => {
    try {
        const result = await siteReportService.getReportsList(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await siteReportService.getReportById(id);
        res.status(200).json(report);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const createReport = async (req, res) => {
    try {
        const userEmail = req.user ? req.user.email : 'system-admin';
        // Auto assign engineer ID from req.user if available
        const engineerId = req.user ? req.user.id || req.user._id : null;
        
        const payload = {
            ...req.body,
            engineer: req.body.engineer || engineerId
        };

        const report = await siteReportService.createReport(payload, userEmail);
        res.status(201).json({
            message: 'Daily site report recorded successfully',
            report
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const userEmail = req.user ? req.user.email : 'system-admin';
        const report = await siteReportService.updateReport(id, req.body, userEmail);
        res.status(200).json({
            message: 'Daily site report updated successfully',
            report
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        await siteReportService.deleteReport(id);
        res.status(200).json({
            message: 'Daily site report soft-deleted successfully'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getReportsByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const result = await siteReportService.getReportsByProject(projectId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const uploadPhotos = async (req, res) => {
    try {
        // Return mock paths for Before/During/After site progress images
        const timestamp = Date.now();
        const urls = [
            `/uploads/reports/photo-${timestamp}-1.png`,
            `/uploads/reports/photo-${timestamp}-2.png`
        ];
        res.status(200).json({
            message: 'Photos uploaded successfully (mock-stored)',
            urls
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
    getReportsByProject,
    uploadPhotos
};
