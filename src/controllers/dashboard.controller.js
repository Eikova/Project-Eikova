const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const DashboardService = require('../services/dashboard.service');

const getDashboardData = catchAsync(async (req, res) => {
  const dashboard = await DashboardService.getDashboardData();
  res.status(httpStatus.OK).json({
    status: 'success',
    dashboard,
  });
});

module.exports = {
  getDashboardData,
};
