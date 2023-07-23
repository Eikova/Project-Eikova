const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { PeopleService } = require('../services');
const pick = require('../utils/pick');


const createPeople = catchAsync(async (req, res) => {
  const people = await PeopleService.createPeople(req.body.name, req.body.type, req.user.id);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    people,
  });
});

const getAllPeople = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'type']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const people = await PeopleService.getPeople(filter,options);
  res.status(httpStatus.OK).json({
    status: 'success',
    people,
  });
});

const getPerson = catchAsync(async (req, res) => {
  const people = await PeopleService.getPerson(req.params.id);
  if (!people) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'Person not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    people,
  });
});

const updatePeople = catchAsync(async (req, res) => {
  const people = await PeopleService.updatePeople(req.params.id, req.body);
  if (!people) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'Person not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    people,
  });
});

const deletePeople = catchAsync(async (req, res) => {
  const people = await PeopleService.deletePeople(req.params.id);
  if (!people) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'Person not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    people,
  });
});

const searchPeople = catchAsync(async (req, res) => {
  let people;
  if (req.query.isType) {
    people = await PeopleService.searchPeople(req.query.q, true);
  } else {
    people = await PeopleService.searchPeople(req.query.q);
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    people,
  });
});

module.exports = {
  createPeople,
  getAllPeople,
  getPerson,
  updatePeople,
  deletePeople,
  searchPeople,
};
