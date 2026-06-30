const express = require('express');
const router = express.Router();
const labourController = require('../controller/labourController');
const { protect } = require('../../../middlewares/authMiddleware');

// Public read access
router.get('/', labourController.getLabours);
router.get('/:id', labourController.getLabourById);

// Protected mutation endpoints
router.post('/', protect, labourController.createLabour);
router.put('/:id', protect, labourController.updateLabour);
router.delete('/:id', protect, labourController.deleteLabour);
router.patch('/:id/assign-project', protect, labourController.assignProject);
router.patch('/:id/status', protect, labourController.updateStatus);

module.exports = router;
