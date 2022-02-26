const httpStatus = require('http-status');
const  moment  = require('moment');
const { Otp } = require('../models');
// const { findById } = require('../models/token.model');
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
  const otp = await Otp.findById(otpId)
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
  const otp = await Otp.findOne({ email });

  if (otp && otp.is_expired== true) {
  await updateOtpById(otp.id,{code:code,is_expired: false})
  }

  // if there is an otp and its not expired, prompt that Otp has been sent already
  else if (otp && otp.is_expired== false){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Otp sent already');
  }
  
  // after code has expired, delete from the database
  const createOtp = await Otp.create({
    email,
    code,
  })

  return createOtp;
};

const verifyOTP = async (email, code) => {
  const otp = await Otp.findOne({ email, code });
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
