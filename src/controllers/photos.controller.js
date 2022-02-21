const httpStatus = require('http-status');
const sharp = require('sharp');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { PhotoService } = require('../services');

const createPhoto = catchAsync(async (req, res) => {

  const photo = await PhotoService.uploadPhoto(req.body, req.file);
  res.status(httpStatus.CREATED).json({
    status: httpStatus.CREATED,
    data: photo,
  });
});

module.exports = {
  createPhoto,
};
