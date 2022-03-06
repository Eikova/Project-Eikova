const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { TagService } = require('../services');

const createTag = catchAsync(async (req, res) => {
  const tag = await TagService.createTag(req.body.tag, req.user.id);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    tag,
  });
});

const getAllTags = catchAsync(async (req, res) => {
  const tags = await TagService.getTags();
  res.status(httpStatus.OK).json({
    status: 'success',
    tags,
  });
});

const getTag = catchAsync(async (req, res) => {
  const tag = await TagService.getTag(req.params.id);
  if (!tag) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'Tag not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    tag,
  });
});

const updateTag = catchAsync(async (req, res) => {
  const tag = await TagService.updateTag(req.params.id, req.body);
  if (!tag) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'Tag not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    tag,
  });
});

const deleteTag = catchAsync(async (req, res) => {
  const tag = await TagService.deleteTag(req.params.id);
  if (!tag) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'Tag not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    tag,
  });
});

const searchTags = catchAsync(async (req, res) => {
  const tags = await TagService.searchTags(req.query.tag);
  res.status(httpStatus.OK).json({
    status: 'success',
    tags,
  });
});

module.exports = {
  createTag,
  getAllTags,
  getTag,
  updateTag,
  deleteTag,
  searchTags,
};
