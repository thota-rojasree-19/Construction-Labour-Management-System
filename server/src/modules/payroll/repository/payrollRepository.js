const Payroll = require('../model/Payroll');
const Advance = require('../model/Advance');

// Payroll standard operations
const createPayroll = async (payrollData) => {
    const payroll = new Payroll(payrollData);
    return await payroll.save();
};

const findPayrollById = async (id) => {
    return await Payroll.findOne({ _id: id, isDeleted: false })
        .populate('worker')
        .populate('project');
};

const findPayroll = async (filter = {}, sort = {}, skip = 0, limit = 10) => {
    return await Payroll.find({ ...filter, isDeleted: false })
        .populate('worker')
        .populate('project')
        .sort(sort)
        .skip(skip)
        .limit(limit);
};

const countPayrollDocuments = async (filter = {}) => {
    return await Payroll.countDocuments({ ...filter, isDeleted: false });
};

const updatePayroll = async (id, updateData) => {
    return await Payroll.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true, runValidators: true }
    ).populate('worker').populate('project');
};

const softDeletePayroll = async (id) => {
    return await Payroll.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
    );
};

// Advance operations
const createAdvance = async (advanceData) => {
    const advance = new Advance(advanceData);
    return await advance.save();
};

const findAdvances = async (filter = {}) => {
    return await Advance.find({ ...filter, isDeleted: false })
        .populate('worker')
        .populate('project')
        .sort({ date: -1 });
};

const updateAdvance = async (id, updateData) => {
    return await Advance.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true }
    );
};

module.exports = {
    createPayroll,
    findPayrollById,
    findPayroll,
    countPayrollDocuments,
    updatePayroll,
    softDeletePayroll,
    createAdvance,
    findAdvances,
    updateAdvance
};
