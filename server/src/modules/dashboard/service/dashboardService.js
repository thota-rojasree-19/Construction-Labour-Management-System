const dashboardRepository = require('../repository/dashboardRepository');

class DashboardService {
    async getDashboardSummary() {
        return await dashboardRepository.getDashboardSummary();
    }
}

module.exports = new DashboardService();
