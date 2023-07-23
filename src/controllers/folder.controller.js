const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { FolderService } = require('../services');
const pick = require('../utils/pick');

const createFolder = catchAsync(async (req, res) => {
  const folder = await FolderService.createFolder(req);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    folder,
  });
});

const getFolders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'address']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const folder = await FolderService.getFolders(filter, options);
  res.status(httpStatus.OK).json({
    status: 'success',
    folder,
  });
});

const getFolder = catchAsync(async (req, res) => {
  const folder = await FolderService.getFolder(req.params.id);
  if (!folder) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'Folder not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    folder,
  });
});

const updateFolder = catchAsync(async (req, res) => {
  const folder = await FolderService.updateFolder(req.params.id, req.body);
  if (!folder) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'Folder not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    folder,
  });
});

const deleteFolder = catchAsync(async (req, res) => {
  const folder = await FolderService.deleteFolder(req.params.id);
  if (!folder) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: 'fail',
      message: 'folder not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    folder,
  });
});

const searchFolder = catchAsync(async (req, res) => {
  const folder = await FolderService.searchFolder(req.query.name);
  res.status(httpStatus.OK).json({
    status: 'success',
    folder,
  });
});

module.exports = {
  createFolder,
  getFolders,
  getFolder,
  updateFolder,
  deleteFolder,
  searchFolder,
};
