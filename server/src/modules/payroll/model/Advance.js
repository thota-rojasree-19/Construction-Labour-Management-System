const mongoose = require('mongoose');

const advanceSchema = new mongoose.Schema({
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Labour',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    reason: {
        type: String,
        trim: true,
        default: ''
    },
    remarks: {
        type: String,
        trim: true,
        default: ''
    },
    isDeducted: {
        type: Boolean,
        default: false
    },
    deductedInPayroll: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payroll',
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Advance', advanceSchema);
