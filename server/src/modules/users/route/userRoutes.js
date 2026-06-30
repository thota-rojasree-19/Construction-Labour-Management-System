const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { protect } = require('../../../middlewares/authMiddleware');

router.use(protect);

router.get('/', (req, res) => userController.getUsers(req, res));
router.post('/', (req, res) => userController.createUser(req, res));
router.put('/:id', (req, res) => userController.updateUser(req, res));
router.delete('/:id', (req, res) => userController.deleteUser(req, res));
router.patch('/:id/status', (req, res) => userController.patchUserStatus(req, res));

module.exports = router;
