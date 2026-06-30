const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    payrollCode: {
        type: String,
        unique: true
    },
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
    month: {
        type: String, // Format: "YYYY-MM"
        required: true
    },
    attendanceDays: {
        type: Number,
        required: true,
        default: 0
    },
    dailyWage: {
        type: Number,
        required: true
    },
    grossSalary: {
        type: Number,
        required: true
    },
    advanceAmount: {
        type: Number,
        default: 0
    },
    bonus: {
        type: Number,
        default: 0
    },
    penalty: {
        type: Number,
        default: 0
    },
    netPayable: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Processing', 'Paid', 'Cancelled', 'Overdue'],
        default: 'Pending'
    },
    paymentDate: {
        type: Date
    },
    remarks: {
        type: String,
        trim: true,
        default: ''
    },
    generatedBy: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Prevent duplicate monthly payroll generations per worker
payrollSchema.index({ worker: 1, month: 1, isDeleted: 1 }, { unique: true });

// Auto-increment payrollCode PAY-001, PAY-002, etc.
payrollSchema.pre('save', async function(next) {
    if (this.isNew && !this.payrollCode) {
        try {
            const lastPayroll = await mongoose.model('Payroll').findOne(
                {},
                { payrollCode: 1 },
                { sort: { createdAt: -1 } }
            );

            let sequence = 1;
            if (lastPayroll && lastPayroll.payrollCode) {
                const parts = lastPayroll.payrollCode.split('-');
                if (parts.length === 2) {
                    const num = parseInt(parts[1], 10);
                    if (!isNaN(num)) {
                        sequence = num + 1;
                    }
                }
            }
            this.payrollCode = `PAY-${String(sequence).padStart(3, '0')}`;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

module.exports = mongoose.model('Payroll', payrollSchema);
