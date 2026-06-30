const mongoose = require('mongoose');

const siteReportSchema = new mongoose.Schema({
    reportCode: {
        type: String,
        unique: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    engineer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reportDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    weather: {
        type: String,
        default: 'Clear'
    },
    shift: {
        type: String,
        enum: ['Day', 'Night', 'General'],
        default: 'General'
    },
    workCompleted: {
        type: String,
        required: true,
        trim: true
    },
    ongoingWork: {
        type: String,
        trim: true,
        default: ''
    },
    plannedWork: {
        type: String,
        trim: true,
        default: ''
    },
    progressPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    labourCount: {
        type: Number,
        default: 0,
        min: 0
    },
    skilledLabourCount: {
        type: Number,
        default: 0,
        min: 0
    },
    unskilledLabourCount: {
        type: Number,
        default: 0,
        min: 0
    },
    issues: {
        type: String,
        trim: true,
        default: ''
    },
    delays: {
        type: String,
        trim: true,
        default: ''
    },
    safetyIncidents: {
        type: String,
        trim: true,
        default: ''
    },
    materialShortages: {
        type: String,
        trim: true,
        default: ''
    },
    equipmentProblems: {
        type: String,
        trim: true,
        default: ''
    },
    beforeWorkPhotos: {
        type: [String],
        default: []
    },
    duringWorkPhotos: {
        type: [String],
        default: []
    },
    afterWorkPhotos: {
        type: [String],
        default: []
    },
    remarks: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        required: true,
        enum: ['Draft', 'Submitted'],
        default: 'Draft'
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

// Auto-increment reportCode REP-001, REP-002, etc.
siteReportSchema.pre('save', async function(next) {
    if (this.isNew && !this.reportCode) {
        try {
            const lastReport = await mongoose.model('SiteReport').findOne(
                {},
                { reportCode: 1 },
                { sort: { createdAt: -1 } }
            );

            let sequence = 1;
            if (lastReport && lastReport.reportCode) {
                const parts = lastReport.reportCode.split('-');
                if (parts.length === 2) {
                    const num = parseInt(parts[1], 10);
                    if (!isNaN(num)) {
                        sequence = num + 1;
                    }
                }
            }
            this.reportCode = `REP-${String(sequence).padStart(3, '0')}`;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

module.exports = mongoose.model('SiteReport', siteReportSchema);
