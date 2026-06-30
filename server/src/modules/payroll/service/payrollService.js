const payrollRepository = require('../repository/payrollRepository');
const Labour = require('../../labour/model/Labour');
const Attendance = require('../../attendance/model/Attendance');
const Advance = require('../model/Advance');
const Payroll = require('../model/Payroll');

// Computes preview payroll calculations for a single worker in a month
const calculateWorkerSalaryForMonth = async (workerId, month) => {
    // 1. Fetch Worker Details
    const worker = await Labour.findOne({ _id: workerId, isDeleted: false }).populate('assignedProject');
    if (!worker) throw new Error('Worker not found');

    const dailyWage = worker.dailyWage || 0;
    const project = worker.assignedProject ? worker.assignedProject._id : null;

    // 2. Fetch Attendance Records for the Month
    const [year, monthStr] = month.split('-');
    const startDate = new Date(Date.UTC(parseInt(year, 10), parseInt(monthStr, 10) - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(parseInt(year, 10), parseInt(monthStr, 10), 0, 23, 59, 59));

    const attendanceRecords = await Attendance.find({
        worker: workerId,
        date: { $gte: startDate, $lte: endDate },
        isDeleted: false
    });

    let attendanceDays = 0;
    attendanceRecords.forEach(r => {
        if (r.status === 'Present') attendanceDays += 1;
        if (r.status === 'Half Day') attendanceDays += 0.5;
    });

    // 3. Fetch Outstanding Advances
    const advances = await Advance.find({
        worker: workerId,
        isDeducted: false,
        isDeleted: false
    });
    
    const totalAdvances = advances.reduce((sum, adv) => sum + adv.amount, 0);

    const grossSalary = attendanceDays * dailyWage;
    const netPayable = Math.max(0, grossSalary - totalAdvances);

    return {
        worker,
        project,
        month,
        attendanceDays,
        dailyWage,
        grossSalary,
        advanceAmount: totalAdvances,
        bonus: 0,
        penalty: 0,
        netPayable,
        advancesToDeduct: advances
    };
};

const generatePayroll = async (payrollData, generatedBy) => {
    const { worker, month } = payrollData;
    
    // Check if payroll already exists for the month
    const existing = await Payroll.findOne({
        worker,
        month,
        isDeleted: false
    });

    if (existing) {
        throw new Error(`Payroll has already been generated for this worker for the month ${month}.`);
    }

    // Double check calculations
    const calc = await calculateWorkerSalaryForMonth(worker, month);
    
    const grossSalary = calc.attendanceDays * calc.dailyWage;
    const bonus = parseFloat(payrollData.bonus) || 0;
    const penalty = parseFloat(payrollData.penalty) || 0;
    
    // final net payable
    const netPayable = Math.max(0, grossSalary - calc.advanceAmount + bonus - penalty);

    const payroll = await payrollRepository.createPayroll({
        worker,
        project: calc.project || payrollData.project,
        month,
        attendanceDays: calc.attendanceDays,
        dailyWage: calc.dailyWage,
        grossSalary,
        advanceAmount: calc.advanceAmount,
        bonus,
        penalty,
        netPayable,
        remarks: payrollData.remarks || '',
        paymentStatus: 'Pending',
        generatedBy
    });

    // Mark outstanding advances as deducted
    if (calc.advancesToDeduct && calc.advancesToDeduct.length > 0) {
        const advanceIds = calc.advancesToDeduct.map(a => a._id);
        await Advance.updateMany(
            { _id: { $in: advanceIds } },
            { 
                $set: { 
                    isDeducted: true,
                    deductedInPayroll: payroll._id 
                } 
            }
        );
    }

    return payroll;
};

const getPayrollList = async (queryParams) => {
    const {
        search,
        project,
        month,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10
    } = queryParams;

    const filter = {};

    if (project) filter.project = project;
    if (month) filter.month = month;
    if (status) filter.paymentStatus = status;

    // Search by worker name/ID/Code (Requires join or search mapping)
    if (search) {
        const workerSearch = { isDeleted: false };
        const searchRegex = new RegExp(search, 'i');
        workerSearch.$or = [
            { fullName: searchRegex },
            { employeeId: searchRegex }
        ];
        
        const matchingWorkers = await Labour.find(workerSearch).select('_id');
        const workerIds = matchingWorkers.map(w => w._id);
        filter.worker = { $in: workerIds };
    }

    const sort = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    if (['grossSalary', 'netPayable', 'attendanceDays', 'createdAt', 'paymentDate'].includes(sortBy)) {
        sort[sortBy] = order;
    } else {
        sort.createdAt = -1;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const payrolls = await payrollRepository.find(filter, sort, skip, limitNum);
    const totalResults = await payrollRepository.countPayrollDocuments(filter);
    const totalPages = Math.ceil(totalResults / limitNum);

    // Executive aggregate metrics for dashboard summaries
    const allPayrolls = await Payroll.find({ isDeleted: false });
    
    let totalPayroll = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let totalAdvances = 0;
    let totalBonuses = 0;
    let totalPenalties = 0;
    let dailyWageSum = 0;

    allPayrolls.forEach(p => {
        totalPayroll += p.netPayable || 0;
        totalAdvances += p.advanceAmount || 0;
        totalBonuses += p.bonus || 0;
        totalPenalties += p.penalty || 0;
        dailyWageSum += p.dailyWage || 0;

        if (p.paymentStatus === 'Paid') {
            totalPaid += p.netPayable || 0;
            paidCount++;
        } else if (p.paymentStatus === 'Pending' || p.paymentStatus === 'Processing' || p.paymentStatus === 'Overdue') {
            totalPending += p.netPayable || 0;
            pendingCount++;
        }
    });

    const averageDailyWage = allPayrolls.length > 0
        ? Math.round(dailyWageSum / allPayrolls.length)
        : 0;

    return {
        payrolls,
        pagination: {
            page: pageNum,
            limit: limitNum,
            totalPages,
            totalResults
        },
        statistics: {
            totalPayrollThisMonth: totalPayroll,
            totalPaidAmount: totalPaid,
            pendingPayments: totalPending,
            workersPaid: paidCount,
            workersPending: pendingCount,
            averageDailyWage,
            totalAdvances,
            totalBonuses,
            totalPenalties
        }
    };
};

const getPayrollById = async (id) => {
    return await payrollRepository.findPayrollById(id);
};

const updatePayroll = async (id, updateData) => {
    const payroll = await Payroll.findOne({ _id: id, isDeleted: false });
    if (!payroll) throw new Error('Payroll not found');

    // recalculate if dailyWage, attendanceDays, advanceAmount, bonus, or penalty changes
    const wage = updateData.dailyWage !== undefined ? updateData.dailyWage : payroll.dailyWage;
    const days = updateData.attendanceDays !== undefined ? updateData.attendanceDays : payroll.attendanceDays;
    const advance = updateData.advanceAmount !== undefined ? updateData.advanceAmount : payroll.advanceAmount;
    const bonus = updateData.bonus !== undefined ? parseFloat(updateData.bonus) : payroll.bonus;
    const penalty = updateData.penalty !== undefined ? parseFloat(updateData.penalty) : payroll.penalty;

    const grossSalary = days * wage;
    const netPayable = Math.max(0, grossSalary - advance + bonus - penalty);

    return await payrollRepository.update(id, {
        ...updateData,
        grossSalary,
        netPayable
    });
};

const deletePayroll = async (id) => {
    const payroll = await Payroll.findOne({ _id: id, isDeleted: false });
    if (!payroll) throw new Error('Payroll not found');

    // Release deducted advances so they can be calculated in future cycles
    await Advance.updateMany(
        { deductedInPayroll: id },
        { 
            $set: { 
                isDeducted: false,
                deductedInPayroll: null 
            } 
        }
    );

    return await payrollRepository.softDeletePayroll(id);
};

const markPayrollPaid = async (id) => {
    return await payrollRepository.update(id, {
        paymentStatus: 'Paid',
        paymentDate: new Date()
    });
};

const getPayrollsByProject = async (projectId) => {
    return await Payroll.find({ project: projectId, isDeleted: false }).populate('worker');
};

const getPayrollsByLabour = async (labourId) => {
    return await Payroll.find({ worker: labourId, isDeleted: false }).populate('project');
};

// Advances
const recordAdvance = async (advanceData) => {
    return await payrollRepository.createAdvance(advanceData);
};

const getAdvancesList = async (queryParams = {}) => {
    const filter = {};
    if (queryParams.worker) filter.worker = queryParams.worker;
    if (queryParams.project) filter.project = queryParams.project;
    return await payrollRepository.findAdvances(filter);
};

module.exports = {
    calculateWorkerSalaryForMonth,
    generatePayroll,
    getPayrollList,
    getPayrollById,
    updatePayroll,
    deletePayroll,
    markPayrollPaid,
    getPayrollsByProject,
    getPayrollsByLabour,
    recordAdvance,
    getAdvancesList
};
