const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { LocationService } = require('../services');
const pick = require('../utils/pick');

const addLocation = catchAsync(async (req, res) => {
  const location = await LocationService.addLocation(req.body.name, req.body.address, req.user.id);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    location,
  });
});

const getAllLocation = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'address']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const location = await LocationService.getLocations(filter, options);
  res.status(httpStatus.OK).json({
    status: 'success',
    location,
  });
});

const getLocation = catchAsync(async (req, res) => {
  const location = await LocationService.getLocation(req.params.id);
  if (!location) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'Location not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    location,
  });
});

const updateLocation = catchAsync(async (req, res) => {
  const location = await LocationService.updateLocation(req.params.id, req.body);
  if (!location) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'Location not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    location,
  });
});

const deleteLocation = catchAsync(async (req, res) => {
  const location = await LocationService.deleteLocation(req.params.id);
  if (!location) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'location not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    location,
  });
});

const searchLocation = catchAsync(async (req, res) => {
  const location = await LocationService.searchLocation(req.query.name);
  res.status(httpStatus.OK).json({
    status: 'success',
    location,
  });
});

module.exports = {
  addLocation,
  getAllLocation,
  getLocation,
  updateLocation,
  deleteLocation,
  searchLocation,
};
