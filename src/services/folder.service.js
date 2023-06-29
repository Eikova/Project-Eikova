const httpStatus = require('http-status');
const { Folder } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const getFolders = async (filter, options) => {
  options.populate = 'subFolder';

  const folder = await Folder.paginate(filter, options);
  return folder;
};

const createFolder = async (req) => {
  const existingfolder = await Folder.findOne({ name: req.body.name });
  if (existingfolder) {
    throw new ApiError(httpStatus.CONFLICT, 'Folder already exists');
  }
  const body = { author: req.user.id, ...req.body };
  const folder = await Folder.create(body);
  logger.info(`folder (${req.body.name}) created successfully`);
  return folder;
};

const searchFolder = async (folder) => {
  const folders = await Folder.find({ name: { $regex: folder, $options: 'i' } }).limit(10);
  if (!folder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Folder found');
  }
  return folders;
};

const getFolder = async (folderId) => {
  const folder = await Folder.findById(folderId).populate('subFolder');
  if (!folder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Folder not found');
  }
  return folder;
};

const updateFolder = async (folderId, folderBody) => {
  const response = await Folder.findByIdAndUpdate(folderId, folderBody, { new: true });
  if (!response) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Folder not found');
  }
  return response;
};

const deleteFolder = async (folderId) => {
  const folder = await Folder.findByIdAndDelete(folderId);
  if (!folder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Folder not found');
  }
  return folder;
};

module.exports = {
  getFolders,
  createFolder,
  searchFolder,
  getFolder,
  updateFolder,
  deleteFolder,
};
