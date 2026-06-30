const authService = require('../service/authService');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { companyName, fullName, email, mobile, password, role } = req.body;
        
        if (!companyName || !fullName || !email || !mobile || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const result = await authService.register({
            companyName,
            fullName,
            email,
            mobile,
            password,
            role
        });

        res.status(200).json({
            message: 'Registration request received. Verification OTP sent to email address.',
            email: result.email
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const verifyRegisterOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP code are required' });
        }

        const result = await authService.verifyRegisterOTP(email, otp);

        res.status(200).json({
            message: 'OTP verified successfully.',
            token: result.token,
            user: result.user
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const resendOTP = async (req, res) => {
    try {
        const { email, purpose } = req.body;

        if (!email || !purpose) {
            return res.status(400).json({ message: 'Email and purpose are required' });
        }

        await authService.resendOTP(email, purpose);

        res.status(200).json({
            message: 'A new 6-digit verification code has been dispatched.'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email address is required' });
        }

        const result = await authService.forgotPassword(email);

        res.status(200).json({
            message: 'Verification link & OTP sent to email address successfully.',
            email: result.email
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP code are required' });
        }

        const result = await authService.verifyResetOTP(email, otp);

        res.status(200).json({
            message: 'OTP verified successfully.',
            resetToken: result.resetToken
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const authHeader = req.headers.authorization;

        if (!password) {
            return res.status(400).json({ message: 'New password is required' });
        }

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization reset token is missing or invalid' });
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'c21zc19zZWNyZXRfa2V5XzIwMjY=');
        } catch (err) {
            return res.status(401).json({ message: 'Reset token is expired or invalid. Please try again.' });
        }

        if (decoded.purpose !== 'reset-password') {
            return res.status(401).json({ message: 'Invalid token purpose' });
        }

        await authService.resetPassword(decoded.email, password);

        res.status(200).json({
            message: 'Password updated successfully!'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const result = await authService.login(email, password);

        res.status(200).json({
            message: 'Welcome back! Login Successful.',
            token: result.token,
            user: result.user
        });
    } catch (error) {
        if (error.isNotVerified) {
            return res.status(403).json({
                message: error.message,
                isNotVerified: true,
                email
            });
        }
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    register,
    verifyRegisterOTP,
    resendOTP,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    login
};
