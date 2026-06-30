const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Present', 'Absent', 'Half Day', 'Leave', 'Holiday', 'Site Closed'],
        default: 'Present'
    },
    checkInTime: {
        type: String, // format "HH:MM", e.g. "09:00"
        default: ''
    },
    checkOutTime: {
        type: String, // format "HH:MM", e.g. "17:00"
        default: ''
    },
    workingHours: {
        type: Number,
        default: 0
    },
    shift: {
        type: String,
        enum: ['General', 'Day', 'Night'],
        default: 'General'
    },
    remarks: {
        type: String,
        trim: true,
        default: ''
    },
    recordedBy: {
        type: String, // Store email of user marking attendance
        required: true,
        default: 'system'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound unique index to prevent duplicate attendance markings for the same worker on the same date.
attendanceSchema.index({ worker: 1, date: 1, isDeleted: 1 }, { unique: true });

// Pre-save middleware to calculate workingHours automatically
attendanceSchema.pre('save', function(next) {
    if (this.status === 'Present' || this.status === 'Half Day') {
        if (this.checkInTime && this.checkOutTime) {
            const [inH, inM] = this.checkInTime.split(':').map(Number);
            const [outH, outM] = this.checkOutTime.split(':').map(Number);
            
            if (!isNaN(inH) && !isNaN(inM) && !isNaN(outH) && !isNaN(outM)) {
                let inMin = inH * 60 + inM;
                let outMin = outH * 60 + outM;
                
                if (outMin >= inMin) {
                    this.workingHours = parseFloat(((outMin - inMin) / 60).toFixed(2));
                } else {
                    // Shift wraps around midnight (e.g. night shift)
                    this.workingHours = parseFloat((((24 * 60 - inMin) + outMin) / 60).toFixed(2));
                }
            }
        } else {
            this.workingHours = this.status === 'Half Day' ? 4 : 8;
        }
    } else {
        this.workingHours = 0;
    }
    next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
