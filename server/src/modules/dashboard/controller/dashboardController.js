const dashboardService = require('../service/dashboardService');

class DashboardController {
    async getDashboardSummary(req, res) {
        try {
            const summary = await dashboardService.getDashboardSummary();
            return res.status(200).json({ success: true, ...summary });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new DashboardController();
