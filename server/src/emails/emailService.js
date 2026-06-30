const nodemailer = require('nodemailer');

const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

// Setup Nodemailer transporter with Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'sreeroja004@gmail.com',
        pass: emailPass
    }
});

/**
 * Send an OTP verification code via email.
 * Falls back to logging in the console if EMAIL_PASS is not provided.
 * @param {string} email - Destination email address
 * @param {string} otp - 6-digit One Time Password
 * @param {string} purpose - 'register' or 'reset-password'
 */
const sendOTPEmail = async (email, otp, purpose = 'register') => {
    const isReset = purpose === 'reset-password';
    const actionText = isReset ? 'reset your account password' : 'verify your new registration profile';
    const subject = isReset ? 'Reset Password Verification OTP' : 'Complete Construction Portal Verification';

    const mailOptions = {
        from: `Smart-Connect CLMS <${process.env.EMAIL_USER || 'sreeroja004@gmail.com'}>`,
        to: email,
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <span style="font-size: 24px; font-weight: bold; color: #2b6cb0; font-family: 'Outfit', 'Inter', sans-serif;">■ ConstroConnect</span>
                </div>
                <hr style="border: 0; border-top: 1px solid #edf2f7; margin-bottom: 25px;" />
                <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">Hello,</p>
                <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">
                    You are receiving this email because you requested to ${actionText}. 
                    Please use the 6-digit verification code below to authorize this request:
                </p>
                <div style="text-align: center; margin: 35px 0;">
                    <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #2b6cb0; background-color: #ebf8ff; padding: 12px 24px; border-radius: 8px; border: 1px dashed #bee3f8; display: inline-block; font-family: monospace;">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #718096; line-height: 1.5;">
                    This One-Time Password (OTP) is valid for <strong>10 minutes</strong>. 
                    If you did not initiate this request, you can safely ignore this email.
                </p>
                <hr style="border: 0; border-top: 1px solid #edf2f7; margin-top: 30px; margin-bottom: 20px;" />
                <p style="font-size: 12px; color: #a0aec0; text-align: center; line-height: 1.5;">
                    This is an automated security notification from ConstroConnect.<br />
                    &copy; ${new Date().getFullYear()} Construction Labour Management System. All rights reserved.
                </p>
            </div>
        `
    };

    try {
        if (!emailPass) {
            console.log('\n======================================================');
            console.log(`[DEVELOPMENT FALLBACK] OTP Email Notification`);
            console.log(`Recipient: ${email}`);
            console.log(`Purpose  : ${purpose.toUpperCase()}`);
            console.log(`OTP Code : ${otp}`);
            console.log(`To receive real emails, set EMAIL_PASS in your server/.env file.`);
            console.log('======================================================\n');
            return true;
        }

        await transporter.sendMail(mailOptions);
        console.log(`Verification OTP successfully emailed to ${email}`);
        return true;
    } catch (error) {
        console.error(`Error sending email to ${email}:`, error.message);
        console.log('\n======================================================');
        console.log(`[FALLBACK DUE TO ERROR] OTP Email Notification`);
        console.log(`Recipient: ${email}`);
        console.log(`Purpose  : ${purpose.toUpperCase()}`);
        console.log(`OTP Code : ${otp}`);
        console.log('======================================================\n');
        return false;
    }
};

module.exports = {
    sendOTPEmail
};
