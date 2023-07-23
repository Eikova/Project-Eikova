const httpStatus = require('http-status');
const { People } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
// const

const getPeople = async (filter, options) => {
  options.populate = 'author';
  const people = await People.paginate(filter, options);
  return people;
};

const createPeople = async (name, type, user) => {
  const existingPeople = await People.findOne({ name });
  if (existingPeople) {
    throw new ApiError(httpStatus.CONFLICT, 'People already exists');
  }
  const data = { name, type, author: user };
  const newpeople = await People.create(data);
  logger.info(`people (${name}) created successfully`);
  return newpeople;
};

const searchPeople = async (people, isType = false) => {
  let peoples;
  if (isType) {
    peoples = await People.find({ type: { $regex: people, $options: 'i' } }).limit(10);
  } else {
    peoples = await People.find({ name: { $regex: people, $options: 'i' } }).limit(10);
  }
  if (!peoples) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No People found');
  }
  return peoples;
};

const getPerson = async (personId) => {
  const person = await People.findById(personId);
  if (!person) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Person not found');
  }
  return person;
};

const updatePeople = async (peopleId, peopleBody) => {
  const response = await People.findByIdAndUpdate(peopleId, peopleBody, { new: true });
  if (!response) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Person not found');
  }
  return response;
};

const deletePeople = async (peopleId) => {
  const people = await People.findByIdAndDelete(peopleId);
  if (!people) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Person not found');
  }
  return people;
};

module.exports = {
  getPeople,
  createPeople,
  searchPeople,
  getPerson,
  updatePeople,
  deletePeople,
};
