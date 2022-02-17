const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const OTPSchema = mongoose.Schema(
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
OTPSchema.plugin(toJSON);
OTPSchema.plugin(paginate);
/*
user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
 */

/**
 * @typedef OTP
 */
const OTP = mongoose.model('OTP', OTPSchema);

module.exports = OTP;
