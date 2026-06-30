const projectService = require('../service/projectService');

const getProjects = async (req, res) => {
    try {
        const result = await projectService.getProjectsList(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await projectService.getProjectById(id);
        res.status(200).json(project);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const createProject = async (req, res) => {
    try {
        const creatorEmail = req.user ? req.user.email : 'system-admin';
        const project = await projectService.createProject(req.body, creatorEmail);
        res.status(201).json({
            message: 'Project created successfully',
            project
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const updaterEmail = req.user ? req.user.email : 'system-admin';
        const project = await projectService.updateProject(id, req.body, updaterEmail);
        res.status(200).json({
            message: 'Project updated successfully',
            project
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        await projectService.deleteProject(id);
        res.status(200).json({
            message: 'Project deleted successfully (soft-deleted)'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
};
