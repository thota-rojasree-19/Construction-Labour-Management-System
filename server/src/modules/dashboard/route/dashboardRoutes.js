const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');
const { protect } = require('../../../middlewares/authMiddleware');

router.use(protect);

router.get('/summary', (req, res) => dashboardController.getDashboardSummary(req, res));

module.exports = router;
