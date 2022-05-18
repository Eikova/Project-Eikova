const httpStatus = require('http-status');
const { OTP } = require('../models');
const Otp = require('../models/otp.model');
const ApiError = require('../utils/ApiError');

const generateCode = () => {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
};

const updateOtpById = async (otpId, updateBody) => {
  const otp = await OTP.findById(otpId);
  if (!otp) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Otp not found');
  }
  // if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  // }
  Object.assign(otp, updateBody);
  await otp.save();
  return otp;
};

const generateOTP = async (email) => {
  const code = generateCode();
  const otp = await OTP.findOne({ email });

  if (!otp) {
    const createOtp = await OTP.create({
      email,
      code,
    });
    return createOtp.code;
  }

  if (otp && otp.is_expired === true) {
    const update = await updateOtpById(otp.id, { is_expired: false, code });
    return code;
    // throw new ApiError(httpStatus.BAD_REQUEST, 'Otp expired');
  }

  if (otp && otp.is_expired === false) {
    // throw new ApiError(httpStatus.BAD_REQUEST, 'Otp sent already');
    // otp.is_expired === true;
    const update = await updateOtpById(otp.id, { code });
    return code;
  }

  // after code has expired, delete from the database
};

const verifyOTP = async (email, code) => {
  const otp = await OTP.findOne({ email, code });
  if (!otp) {
    return false;
  }
  if (otp.is_expired) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Otp Used');
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
