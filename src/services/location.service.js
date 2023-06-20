const httpStatus = require('http-status');
const { Location } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

/**
 * Query for Locatiom
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */

const getLocations = async (filter, options) => {
  const location = await Location.paginate(filter, options);
  return location;
};

const addLocation = async (name, address, user) => {
  const checkLocation = await Location.findOne({ name });
  if (checkLocation) {
    throw new ApiError(httpStatus.CONFLICT, 'Location already exists');
  }
  const data = { name, address, author: user };
  const location = await Location.create(data);
  logger.info(`location (${name}) created successfully`);
  return location;
};

const searchLocation = async (location) => {
  const locations = await Location.find({ name: { $regex: location, $options: 'i' } }).limit(10);
  if (!locations) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Location found');
  }
  return locations;
};

const getLocation = async (locationId) => {
  const location = await Location.findById(locationId);
  if (!location) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Location not found');
  }
  return location;
};

const updateLocation = async (locationId, locationBody) => {
  const response = await Location.findByIdAndUpdate(locationId, locationBody, { new: true });
  if (!response) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Location not found');
  }
  return response;
};

const deleteLocation = async (locationId) => {
  const location = await Location.findByIdAndDelete(locationId);
  if (!location) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Person not found');
  }
  return location;
};

module.exports = {
  getLocations,
  addLocation,
  searchLocation,
  getLocation,
  updateLocation,
  deleteLocation,
};
