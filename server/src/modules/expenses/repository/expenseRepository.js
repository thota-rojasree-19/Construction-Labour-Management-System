const Expense = require('../model/Expense');

const create = async (expenseData) => {
    const expense = new Expense(expenseData);
    return await expense.save();
};

const findById = async (id) => {
    return await Expense.findOne({ _id: id, isDeleted: false })
        .populate('project');
};

const find = async (filter = {}, sort = {}, skip = 0, limit = 10) => {
    return await Expense.find({ ...filter, isDeleted: false })
        .populate('project')
        .sort(sort)
        .skip(skip)
        .limit(limit);
};

const countDocuments = async (filter = {}) => {
    return await Expense.countDocuments({ ...filter, isDeleted: false });
};

const update = async (id, updateData) => {
    return await Expense.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true, runValidators: true }
    ).populate('project');
};

const softDelete = async (id) => {
    return await Expense.findOneAndUpdate(
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
