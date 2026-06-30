const Labour = require('../model/Labour');

const registerLabour = async (labourData, creatorEmail) => {
    // Check for duplicate mobile number among active workers
    const existingLabour = await Labour.findOne({ 
        mobileNumber: labourData.mobileNumber, 
        isDeleted: false 
    });
    
    if (existingLabour) {
        throw new Error('A worker with this mobile number is already registered.');
    }

    const labour = new Labour({
        ...labourData,
        createdBy: creatorEmail
    });

    return await labour.save();
};

const updateLabour = async (id, updateData, updaterEmail) => {
    const labour = await Labour.findOne({ _id: id, isDeleted: false });
    if (!labour) {
        throw new Error('Labour record not found or has been deleted');
    }

    // Check unique mobile number if updated
    if (updateData.mobileNumber && updateData.mobileNumber !== labour.mobileNumber) {
        const duplicate = await Labour.findOne({ 
            mobileNumber: updateData.mobileNumber, 
            isDeleted: false 
        });
        if (duplicate) {
            throw new Error('Another worker is already registered with this mobile number.');
        }
    }

    Object.assign(labour, {
        ...updateData,
        updatedBy: updaterEmail
    });

    return await labour.save();
};

const deleteLabour = async (id) => {
    const labour = await Labour.findOne({ _id: id, isDeleted: false });
    if (!labour) {
        throw new Error('Labour record not found or already deleted');
    }

    // Soft delete
    labour.isDeleted = true;
    return await labour.save();
};

const getLabourById = async (id) => {
    let query = { isDeleted: false };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = id;
    } else {
        query.employeeId = id;
    }

    const labour = await Labour.findOne(query).populate('assignedProject');
    if (!labour) {
        throw new Error('Labour record not found');
    }
    return labour;
};

const getLabourList = async (queryParams) => {
    const {
        search,
        assignedProject,
        tradeCategory,
        status,
        availability,
        skillLevel,
        city,
        state,
        wageMin,
        wageMax,
        experienceMin,
        experienceMax,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10
    } = queryParams;

    const filter = { isDeleted: false };

    // Search query
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
            { fullName: searchRegex },
            { employeeId: searchRegex },
            { mobileNumber: searchRegex },
            { tradeCategory: searchRegex }
        ];
    }

    // Exact matches
    if (assignedProject) {
        if (assignedProject === 'unassigned') {
            filter.assignedProject = null;
        } else {
            filter.assignedProject = assignedProject;
        }
    }
    if (tradeCategory) filter.tradeCategory = tradeCategory;
    if (status) filter.status = status;
    if (availability) filter.availability = availability === 'true';
    if (skillLevel) filter.skillLevel = skillLevel;
    if (city) filter.city = new RegExp(city, 'i');
    if (state) filter.state = new RegExp(state, 'i');

    // Ranges filters
    if (wageMin || wageMax) {
        filter.dailyWage = {};
        if (wageMin) filter.dailyWage.$gte = parseFloat(wageMin);
        if (wageMax) filter.dailyWage.$lte = parseFloat(wageMax);
    }

    if (experienceMin || experienceMax) {
        filter.experience = {};
        if (experienceMin) filter.experience.$gte = parseInt(experienceMin, 10);
        if (experienceMax) filter.experience.$lte = parseInt(experienceMax, 10);
    }

    // Sorting
    const sort = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    if (['fullName', 'joiningDate', 'experience', 'dailyWage', 'tradeCategory', 'status'].includes(sortBy)) {
        if (sortBy === 'fullName') {
            sort.firstName = order;
        } else {
            sort[sortBy] = order;
        }
    } else {
        sort.createdAt = -1;
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Fetch details
    const labours = await Labour.find(filter)
        .populate('assignedProject')
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

    const totalResults = await Labour.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limitNum);

    // Compute aggregated KPI statistics for workforce dashboard
    const allWorkers = await Labour.find({ isDeleted: false });

    let activeCount = 0;
    let assignedCount = 0;
    let unassignedCount = 0;

    allWorkers.forEach(worker => {
        if (worker.status === 'Active') activeCount++;
        if (worker.assignedProject) {
            assignedCount++;
        } else {
            unassignedCount++;
        }
    });

    return {
        labours,
        pagination: {
            page: pageNum,
            limit: limitNum,
            totalPages,
            totalResults
        },
        statistics: {
            totalWorkers: allWorkers.length,
            activeWorkers: activeCount,
            assignedWorkers: assignedCount,
            unassignedWorkers: unassignedCount
        }
    };
};

const assignProject = async (id, assignData, updaterEmail) => {
    const labour = await Labour.findOne({ _id: id, isDeleted: false });
    if (!labour) {
        throw new Error('Labour record not found');
    }

    const { projectId, supervisor, shift, notes } = assignData;

    labour.assignedProject = projectId || null;
    labour.supervisor = supervisor || '';
    labour.shift = shift || 'General';
    labour.availability = projectId ? false : true; // unassigned means available
    
    if (notes) {
        labour.notes = notes;
    }
    labour.updatedBy = updaterEmail;

    return await labour.save();
};

const updateStatus = async (id, statusData, updaterEmail) => {
    const labour = await Labour.findOne({ _id: id, isDeleted: false });
    if (!labour) {
        throw new Error('Labour record not found');
    }

    const { status, availability } = statusData;

    if (status) labour.status = status;
    if (availability !== undefined) labour.availability = availability;
    
    labour.updatedBy = updaterEmail;

    return await labour.save();
};

module.exports = {
    registerLabour,
    updateLabour,
    deleteLabour,
    getLabourById,
    getLabourList,
    assignProject,
    updateStatus
};
