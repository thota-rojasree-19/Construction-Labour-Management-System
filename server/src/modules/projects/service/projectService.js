const Project = require('../model/Project');

const createProject = async (projectData, creatorEmail) => {
    const project = new Project({
        ...projectData,
        createdBy: creatorEmail
    });
    return await project.save();
};

const updateProject = async (id, updateData, updaterEmail) => {
    const project = await Project.findOne({ _id: id, isDeleted: false });
    if (!project) {
        throw new Error('Project not found or has been deleted');
    }

    Object.assign(project, {
        ...updateData,
        updatedBy: updaterEmail
    });

    return await project.save();
};

const deleteProject = async (id) => {
    const project = await Project.findOne({ _id: id, isDeleted: false });
    if (!project) {
        throw new Error('Project not found or already deleted');
    }

    project.isDeleted = true;
    return await project.save();
};

const getProjectById = async (id) => {
    // Attempt Mongoose Object ID match, if not search by projectCode
    let query = { isDeleted: false };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = id;
    } else {
        query.projectCode = id;
    }

    const project = await Project.findOne(query);
    if (!project) {
        throw new Error('Project not found');
    }
    return project;
};

const getProjectsList = async (queryParams) => {
    const {
        search,
        status,
        projectManager,
        projectType,
        city,
        budgetMin,
        budgetMax,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10
    } = queryParams;

    // Build DB filter object
    const filter = { isDeleted: false };

    // Search query matching
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
            { projectName: searchRegex },
            { projectCode: searchRegex },
            { clientName: searchRegex },
            { projectManager: searchRegex }
        ];
    }

    // Exact matches
    if (status) filter.status = status;
    if (projectManager) filter.projectManager = projectManager;
    if (projectType) filter.projectType = projectType;
    if (city) filter.city = new RegExp(city, 'i');

    // Budget range filter
    if (budgetMin || budgetMax) {
        filter.budget = {};
        if (budgetMin) filter.budget.$gte = parseFloat(budgetMin);
        if (budgetMax) filter.budget.$lte = parseFloat(budgetMax);
    }

    // Timeline range filter
    if (startDate) {
        filter.startDate = { $gte: new Date(startDate) };
    }
    if (endDate) {
        filter.expectedEndDate = { $lte: new Date(endDate) };
    }

    // Sort options mapping
    const sort = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    if (['projectName', 'budget', 'status', 'startDate', 'progress', 'createdAt'].includes(sortBy)) {
        sort[sortBy] = order;
    } else {
        sort.createdAt = -1;
    }

    // Pagination calculations
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Fetch projects
    const projects = await Project.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

    const totalResults = await Project.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limitNum);

    // Compute aggregated KPI statistics for dashboard cards
    const allProjects = await Project.find({ isDeleted: false });
    
    let totalBudget = 0;
    let totalProgress = 0;
    let activeCount = 0;
    let completedCount = 0;
    let planningCount = 0;

    allProjects.forEach(proj => {
        totalBudget += proj.budget || 0;
        totalProgress += proj.progress || 0;
        if (proj.status === 'Active') activeCount++;
        else if (proj.status === 'Completed') completedCount++;
        else if (proj.status === 'Planning') planningCount++;
    });

    const averageProgress = allProjects.length > 0 
        ? Math.round(totalProgress / allProjects.length) 
        : 0;

    return {
        projects,
        pagination: {
            page: pageNum,
            limit: limitNum,
            totalPages,
            totalResults
        },
        statistics: {
            totalProjects: allProjects.length,
            activeProjects: activeCount,
            completedProjects: completedCount,
            planningProjects: planningCount,
            totalBudget,
            averageProgress
        }
    };
};

module.exports = {
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    getProjectsList
};
