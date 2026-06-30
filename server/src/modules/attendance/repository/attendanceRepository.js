const Attendance = require('../model/Attendance');

const create = async (attendanceData) => {
    const attendance = new Attendance(attendanceData);
    return await attendance.save();
};

const findById = async (id) => {
    return await Attendance.findOne({ _id: id, isDeleted: false })
        .populate('worker')
        .populate('project');
};

const findOne = async (query) => {
    return await Attendance.findOne({ ...query, isDeleted: false })
        .populate('worker')
        .populate('project');
};

const find = async (filter = {}, sort = {}, skip = 0, limit = 10) => {
    return await Attendance.find({ ...filter, isDeleted: false })
        .populate('worker')
        .populate('project')
        .sort(sort)
        .skip(skip)
        .limit(limit);
};

const countDocuments = async (filter = {}) => {
    return await Attendance.countDocuments({ ...filter, isDeleted: false });
};

const update = async (id, updateData) => {
    return await Attendance.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true, runValidators: true }
    ).populate('worker').populate('project');
};

const softDelete = async (id) => {
    return await Attendance.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
    );
};

// Bulk Upsert: Update if exists (by worker and date), otherwise insert
const bulkUpsert = async (records, recordedBy) => {
    const operations = records.map(record => {
        // Normalize date to midnight (UTC or local) to ensure uniqueness check works
        const recordDate = new Date(record.date);
        recordDate.setUTCHours(0, 0, 0, 0);

        return {
            updateOne: {
                filter: {
                    worker: record.worker,
                    date: recordDate,
                    isDeleted: false
                },
                update: {
                    $set: {
                        project: record.project,
                        status: record.status,
                        checkInTime: record.checkInTime || '',
                        checkOutTime: record.checkOutTime || '',
                        shift: record.shift || 'General',
                        remarks: record.remarks || '',
                        recordedBy: recordedBy
                    }
                },
                upsert: true
            }
        };
    });

    return await Attendance.bulkWrite(operations);
};

module.exports = {
    create,
    findById,
    findOne,
    find,
    countDocuments,
    update,
    softDelete,
    bulkUpsert
};
