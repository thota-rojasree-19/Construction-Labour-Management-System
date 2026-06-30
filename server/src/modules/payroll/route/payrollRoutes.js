const express = require('express');
const router = express.Router();
const payrollController = require('../controller/payrollController');
const { protect } = require('../../../middlewares/authMiddleware');
const { 
    validateCreatePayroll, 
    validateRecordAdvance 
} = require('../validator/payrollValidator');

// Read endpoints
router.get('/', payrollController.getPayrolls);
router.get('/preview', payrollController.previewCalculation);
router.get('/advance', payrollController.getAdvances);
router.get('/project/:projectId', payrollController.getPayrollsByProject);
router.get('/labour/:labourId', payrollController.getPayrollsByLabour);
router.get('/:id', payrollController.getPayrollById);

// Write endpoints (protected)
router.post('/', protect, validateCreatePayroll, payrollController.createPayroll);
router.put('/:id', protect, payrollController.updatePayroll);
router.delete('/:id', protect, payrollController.deletePayroll);
router.post('/generate', protect, validateCreatePayroll, payrollController.generatePayroll);
router.patch('/:id/mark-paid', protect, payrollController.markPaid);
router.post('/advance', protect, validateRecordAdvance, payrollController.recordAdvance);

module.exports = router;
