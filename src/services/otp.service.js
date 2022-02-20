const httpStatus = require('http-status');
const { OTP } = require('../models');
const ApiError = require('../utils/ApiError');

const generateCode = () => {
  let code = '';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 6; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
};

const generateOTP = async (email) => {
  const code = generateCode();
  return OTP.create({
    email,
    code,
  });
};

const verifyOTP = async (email, code) => {
  const otp = await OTP.findOne({ email, code });
  if (!otp) {
    return false;
  }
  otp.is_expired = true;
  otp.save();
  return true;
};

module.exports = {
  generateCode,
  generateOTP,
  verifyOTP,
};
