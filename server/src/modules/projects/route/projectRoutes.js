const express = require('express');
const router = express.Router();
const projectController = require('../controller/projectController');
const { protect } = require('../../../middlewares/authMiddleware');

// Public listing and detail access (or protect them if needed, protecting modifications is standard)
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);

// Protected mutation endpoints
router.post('/', protect, projectController.createProject);
router.put('/:id', protect, projectController.updateProject);
router.delete('/:id', protect, projectController.deleteProject);

module.exports = router;
