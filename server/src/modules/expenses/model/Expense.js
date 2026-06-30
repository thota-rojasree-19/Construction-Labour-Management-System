const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    expenseCode: {
        type: String,
        unique: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Labour', 'Transport', 'Food', 'Machinery', 'Fuel', 'Materials', 
            'Equipment Rental', 'Safety Equipment', 'Accommodation', 'Utilities', 
            'Maintenance', 'Miscellaneous'
        ],
        default: 'Miscellaneous'
    },
    expenseTitle: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    vendor: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Cash', 'Bank Transfer', 'Card', 'UPI', 'Cheque'],
        default: 'Cash'
    },
    expenseDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    invoiceNumber: {
        type: String,
        trim: true,
        default: ''
    },
    receiptUrl: {
        type: String,
        default: ''
    },
    receiptType: {
        type: String,
        default: ''
    },
    remarks: {
        type: String,
        trim: true,
        default: ''
    },
    createdBy: {
        type: String,
        required: true
    },
    updatedBy: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Auto-increment expenseCode EXP-001, EXP-002, etc.
expenseSchema.pre('save', async function(next) {
    if (this.isNew && !this.expenseCode) {
        try {
            const lastExpense = await mongoose.model('Expense').findOne(
                {},
                { expenseCode: 1 },
                { sort: { createdAt: -1 } }
            );

            let sequence = 1;
            if (lastExpense && lastExpense.expenseCode) {
                const parts = lastExpense.expenseCode.split('-');
                if (parts.length === 2) {
                    const num = parseInt(parts[1], 10);
                    if (!isNaN(num)) {
                        sequence = num + 1;
                    }
                }
            }
            this.expenseCode = `EXP-${String(sequence).padStart(3, '0')}`;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

module.exports = mongoose.model('Expense', expenseSchema);
