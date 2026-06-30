const labourService = require('../service/labourService');

const getLabours = async (req, res) => {
    try {
        const result = await labourService.getLabourList(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getLabourById = async (req, res) => {
    try {
        const { id } = req.params;
        const labour = await labourService.getLabourById(id);
        res.status(200).json(labour);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const createLabour = async (req, res) => {
    try {
        const creatorEmail = req.user ? req.user.email : 'system-admin';
        const labour = await labourService.registerLabour(req.body, creatorEmail);
        res.status(201).json({
            message: 'Labour registered successfully',
            labour
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateLabour = async (req, res) => {
    try {
        const { id } = req.params;
        const updaterEmail = req.user ? req.user.email : 'system-admin';
        const labour = await labourService.updateLabour(id, req.body, updaterEmail);
        res.status(200).json({
            message: 'Labour record updated successfully',
            labour
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteLabour = async (req, res) => {
    try {
        const { id } = req.params;
        await labourService.deleteLabour(id);
        res.status(200).json({
            message: 'Labour record deleted successfully (soft-deleted)'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const assignProject = async (req, res) => {
    try {
        const { id } = req.params;
        const updaterEmail = req.user ? req.user.email : 'system-admin';
        const labour = await labourService.assignProject(id, req.body, updaterEmail);
        res.status(200).json({
            message: 'Labour project assignment updated successfully',
            labour
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const updaterEmail = req.user ? req.user.email : 'system-admin';
        const labour = await labourService.updateStatus(id, req.body, updaterEmail);
        res.status(200).json({
            message: 'Labour availability/status updated successfully',
            labour
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getLabours,
    getLabourById,
    createLabour,
    updateLabour,
    deleteLabour,
    assignProject,
    updateStatus
};
