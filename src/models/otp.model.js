const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const otpSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 6,
    },
    is_expired: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
otpSchema.plugin(toJSON);
otpSchema.plugin(paginate);


/**
 * @typedef OTP
 */
const Otp = mongoose.model('OTP', otpSchema);

module.exports = Otp;
