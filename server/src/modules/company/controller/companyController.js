const companyService = require('../service/companyService');

class CompanyController {
    async getCompany(req, res) {
        try {
            const company = await companyService.getCompany();
            return res.status(200).json({ success: true, company });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateCompany(req, res) {
        try {
            const company = await companyService.updateCompany(req.body);
            return res.status(200).json({ success: true, company });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new CompanyController();
