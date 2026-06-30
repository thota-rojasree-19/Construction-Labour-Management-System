const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectCode: {
        type: String,
        unique: true
    },
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    projectType: {
        type: String,
        required: true,
        enum: ['Residential', 'Commercial', 'Infrastructure', 'Industrial', 'Roadwork', 'Other'],
        default: 'Residential'
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    clientEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    clientContact: {
        type: String,
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
    country: {
        type: String,
        trim: true,
        default: 'India'
    },
    pincode: {
        type: String,
        trim: true
    },
    budget: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    projectManager: {
        type: String,
        required: true,
        trim: true
    },
    siteEngineer: {
        type: String,
        trim: true
    },
    supervisor: {
        type: String,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    expectedEndDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'],
        default: 'Planning'
    },
    progress: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0
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

// Auto-generate projectCode sequences: PRJ-001, PRJ-002, etc.
projectSchema.pre('save', async function(next) {
    if (this.isNew && !this.projectCode) {
        try {
            // Find the last project sorted by createdAt desc
            const lastProject = await mongoose.model('Project').findOne(
                {}, 
                { projectCode: 1 }, 
                { sort: { createdAt: -1 } }
            );
            
            let sequence = 1;
            if (lastProject && lastProject.projectCode) {
                const parts = lastProject.projectCode.split('-');
                if (parts.length === 2) {
                    const num = parseInt(parts[1], 10);
                    if (!isNaN(num)) {
                        sequence = num + 1;
                    }
                }
            }
            this.projectCode = `PRJ-${String(sequence).padStart(3, '0')}`;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

module.exports = mongoose.model('Project', projectSchema);
