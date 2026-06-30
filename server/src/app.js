const express = require('express');
const cors = require('cors');
const authRoutes = require('./modules/auth/route/authRoutes');
const projectRoutes = require('./modules/projects/route/projectRoutes');
const labourRoutes = require('./modules/labour/route/labourRoutes');
const attendanceRoutes = require('./modules/attendance/route/attendanceRoutes');
const payrollRoutes = require('./modules/payroll/route/payrollRoutes');
const expenseRoutes = require('./modules/expenses/route/expenseRoutes');
const siteReportRoutes = require('./modules/reports/route/siteReportRoutes');
const analyticsRoutes = require('./modules/analytics/route/analyticsRoutes');
const reportExportRoutes = require('./modules/reports/route/reportExportRoutes');
const companyRoutes = require('./modules/company/route/companyRoutes');
const userRoutes = require('./modules/users/route/userRoutes');
const profileRoutes = require('./modules/profile/route/profileRoutes');
const dashboardRoutes = require('./modules/dashboard/route/dashboardRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/labours', labourRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/site-reports', siteReportRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/reports', reportExportRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);



app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'CLMS Backend running smoothly' });
});

module.exports = app;
