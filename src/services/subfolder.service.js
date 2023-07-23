const httpStatus = require('http-status');
const { SubFolder, Folder } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const getSubFolders = async (filter, options) => {
  const subFolder = await SubFolder.paginate(filter, options);
  return subFolder;
};

const createSubFolder = async (req) => {
  const existingSubFolder = await SubFolder.findOne({ name: req.body.name });
  if (existingSubFolder) {
    throw new ApiError(httpStatus.CONFLICT, 'SubFolder already exists');
  }

  const body = { author: req.user.id, ...req.body };
  const subFolder = await SubFolder.create(body);
  //send folder id to folder
  await Folder.findByIdAndUpdate(req.body.folder_id, { subFolder: subFolder.id });
  logger.info(`subfolder (${req.body.name}) created successfully`);
  return subFolder;
};

const searchSubFolder = async (folder) => {
  const subFolders = await SubFolder.find({ name: { $regex: folder, $options: 'i' } }).limit(10);
  if (!subFolders) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Sub Folder found');
  }
  return subFolders;
};

const getSubFolder = async (subFolderId) => {
  const subFolder = await SubFolder.findById(subFolderId);
  if (!subFolder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sub Folder not found');
  }
  return subFolder;
};

const updateSubFolder = async (subFolderId, subFolderBody) => {
  const response = await SubFolder.findByIdAndUpdate(subFolderId, subFolderBody, { new: true });
  if (!response) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sub Folder not found');
  }
  return response;
};

const deleteSubFolder = async (subFolderId) => {
  const subFolder = await SubFolder.findByIdAndDelete(subFolderId);
  if (!subFolder) {
    throw new ApiError(httpStatus.NOT_FOUND, ' SubFolder not found');
  }
  return subFolder;
};

module.exports = {
  getSubFolders,
  createSubFolder,
  searchSubFolder,
  getSubFolder,
  updateSubFolder,
  deleteSubFolder,
};
