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

  if (otp && otp.is_expired === true) {
    await updateOtpById(otp.id, { code, is_expired: false });
  }

  // if there is an otp, and it's not expired, prompt that Otp has been sent already
  else if (otp && otp.is_expired === false) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Otp sent already');
  }

  // after code has expired, delete from the database
  const createOtp = await OTP.create({
    email,
    code,
  });

  return createOtp;
};

const verifyOTP = async (email, code) => {
  const otp = await OTP.findOne({ email, code });
  if (!otp) {
    return false;
  }
  if(otp.is_expired){
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
