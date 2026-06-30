const express = require('express');
const router = express.Router();
const profileController = require('../controller/profileController');
const { protect } = require('../../../middlewares/authMiddleware');

router.use(protect);

router.get('/', (req, res) => profileController.getProfile(req, res));
router.put('/', (req, res) => profileController.updateProfile(req, res));
router.put('/change-password', (req, res) => profileController.changePassword(req, res));
router.put('/notifications', (req, res) => profileController.updateNotifications(req, res));
router.get('/subscription', (req, res) => profileController.getSubscription(req, res));

module.exports = router;
