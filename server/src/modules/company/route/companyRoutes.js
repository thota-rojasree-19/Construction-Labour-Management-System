const express = require('express');
const router = express.Router();
const companyController = require('../controller/companyController');
const { protect } = require('../../../middlewares/authMiddleware');

router.use(protect);

router.get('/', (req, res) => companyController.getCompany(req, res));
router.put('/', (req, res) => companyController.updateCompany(req, res));

module.exports = router;
