const SiteReport = require('../model/SiteReport');

const create = async (reportData) => {
    const report = new SiteReport(reportData);
    return await report.save();
};

const findById = async (id) => {
    return await SiteReport.findOne({ _id: id, isDeleted: false })
        .populate('project')
        .populate('engineer', 'fullName email')
        .populate('supervisor', 'fullName email');
};

const find = async (filter = {}, sort = {}, skip = 0, limit = 10) => {
    return await SiteReport.find({ ...filter, isDeleted: false })
        .populate('project')
        .populate('engineer', 'fullName email')
        .populate('supervisor', 'fullName email')
        .sort(sort)
        .skip(skip)
        .limit(limit);
};

const countDocuments = async (filter = {}) => {
    return await SiteReport.countDocuments({ ...filter, isDeleted: false });
};

const update = async (id, updateData) => {
    return await SiteReport.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true, runValidators: true }
    ).populate('project')
     .populate('engineer', 'fullName email')
     .populate('supervisor', 'fullName email');
};

const softDelete = async (id) => {
    return await SiteReport.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
    );
};

module.exports = {
    create,
    findById,
    find,
    countDocuments,
    update,
    softDelete
};
