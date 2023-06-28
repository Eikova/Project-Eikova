const httpStatus = require('http-status');
const sharp = require('sharp');
const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const ExifReader = require('exifreader');
const mime = require('mime-types');

const Bugsnag = require('@bugsnag/js');
const logger = require('../config/logger');
const { Photos } = require('../models');
const ApiError = require('../utils/ApiError');
const { addToSearchIndex, updateSearchIndex, searchIndex } = require('../middlewares/elasticsearch');

const s3 = new S3({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const deleteFile = (path) => {
  fs.unlink(path, (err) => {
    if (err) logger.error(err);
    logger.info(`file ${path} deleted successfully`);
  });
};

const uploadToS3 = async (path, newName, bucket) => {
  const fileStream = fs.createReadStream(path);

  // Setting up S3 upload parameters
  const params = {
    Bucket: bucket,
    Key: newName,
    Body: fileStream,
  };
  // Uploading files to the bucket
  const action = s3.upload(params).promise();
  logger.info(`AWS S3 action: file (${newName}) created in ${bucket} bucket.`);
  return action;
};

const deleteFromS3 = (path, bucket) => {
  // Setting up S3 delete parameters
  const params = {
    Bucket: bucket,
    Key: path,
  };
  // Deleting files from the bucket
  const action = s3.deleteObject(params).promise();
  logger.info(`AWS S3 action: file (${path}) deleted from ${bucket} bucket.`);
  return action;
};

const destroyPhoto = async (path, bucket) => {
  try {
    await deleteFromS3(path, bucket);
    return true;
  } catch (err) {
    return false;
  }
};

const getMetadata = async (path) => {
  const meta = await ExifReader.load(path);

  delete meta.MakerNote;
  delete meta.MPEntry;
  delete meta.Images;
  delete meta.UserComment;
  delete meta.CFAPattern;
  return meta;
};

const replacePhoto = async (id, file) => {
  try {
    const photo = await Photos.findById(id);
    if (!photo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Photo not found');
    }
    // const meta = await getMetadata(file.path);

    // destroy old photo
    const { url, thumbnail } = photo;
    const bucketMain = process.env.AWS_BUCKET_MAIN;
    const bucketThumbnail = process.env.AWS_BUCKET_THUMBNAILS;
    await destroyPhoto(url, bucketMain);
    await destroyPhoto(thumbnail, bucketThumbnail);

    // process new photo
    const str = photo.title.replaceAll(' ', '_');
    const ext = mime.extension(file.mimetype);
    const newNameMain = `${str}_main_${Date.now()}.${ext}`;
    const newNameThumb = `${str}_thumb_${Date.now()}`;
    const newPhoto = await uploadToS3(file.path, newNameMain, bucketMain);

    // upload new thumbnail
    const thumbWebp = await sharp(file.path).resize(500, 500).toFile(`uploads/${newNameThumb}.webp`);
    const thumbnailPath = `uploads/${newNameThumb}.webp`;
    const newThumbnail = await uploadToS3(thumbnailPath, newNameThumb, bucketThumbnail);

    deleteFile(file.path);
    deleteFile(thumbnailPath);

    // save to db
    const newPhotoDetails = {
      url: newPhoto.Location,
      thumbnail: newThumbnail.Location,
      // metadata: meta,
    };
    const update = await Photos.findByIdAndUpdate(id, newPhotoDetails);
    await updateSearchIndex(id, newPhotoDetails);
    return update;
  } catch (err) {
    Bugsnag.notify(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const uploadPhoto = async (obj, file, userId, isDraft = false) => {
  // const meta = await getMetadata(file.path);
  const ext = mime.extension(file.mimetype);
  const str = obj.title.replaceAll(' ', '_');
  // const str = obj.title.replace(/ /g, '_');
  const fileNameMain = `${str}_main_${Date.now()}.${ext}`;
  const fileNameThumb = `${str}_thumb_${Date.now()}`;

  try {
    const bucketMain = process.env.AWS_BUCKET_MAIN;
    const photo = await uploadToS3(file.path, fileNameMain, bucketMain);
    const thumbWebp = await sharp(file.path).resize(500, 500).toFile(`uploads/${fileNameThumb}.webp`);
    const thumbnailPath = `uploads/${fileNameThumb}.webp`;

    const bucketThumbnail = process.env.AWS_BUCKET_THUMBNAILS;
    const thumbnail = await uploadToS3(thumbnailPath, fileNameThumb, bucketThumbnail);

    // const meta = await sharp(file.path).metadata();

    deleteFile(file.path);
    deleteFile(thumbnailPath);

    const photoData = {
      url: photo.Location,
      thumbnail: thumbnail.Location,
      description: obj.description,
      title: obj.title,
      tags: obj.tags,
      year: obj.year,
      month: obj.month,
      meeting: obj.meeting,
      people: obj.people,
      location: obj.location,
      // metadata: meta,
      user: userId,
    };

    if (!isDraft) {
      photoData.is_published = true;
    }
    const data = await Photos.create({ ...photoData });
    const index = await addToSearchIndex(data);
    logger.info(`photo (${photoData.url}) uploaded successfully`);
    return data;
  } catch (error) {
    Bugsnag.notify(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const batchUploadPhoto = async (data, files, userId) => {
  const response = [];
  try {
    for (let i = 0; i < data.length; i++) {
      const body = data[i];
      const image = files[i];
      const photo = await uploadPhoto(body, image, userId);
      response.push(photo);
    }
    logger.info(`bulk photo write action finished successfully`);
    return response;
  } catch (error) {
    Bugsnag.notify(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getPhotos = async (options, people = null) => {
  // logger.info(options.sortBy);
  try {
    if (people !== null) {
      return await Photos.find({ type: { $regex: people, $options: 'i' } }).limit(10);
    }
    return await Photos.paginate({ is_published: true, is_deleted: false, is_private: false }, options);
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getPrivatePhotos = async (options) => {
  try {
    return await Photos.paginate({ is_deleted: false, is_private: true }, options);
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getContributions = async (userId, options) => {
  try {
    return await Photos.paginate({ user: userId, is_published: true, is_deleted: false, is_private: false }, options);
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getPhoto = async (id) => {
  try {
    const photo = await Photos.findOne({ _id: id, is_deleted: false });
    if (!photo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Photo not found');
    }
    const relatedPhotos = await Photos.find({
      is_published: true,
      is_deleted: false,
      is_private: false,
      tags: { $in: photo.tags },
    }).limit(10);
    return { photo, relatedPhotos };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const downloadPhoto = async (id) => {
  try {
    return await Photos.findByIdAndUpdate(id, { $inc: { downloads: 1 }, modified_at: Date.now() }, { new: true });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const togglePhotoPrivacy = async (id) => {
  try {
    const photo = await getPhoto(id);
    const privacy = photo.is_private;
    const data = { is_private: !privacy, modified_at: Date.now() };
    const update = await Photos.findByIdAndUpdate(id, data, { new: true });
    await updateSearchIndex(id, data);
    logger.info(`privacy changed for photo with ID: (${id}).`);
    return update;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const deletePhoto = async (id) => {
  try {
    const data = { is_deleted: true, modified_at: Date.now() };
    const update = await Photos.findByIdAndUpdate(id, data, { new: true });
    await updateSearchIndex(id, data);
    logger.info(`photo with ID: (${id}) deleted.`);
    return update;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const updatePhoto = async (id, obj) => {
  // this endpoint does not allow a change to the photo itself, just its properties.
  try {
    const photo = await Photos.findOne({ _id: id, is_private: false, is_deleted: false });
    const data = {};
    data.title = obj.title ? obj.title : photo.title;
    data.description = obj.description ? obj.description : photo.description;
    data.tags = obj.tags ? obj.tags : photo.tags;
    data.year = obj.year ? obj.year : photo.year;
    data.month = obj.month ? obj.month : photo.month;
    data.meeting = obj.meeting ? obj.meeting : photo.meeting;
    data.people = obj.people ? obj.people : photo.people;
    data.location = obj.location ? obj.location : photo.location;

    const updateDetails = { ...data, modified_at: Date.now() };
    const update = await Photos.findByIdAndUpdate(id, updateDetails, { new: true });
    await updateSearchIndex(id, updateDetails);
    logger.info(`photo with ID: (${id}) updated.`);
    return update;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const publishDraft = async (id) => {
  try {
    const data = { is_published: true, modified_at: Date.now() };
    const update = await Photos.findByIdAndUpdate(id, data, { new: true });
    await updateSearchIndex(id, data);
    logger.info(`Draft photo with ID: (${id}) published.`);
    return update;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const searchPhotos = async (query, options) => {
  try {
    return await searchIndex(query, options);
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const adminGetPhotos = async () => {
  try {
    return await Photos.find();
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

module.exports = {
  uploadPhoto,
  batchUploadPhoto,
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
  searchPhotos,
  adminGetPhotos,
};
