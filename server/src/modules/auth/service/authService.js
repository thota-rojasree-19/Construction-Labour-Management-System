const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../../../emails/emailService');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (userData) => {
    const { companyName, fullName, email, mobile, password, role } = userData;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
        if (user.isVerified) {
            throw new Error('Email is already registered and verified. Please sign in.');
        }
        // If user exists but is not verified, we let them overwrite and retry registration
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.companyName = companyName;
        user.fullName = fullName;
        user.mobile = mobile;
        user.password = hashedPassword;
        user.role = role || 'Company Admin';
        user.otp = otp;
        user.otpExpires = otpExpires;

        await user.save();
        await sendOTPEmail(email, otp, 'register');
        return { email };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user = new User({
        companyName,
        fullName,
        email,
        mobile,
        password: hashedPassword,
        role: role || 'Company Admin',
        otp,
        otpExpires
    });

    await user.save();
    await sendOTPEmail(email, otp, 'register');

    return { email };
};

const verifyRegisterOTP = async (email, otp) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Registration record not found.');
    }

    if (user.isVerified) {
        throw new Error('User is already verified.');
    }

    if (!user.otp || user.otp !== otp) {
        throw new Error('Incorrect verification code. Please check and try again.');
    }

    if (new Date() > user.otpExpires) {
        throw new Error('Verification code has expired. Please request a new one.');
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Generate login token
    const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'c21zc19zZWNyZXRfa2V5XzIwMjY=',
        { expiresIn: '24h' }
    );

    return {
        token,
        user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            companyName: user.companyName,
            role: user.role
        }
    };
};

const resendOTP = async (email, purpose) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('User account not found.');
    }

    if (purpose === 'register' && user.isVerified) {
        throw new Error('Account already verified.');
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOTPEmail(email, otp, purpose);
    return true;
};

const forgotPassword = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('No account found with this email address.');
    }

    if (!user.isVerified) {
        throw new Error('Account email is not verified. Please register or verify first.');
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOTPEmail(email, otp, 'reset-password');
    return { email };
};

const verifyResetOTP = async (email, otp) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('User not found.');
    }

    if (!user.otp || user.otp !== otp) {
        throw new Error('Incorrect verification code. Please check and try again.');
    }

    if (new Date() > user.otpExpires) {
        throw new Error('Verification code has expired. Please request a new one.');
    }

    // OTP validated successfully, generate short-lived password reset token
    const resetToken = jwt.sign(
        { email: user.email, purpose: 'reset-password' },
        process.env.JWT_SECRET || 'c21zc19zZWNyZXRfa2V5XzIwMjY=',
        { expiresIn: '15m' }
    );

    // Clear OTP from DB immediately to prevent replay
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return { resetToken };
};

const resetPassword = async (email, newPassword) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('User not found.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return true;
};

const login = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password.');
    }

    if (!user.isVerified) {
        // We throw a custom error to tell the frontend verification is pending
        const err = new Error('Email is not verified yet.');
        err.isNotVerified = true;
        throw err;
    }

    const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'c21zc19zZWNyZXRfa2V5XzIwMjY=',
        { expiresIn: '24h' }
    );

    return {
        token,
        user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            companyName: user.companyName,
            role: user.role
        }
    };
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
