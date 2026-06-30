const Company = require('../model/Company');

class CompanyService {
    async getCompany() {
        let company = await Company.findOne();
        if (!company) {
            company = await Company.create({
                companyName: 'ConstroConnect Buildcon',
                email: 'admin@constroconnect.com',
                phone: '+91 98765 43210',
                address: '101, Business Hub, Mumbai, India',
                website: 'https://constroconnect.com',
                registrationNumber: 'REG-2026-9901',
                gstNumber: '27AAAAA1111A1Z1',
                taxId: 'TAX-88992'
            });
        }
        return company;
    }

    async updateCompany(data) {
        let company = await Company.findOne();
        if (!company) {
            company = await Company.create(data);
        } else {
            company = await Company.findByIdAndUpdate(company._id, data, { new: true });
        }
        return company;
    }
}

module.exports = new CompanyService();
