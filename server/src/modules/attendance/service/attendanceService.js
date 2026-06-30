const attendanceRepository = require('../repository/attendanceRepository');
const Labour = require('../../labour/model/Labour');
const Project = require('../../projects/model/Project');
const Attendance = require('../model/Attendance');

const normalizeDate = (dateVal) => {
    const d = new Date(dateVal);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

const createAttendance = async (data, recordedBy) => {
    const date = normalizeDate(data.date);
    
    // Check if duplicate exists
    const duplicate = await attendanceRepository.findOne({
        worker: data.worker,
        date: date
    });

    if (duplicate) {
        throw new Error('Attendance has already been marked for this worker on this date.');
    }

    return await attendanceRepository.create({
        ...data,
        date,
        recordedBy
    });
};

const updateAttendance = async (id, updateData, recordedBy) => {
    if (updateData.date) {
        updateData.date = normalizeDate(updateData.date);
    }
    
    // If updating worker or date, make sure we don't cause duplicate
    if (updateData.worker || updateData.date) {
        const current = await attendanceRepository.findById(id);
        if (!current) throw new Error('Attendance record not found');
        
        const checkWorker = updateData.worker || current.worker._id;
        const checkDate = updateData.date || current.date;
        
        const duplicate = await attendanceRepository.findOne({
            worker: checkWorker,
            date: checkDate,
            _id: { $ne: id }
        });
        
        if (duplicate) {
            throw new Error('Another attendance record already exists for this worker on this date.');
        }
    }

    return await attendanceRepository.update(id, {
        ...updateData,
        recordedBy // update recordedBy to the last editor
    });
};

const deleteAttendance = async (id) => {
    const record = await attendanceRepository.findById(id);
    if (!record) throw new Error('Attendance record not found');
    return await attendanceRepository.softDelete(id);
};

const getAttendanceById = async (id) => {
    const record = await attendanceRepository.findById(id);
    if (!record) throw new Error('Attendance record not found');
    return record;
};

const getAttendanceList = async (queryParams) => {
    const {
        search,
        project,
        worker,
        startDate,
        endDate,
        date,
        status,
        shift,
        tradeCategory,
        sortBy = 'date',
        sortOrder = 'desc',
        page = 1,
        limit = 10
    } = queryParams;

    const filter = {};

    if (project) {
        filter.project = project;
    }
    if (worker) {
        filter.worker = worker;
    }
    if (status) {
        filter.status = status;
    }
    if (shift) {
        filter.shift = shift;
    }

    // Date filters
    if (date) {
        filter.date = normalizeDate(date);
    } else if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = normalizeDate(startDate);
        if (endDate) filter.date.$lte = normalizeDate(endDate);
    }

    // Trade category filtering (requires joining worker)
    if (tradeCategory || search) {
        const workerFilter = {};
        if (tradeCategory) workerFilter.tradeCategory = tradeCategory;
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            workerFilter.$or = [
                { fullName: searchRegex },
                { employeeId: searchRegex }
            ];
        }
        
        const matchingWorkers = await Labour.find({ ...workerFilter, isDeleted: false }).select('_id');
        const workerIds = matchingWorkers.map(w => w._id);
        filter.worker = { $in: workerIds };
    }

    const sort = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    if (['date', 'createdAt', 'workingHours'].includes(sortBy)) {
        sort[sortBy] = order;
    } else {
        sort.date = -1;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const records = await attendanceRepository.find(filter, sort, skip, limitNum);
    const totalResults = await attendanceRepository.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limitNum);

    // Dynamic stats compilation for query context
    const allMatching = await Attendance.find({ ...filter, isDeleted: false });
    
    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let leave = 0;
    let holiday = 0;
    let siteClosed = 0;

    allMatching.forEach(r => {
        if (r.status === 'Present') present++;
        else if (r.status === 'Absent') absent++;
        else if (r.status === 'Half Day') halfDay++;
        else if (r.status === 'Leave') leave++;
        else if (r.status === 'Holiday') holiday++;
        else if (r.status === 'Site Closed') siteClosed++;
    });

    const totalCount = allMatching.length;
    const attendancePercentage = totalCount > 0
        ? Math.round(((present + halfDay * 0.5) / totalCount) * 100)
        : 100;

    return {
        records,
        pagination: {
            page: pageNum,
            limit: limitNum,
            totalPages,
            totalResults
        },
        statistics: {
            total: totalCount,
            present,
            absent,
            halfDay,
            leave,
            holiday,
            siteClosed,
            attendancePercentage
        }
    };
};

const bulkMarkAttendance = async (records, recordedBy) => {
    if (!Array.isArray(records) || records.length === 0) {
        throw new Error('Records must be a non-empty array');
    }

    // Ensure all records have required fields
    for (const record of records) {
        if (!record.worker || !record.project || !record.date || !record.status) {
            throw new Error('Each record must contain worker, project, date, and status.');
        }
    }

    return await attendanceRepository.bulkUpsert(records, recordedBy);
};

const getAttendanceByProject = async (projectId, queryParams = {}) => {
    const date = queryParams.date ? normalizeDate(queryParams.date) : normalizeDate(new Date());
    
    // Find all workers assigned to this project
    const workers = await Labour.find({ assignedProject: projectId, isDeleted: false, status: 'Active' });
    
    // Find attendance records for this project on this date
    const records = await Attendance.find({
        project: projectId,
        date: date,
        isDeleted: false
    }).populate('worker');

    // Combine them to show all workers, marking whether attendance was recorded or is pending
    const list = workers.map(worker => {
        const record = records.find(r => r.worker._id.toString() === worker._id.toString());
        return {
            worker,
            attendanceRecord: record || null
        };
    });

    // Stats
    let present = 0;
    let absent = 0;
    let halfDay = 0;
    records.forEach(r => {
        if (r.status === 'Present') present++;
        if (r.status === 'Absent') absent++;
        if (r.status === 'Half Day') halfDay++;
    });

    return {
        date,
        projectId,
        totalWorkers: workers.length,
        markedCount: records.length,
        statistics: {
            present,
            absent,
            halfDay
        },
        list
    };
};

const getAttendanceByWorker = async (workerId) => {
    // Find worker details
    const worker = await Labour.findOne({ _id: workerId, isDeleted: false }).populate('assignedProject');
    if (!worker) throw new Error('Worker not found');

    // Find all attendance records
    const records = await Attendance.find({ worker: workerId, isDeleted: false })
        .populate('project')
        .sort({ date: -1 });

    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let leave = 0;
    let holiday = 0;
    let siteClosed = 0;
    let totalHours = 0;

    records.forEach(r => {
        totalHours += r.workingHours || 0;
        if (r.status === 'Present') present++;
        else if (r.status === 'Absent') absent++;
        else if (r.status === 'Half Day') halfDay++;
        else if (r.status === 'Leave') leave++;
        else if (r.status === 'Holiday') holiday++;
        else if (r.status === 'Site Closed') siteClosed++;
    });

    const totalDays = records.length;
    const attendancePercentage = totalDays > 0
        ? Math.round(((present + halfDay * 0.5) / (totalDays - holiday - siteClosed || 1)) * 100)
        : 100;

    return {
        worker,
        statistics: {
            totalWorkingDays: totalDays,
            presentDays: present,
            absentDays: absent,
            halfDays: halfDay,
            leaveDays: leave,
            holidayDays: holiday,
            siteClosedDays: siteClosed,
            totalHours,
            attendancePercentage: Math.min(100, Math.max(0, attendancePercentage))
        },
        history: records
    };
};

const getAttendanceByDate = async (dateString) => {
    const date = normalizeDate(dateString);
    const records = await Attendance.find({ date, isDeleted: false })
        .populate('worker')
        .populate('project');

    return {
        date,
        count: records.length,
        records
    };
};

module.exports = {
    createAttendance,
    updateAttendance,
    deleteAttendance,
    getAttendanceById,
    getAttendanceList,
    bulkMarkAttendance,
    getAttendanceByProject,
    getAttendanceByWorker,
    getAttendanceByDate
};
