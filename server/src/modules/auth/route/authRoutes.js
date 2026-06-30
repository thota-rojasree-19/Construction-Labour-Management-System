const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

// Registration routes
router.post('/register', authController.register);
router.post('/verify-register-otp', authController.verifyRegisterOTP);
router.post('/resend-otp', authController.resendOTP);

// Forgot & Reset Password routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOTP);
router.post('/reset-password', authController.resetPassword);

// General Login route
router.post('/login', authController.login);

module.exports = router;
