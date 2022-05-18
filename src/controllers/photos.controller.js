const httpStatus = require('http-status');

const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { PhotoService } = require('../services');

const createPhoto = catchAsync(async (req, res) => {
  const photo = await PhotoService.uploadPhoto(req.body, req.file, req.user.id);
  res.status(httpStatus.CREATED).json({
    status: httpStatus.CREATED,
    message: 'Photo uploaded successfully',
    data: photo,
  });
});

const replacePhoto = catchAsync(async (req, res) => {
  const photo = await PhotoService.replacePhoto(req.params.id, req.file);
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Photo replaced successfully',
    data: photo,
  });
});

const createDraft = catchAsync(async (req, res) => {
  const photo = await PhotoService.uploadPhoto(req.body, req.file, req.user.id, true);
  res.status(httpStatus.CREATED).json({
    status: httpStatus.CREATED,
    message: 'Draft created!',
    data: photo,
  });
});

const getPhotos = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = 'user';
  if (req.query.sortBy === 'oldest') {
    options.sortBy = 'asc';
  } else {
    options.sortBy = 'desc';
  }
  let photos;
  if (req.query.people) {
    photos = await PhotoService.getPhotos(options, req.query.people);
  } else {
    photos = await PhotoService.getPhotos(options);
  }
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Photos fetched successfully',
    photos,
  });
});

const getPrivatePhotos = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = 'user';
  if (req.query.sortBy === 'oldest') {
    options.sortBy = 'asc';
  } else {
    options.sortBy = 'desc';
  }
  const photos = await PhotoService.getPrivatePhotos(options);
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Photos fetched successfully',
    photos,
  });
});

const getContributions = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = 'user';
  if (req.query.sortBy === 'oldest') {
    options.sortBy = 'asc';
  } else {
    options.sortBy = 'desc';
  }
  const photos = await PhotoService.getContributions(req.params.userId, options);
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Photos fetched successfully',
    photos,
  });
});

const downloadPhoto = catchAsync(async (req, res) => {
  const photo = await PhotoService.downloadPhoto(req.params.id);
  if (!photo) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Photo not found',
    });
  }
  const { url } = photo;
  res.status(httpStatus.OK).json({
    url,
  });
});

const togglePhotoPrivacy = catchAsync(async (req, res) => {
  const photo = await PhotoService.togglePhotoPrivacy(req.params.id);
  if (!photo) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Photo not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Photo privacy changed successfully',
    photo,
  });
});

const deletePhoto = catchAsync(async (req, res) => {
  const photo = await PhotoService.deletePhoto(req.params.id);
  if (!photo) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Photo not found',
    });
  }
  res.status(httpStatus.NO_CONTENT).json({
    message: 'Photo deleted',
  });
});

const getPhoto = catchAsync(async (req, res) => {
  const photo = await PhotoService.getPhoto(req.params.id);
  if (!photo) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Photo not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Photo fetched successfully',
    photo,
  });
});

const updatePhoto = catchAsync(async (req, res) => {
  const photo = await PhotoService.updatePhoto(req.params.id, req.body);
  if (!photo) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Photo not found',
    });
  }
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Photo edited successfully',
    photo,
  });
});

const publishDraft = catchAsync(async (req, res) => {
  const photo = await PhotoService.publishDraft(req.params.id);
  if (!photo) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Photo not found',
    });
  }
  res.status(httpStatus.OK).json({
    message: 'Draft Published',
    photo,
  });
});

module.exports = {
  createPhoto,
  createDraft,
  getPhotos,
  downloadPhoto,
  togglePhotoPrivacy,
  deletePhoto,
  getPhoto,
  updatePhoto,
  getPrivatePhotos,
  publishDraft,
  replacePhoto,
  getContributions,
};
