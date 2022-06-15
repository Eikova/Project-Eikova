const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { MeetingService } = require('../services');

const createMeeting = catchAsync(async (req, res) => {
  const meeting = await MeetingService.createMeeting(req.body.name, req.user.id);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    meeting,
  });
});

const getAllMeetings = catchAsync(async (req, res) => {
  const meeting = await MeetingService.getMeeting();
  res.status(httpStatus.OK).json({
    status: 'success',
    meeting,
  });
});

const getAMeeting = catchAsync(async (req, res) => {
  const meeting = await MeetingService.getAMeeting(req.params.id);
  if (!meeting) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'Person not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    meeting,
  });
});

const updateMeeting = catchAsync(async (req, res) => {
  const meeting = await MeetingService.updateMeeting(req.params.id, req.body);
  if (!meeting) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'Person not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    meeting,
  });
});

const deleteMeeting = catchAsync(async (req, res) => {
  const meeting = await MeetingService.deleteMeeting(req.params.id);
  if (!meeting) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'Person not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    meeting,
  });
});

const searchMeeting = catchAsync(async (req, res) => {
  const meeting = await MeetingService.searchMeeting(req.query.name);
  res.status(httpStatus.OK).json({
    status: 'success',
    meeting,
  });
});

module.exports = {
  createMeeting,
  getAllMeetings,
  getAMeeting,
  updateMeeting,
  deleteMeeting,
  searchMeeting,
};
