const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { OTPService } = require('../services');

const verifyOTP = catchAsync(async (req, res, next) => {
  const { email, code } = req.body;
  const checkOTP = await OTPService.verifyOTP(email, code);
  if (!checkOTP) {
    return res.status(httpStatus.OK).json({ message: 'Invalid OTP', verified: false });
  }
  return res.status(httpStatus.OK).json({ message: 'OTP verified', verified: true });
});

const sendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const otp = await OTPService.generateOTP(email);
  if (!otp) {
    return next(res.status(httpStatus.OK).json({ message: 'OTP not sent' }));
  }
  return res.status(httpStatus.OK).json({ message: 'OTP sent', data: otp });
});

module.exports = {
  verifyOTP,
  sendOTP,
};
