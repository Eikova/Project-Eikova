const httpStatus = require('http-status');

const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { PhotoService, SearchService } = require('../services');
// const photoService = require('../services/photos.service');

const searchPhotos = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'skip', 'page']);
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

const populateIndex = catchAsync(async (req, res) => {
  const photos = await photoService.adminGetPhotos();
  // console.log(photos);
  try {
    const populate = await SearchService.adminPopulateIndex(photos);
    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: 'Index Populated successfully',
    });
  } catch (e) {
    throw new ApiError('Index Population Failed!');
  }
});

module.exports = {
  searchPhotos,
  populateIndex,
};
