const siteReportRepository = require('../repository/siteReportRepository');
const SiteReport = require('../model/SiteReport');
const Project = require('../../projects/model/Project');

const createReport = async (reportData, userEmail) => {
    const report = await siteReportRepository.create({
        ...reportData,
        createdBy: userEmail
    });

    // Automatically update the Project progress if report is submitted
    if (reportData.status === 'Submitted' && reportData.progressPercentage !== undefined) {
        await Project.findOneAndUpdate(
            { _id: reportData.project, isDeleted: false },
            { progress: reportData.progressPercentage }
        );
    }

    return report;
};

const updateReport = async (id, updateData, userEmail) => {
    const report = await SiteReport.findOne({ _id: id, isDeleted: false });
    if (!report) throw new Error('Site report not found');

    const updated = await siteReportRepository.update(id, {
        ...updateData,
        updatedBy: userEmail
    });

    if (updateData.status === 'Submitted' && updateData.progressPercentage !== undefined) {
        await Project.findOneAndUpdate(
            { _id: updated.project, isDeleted: false },
            { progress: updateData.progressPercentage }
        );
    }

    return updated;
};

const deleteReport = async (id) => {
    const report = await SiteReport.findOne({ _id: id, isDeleted: false });
    if (!report) throw new Error('Site report not found');
    return await siteReportRepository.softDelete(id);
};

const getReportById = async (id) => {
    const report = await siteReportRepository.findById(id);
    if (!report) throw new Error('Site report not found');
    return report;
};

const getReportsList = async (queryParams) => {
    const {
        search,
        project,
        engineer,
        status,
        weather,
        progressMin,
        progressMax,
        startDate,
        endDate,
        sortBy = 'reportDate',
        sortOrder = 'desc',
        page = 1,
        limit = 10
    } = queryParams;

    const filter = {};

    if (project) filter.project = project;
    if (engineer) filter.engineer = engineer;
    if (status) filter.status = status;
    if (weather) filter.weather = weather;

    // Progress Range
    if (progressMin || progressMax) {
        filter.progressPercentage = {};
        if (progressMin) filter.progressPercentage.$gte = parseInt(progressMin, 10);
        if (progressMax) filter.progressPercentage.$lte = parseInt(progressMax, 10);
    }

    // Date Range
    if (startDate || endDate) {
        filter.reportDate = {};
        if (startDate) filter.reportDate.$gte = new Date(startDate);
        if (endDate) filter.reportDate.$lte = new Date(endDate);
    }

    // Search query matching
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
            { workCompleted: searchRegex },
            { ongoingWork: searchRegex },
            { remarks: searchRegex }
        ];
    }

    const sort = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    if (['reportDate', 'labourCount', 'progressPercentage', 'createdAt'].includes(sortBy)) {
        sort[sortBy] = order;
    } else {
        sort.reportDate = -1;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const reports = await siteReportRepository.find(filter, sort, skip, limitNum);
    const totalResults = await siteReportRepository.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limitNum);

    // Compute Executive Dashboard Statistics
    const allReports = await SiteReport.find({ isDeleted: false }).populate('project');

    let submittedToday = 0;
    let submittedThisWeek = 0;
    let totalLabour = 0;
    let openIssues = 0;
    let delayedActivities = 0;
    let progressSum = 0;
    let progressCount = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    
    // Get start of current week
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0,0,0,0);

    const projectIds = new Set();

    allReports.forEach(rep => {
        if (rep.project) projectIds.add(rep.project._id.toString());
        
        const repDate = new Date(rep.reportDate);
        const repDateStr = repDate.toISOString().split('T')[0];
        
        if (rep.status === 'Submitted') {
            if (repDateStr === todayStr) {
                submittedToday++;
            }
            if (repDate >= startOfWeek) {
                submittedThisWeek++;
            }
            totalLabour += rep.labourCount || 0;
            if (rep.issues && rep.issues.trim() !== '') openIssues++;
            if (rep.delays && rep.delays.trim() !== '') delayedActivities++;
            
            progressSum += rep.progressPercentage || 0;
            progressCount++;
        }
    });

    const averageProjectProgress = progressCount > 0
        ? Math.round(progressSum / progressCount)
        : 0;

    return {
        reports,
        pagination: {
            page: pageNum,
            limit: limitNum,
            totalPages,
            totalResults
        },
        statistics: {
            submittedToday,
            submittedThisWeek,
            activeProjects: projectIds.size,
            totalLabourReported: totalLabour,
            openIssues,
            delayedActivities,
            averageProjectProgress
        }
    };
};

const getReportsByProject = async (projectId) => {
    // Return sorted report timelines chronologically
    return await SiteReport.find({ project: projectId, isDeleted: false })
        .populate('engineer', 'fullName')
        .sort({ reportDate: 1 });
};

module.exports = {
    createReport,
    updateReport,
    deleteReport,
    getReportById,
    getReportsList,
    getReportsByProject
};
