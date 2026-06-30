const mongoose = require('mongoose');

const labourSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    fullName: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other'],
        default: 'Male'
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    age: {
        type: Number
    },
    photo: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    mobileNumber: {
        type: String,
        required: true,
        trim: true
    },
    emergencyContact: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    pincode: {
        type: String,
        trim: true
    },
    tradeCategory: {
        type: String,
        required: true,
        enum: [
            'Mason', 'Carpenter', 'Electrician', 'Plumber', 'Painter', 
            'Steel Fixer', 'Welder', 'Helper', 'Machine Operator', 
            'Civil Engineer', 'Site Supervisor', 'Surveyor', 
            'Crane Operator', 'Concrete Worker', 'Other'
        ],
        default: 'Helper'
    },
    skillLevel: {
        type: String,
        required: true,
        enum: ['Unskilled', 'Semi-skilled', 'Skilled', 'Highly-skilled'],
        default: 'Unskilled'
    },
    experience: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    dailyWage: {
        type: Number,
        required: true,
        min: 0
    },
    employmentType: {
        type: String,
        required: true,
        enum: ['Permanent', 'Contract', 'Casual', 'Temporary'],
        default: 'Contract'
    },
    joiningDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    availability: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Inactive', 'Suspended', 'Left'],
        default: 'Active'
    },
    assignedProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    },
    supervisor: {
        type: String,
        trim: true
    },
    shift: {
        type: String,
        enum: ['Day', 'Night', 'General'],
        default: 'General'
    },
    notes: {
        type: String,
        trim: true
    },
    createdBy: {
        type: String
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

// Compound index to prevent duplicate mobileNumber among active records
labourSchema.index({ mobileNumber: 1, isDeleted: 1 }, { unique: true });

// Pre-save trigger hook to generate fullName, compute age and issue auto-increment employeeId
labourSchema.pre('save', async function(next) {
    this.fullName = `${this.firstName} ${this.lastName || ''}`.trim();
    
    if (this.dateOfBirth) {
        const dob = new Date(this.dateOfBirth);
        const ageDiff = Date.now() - dob.getTime();
        const ageDate = new Date(ageDiff);
        this.age = Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    if (this.isNew && !this.employeeId) {
        try {
            const lastLabour = await mongoose.model('Labour').findOne(
                {}, 
                { employeeId: 1 }, 
                { sort: { createdAt: -1 } }
            );

            let sequence = 1;
            if (lastLabour && lastLabour.employeeId) {
                const parts = lastLabour.employeeId.split('-');
                if (parts.length === 2) {
                    const num = parseInt(parts[1], 10);
                    if (!isNaN(num)) {
                        sequence = num + 1;
                    }
                }
            }
            this.employeeId = `EMP-${String(sequence).padStart(3, '0')}`;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

module.exports = mongoose.model('Labour', labourSchema);
