const httpStatus = require('http-status');
const { Meeting } = require('../models');
const ApiError = require('../utils/ApiError');

const getMeeting = async () => {
  const meeting = await Meeting.find({});
  if (!meeting) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No People found');
  }
  return meeting;
};

const createMeeting = async (meeting, user) => {
  const existingMeeting = await Meeting.findOne({ meeting });
  if (existingMeeting) {
    throw new ApiError(httpStatus.CONFLICT, 'meeting already exists');
  }
  const data = { name: meeting, author: user };
  return await Meeting.create(data);
};

const searchMeeting= async (meeting) => {
  const meetings = await Meeting.find({ name: { $regex: meeting, $options: 'i' } }).limit(10);
  if (!meetings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Meeting found');
  }
  return meetings;
};

const getAMeeting = async (meetingId) => {
  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meeting not found');
  }
  return meeting;
};

const updateMeeting = async (meetingId, meetingBody) => {
  const meeting = { name: meetingBody.name };
  const response = await Meeting.findByIdAndUpdate(meetingId, meeting, { new: true });
  if (!response) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meeting not found');
  }
  return response;
};

const deleteMeeting = async (meetingId) => {
  const meeting = await Meeting.findByIdAndDelete(meetingId);
  if (!meeting) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Meeting not found');
  }
  return meeting;
};

module.exports = {
  getMeeting,
  createMeeting,
  searchMeeting,
  getAMeeting,
  updateMeeting,
  deleteMeeting,
};
