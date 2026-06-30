const analyticsService = require('../service/analyticsService');

class AnalyticsController {
    // Helper to extract common filters
    _parseFilters(req) {
        const { project, startDate, endDate, month, year } = req.query;
        const filters = {};
        if (project) filters.project = project;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (month) filters.month = month;
        if (year) filters.year = year;
        return filters;
    }

    async getDashboardKPIs(req, res) {
        try {
            const filters = this._parseFilters(req);
            const data = await analyticsService.getDashboardKPIs(filters);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAttendanceAnalytics(req, res) {
        try {
            const filters = this._parseFilters(req);
            const data = await analyticsService.getAttendanceAnalytics(filters);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getExpenseAnalytics(req, res) {
        try {
            const filters = this._parseFilters(req);
            const data = await analyticsService.getExpenseAnalytics(filters);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getPayrollAnalytics(req, res) {
        try {
            const filters = this._parseFilters(req);
            const data = await analyticsService.getPayrollAnalytics(filters);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getLabourAnalytics(req, res) {
        try {
            const filters = this._parseFilters(req);
            const data = await analyticsService.getLabourAnalytics(filters);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getProjectAnalytics(req, res) {
        try {
            const filters = this._parseFilters(req);
            const data = await analyticsService.getProjectAnalytics(filters);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getSiteReportAnalytics(req, res) {
        try {
            const filters = this._parseFilters(req);
            const data = await analyticsService.getSiteReportAnalytics(filters);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getExecutiveSummary(req, res) {
        try {
            const filters = this._parseFilters(req);
            const data = await analyticsService.getExecutiveSummary(filters);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AnalyticsController();
