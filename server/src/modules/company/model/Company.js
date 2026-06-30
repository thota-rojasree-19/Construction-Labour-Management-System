const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    logo: {
        type: String,
        default: ''
    },
    registrationNumber: {
        type: String,
        trim: true,
        default: ''
    },
    gstNumber: {
        type: String,
        trim: true,
        default: ''
    },
    taxId: {
        type: String,
        trim: true,
        default: ''
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    website: {
        type: String,
        trim: true,
        default: ''
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    timezone: {
        type: String,
        default: 'UTC+05:30'
    },
    currency: {
        type: String,
        default: 'INR'
    },
    workingDays: {
        type: Number,
        default: 6
    },
    workingHours: {
        type: Number,
        default: 8
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Company', companySchema);
