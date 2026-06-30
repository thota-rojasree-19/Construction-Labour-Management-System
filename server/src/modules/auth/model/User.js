const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Company Admin', 'Project Manager', 'Supervisor', 'Administrator', 'HR', 'Accountant', 'Viewer', 'Site Engineer'],
        default: 'Company Admin'
    },
    photo: {
        type: String,
        default: ''
    },
    department: {
        type: String,
        default: 'Administration'
    },
    designation: {
        type: String,
        default: 'Manager'
    },
    address: {
        type: String,
        default: ''
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        default: null
    },
    notificationPreferences: {
        emailNotifications: { type: Boolean, default: true },
        attendanceAlerts: { type: Boolean, default: true },
        payrollAlerts: { type: Boolean, default: true },
        expenseAlerts: { type: Boolean, default: true },
        projectUpdates: { type: Boolean, default: true },
        siteReportNotifications: { type: Boolean, default: true },
        frequency: { type: String, enum: ['Instant', 'Daily Digest', 'Weekly Digest', 'Never'], default: 'Instant' }
    },
    lastLogin: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);

