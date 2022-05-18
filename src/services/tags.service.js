const httpStatus = require('http-status');
const { Tag } = require('../models');
const ApiError = require('../utils/ApiError');

const getTags = async () => {
  const tags = await Tag.find({});
  if (!tags) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Tags found');
  }
  return tags;
};

const createTag = async (tag, user) => {
  const fmtTag = tag.toLowerCase();
  const existingTag = await Tag.findOne({ tag: fmtTag });
  if (existingTag) {
    throw new ApiError(httpStatus.CONFLICT, 'Tag already exists');
  }
  const data = { tag: fmtTag, author: user };
  return await Tag.create(data);
};

const searchTags = async (tag) => {
  const tags = await Tag.find({ tag: { $regex: tag, $options: 'i' } }).limit(10);
  if (!tags) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Tags found');
  }
  return tags;
};

const getTag = async (tagId) => {
  const tag = await Tag.findById(tagId);
  if (!tag) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tag not found');
  }
  return tag;
};

const updateTag = async (tagId, tagBody) => {
  const tag = { tag: tagBody.tag.toLowerCase() };
  const response = await Tag.findByIdAndUpdate(tagId, tag, { new: true });
  if (!response) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tag not found');
  }
  return response;
};

const deleteTag = async (tagId) => {
  const tag = await Tag.findByIdAndDelete(tagId);
  if (!tag) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tag not found');
  }
  return tag;
};

module.exports = {
  getTags,
  createTag,
  searchTags,
  getTag,
  updateTag,
  deleteTag,
};
