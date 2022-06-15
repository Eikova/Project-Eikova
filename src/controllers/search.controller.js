const httpStatus = require('http-status');

const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { PhotoService } = require('../services');


const searchPhotos = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (req.query.sortBy === 'oldest') {
    options.sortBy = 'asc';
  } else {
    options.sortBy = 'desc';
  }
  const photos = await PhotoService.searchPhotos(req.query.query, options);
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Photos fetched successfully',
    photos,
  });
});

module.exports = {
  searchPhotos,
};
