const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { SubFolderService } = require('../services');
const pick = require('../utils/pick');

const createSubFolder = catchAsync(async (req, res) => {
  const subFolder = await SubFolderService.createSubFolder(req);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    subFolder,
  });
});

const getSubFolders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const subFolder = await SubFolderService.getSubFolders(filter, options);
  res.status(httpStatus.OK).json({
    status: 'success',
    subFolder,
  });
});

const getSubFolder = catchAsync(async (req, res) => {
  const subFolder = await SubFolderService.getSubFolder(req.params.id);
  if (!subFolder) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'Sub Folder not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    subFolder,
  });
});

const updateSubFolder = catchAsync(async (req, res) => {
  const subFolder = await SubFolderService.updateSubFolder(req.params.id, req.body);
  if (!subFolder) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'Sub Folder not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    subFolder,
  });
});

const deleteSubFolder = catchAsync(async (req, res) => {
  const subFolder = await SubFolderService.deleteSubFolder(req.params.id);
  if (!subFolder) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'Sub Folder not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    subFolder,
  });
});

const searchSubFolder = catchAsync(async (req, res) => {
  const subFolder = await SubFolderService.searchSubFolder(req.query.name);
  res.status(httpStatus.OK).json({
    status: 'success',
    subFolder,
  });
});

module.exports = {
  createSubFolder,
  getSubFolders,
  getSubFolder,
  updateSubFolder,
  deleteSubFolder,
  searchSubFolder,
};
