const payrollService = require('../service/payrollService');

const getPayrolls = async (req, res) => {
    try {
        const result = await payrollService.getPayrollList(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getPayrollById = async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await payrollService.getPayrollById(id);
        if (!payroll) {
            return res.status(404).json({ message: 'Payroll record not found' });
        }
        res.status(200).json(payroll);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const createPayroll = async (req, res) => {
    try {
        const userEmail = req.user ? req.user.email : 'system-admin';
        const payroll = await payrollService.generatePayroll(req.body, userEmail);
        res.status(201).json({
            message: 'Payroll generated successfully',
            payroll
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updatePayroll = async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await payrollService.updatePayroll(id, req.body);
        res.status(200).json({
            message: 'Payroll details updated successfully',
            payroll
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deletePayroll = async (req, res) => {
    try {
        const { id } = req.params;
        await payrollService.deletePayroll(id);
        res.status(200).json({
            message: 'Payroll record deleted successfully'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const generatePayroll = async (req, res) => {
    try {
        const userEmail = req.user ? req.user.email : 'system-admin';
        const payroll = await payrollService.generatePayroll(req.body, userEmail);
        res.status(201).json({
            message: 'Payroll record created successfully',
            payroll
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const markPaid = async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await payrollService.markPayrollPaid(id);
        res.status(200).json({
            message: 'Payroll marked as paid successfully',
            payroll
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getPayrollsByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const payrolls = await payrollService.getPayrollsByProject(projectId);
        res.status(200).json(payrolls);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getPayrollsByLabour = async (req, res) => {
    try {
        const { labourId } = req.params;
        const payrolls = await payrollService.getPayrollsByLabour(labourId);
        res.status(200).json(payrolls);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const previewCalculation = async (req, res) => {
    try {
        const { workerId, month } = req.query;
        if (!workerId || !month) {
            return res.status(400).json({ message: 'workerId and month (YYYY-MM) are required parameters.' });
        }
        const result = await payrollService.calculateWorkerSalaryForMonth(workerId, month);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const recordAdvance = async (req, res) => {
    try {
        const advance = await payrollService.recordAdvance(req.body);
        res.status(201).json({
            message: 'Cash advance recorded successfully',
            advance
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAdvances = async (req, res) => {
    try {
        const result = await payrollService.getAdvancesList(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getPayrolls,
    getPayrollById,
    createPayroll,
    updatePayroll,
    deletePayroll,
    generatePayroll,
    markPaid,
    getPayrollsByProject,
    getPayrollsByLabour,
    previewCalculation,
    recordAdvance,
    getAdvances
};
