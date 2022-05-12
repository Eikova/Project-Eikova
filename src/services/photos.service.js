const httpStatus = require('http-status');
const sharp = require('sharp');
const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const { promisify } = require('util');
const ExifReader = require('exifreader');

const unlinkAsync = promisify(fs.unlink);
const { Photos } = require('../models');
const ApiError = require('../utils/ApiError');
const { addToSearchIndex, updateSearchIndex, searchIndex } = require('../middlewares/elasticsearch');

const s3 = new S3({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const uploadToS3 = async(path, newName, bucket) => {
  // Read content from the file
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const fileStream = fs.createReadStream(path);

  // Setting up S3 upload parameters
  const params = {
    Bucket: bucket,
    Key: newName,
    Body: fileStream,
  };
  // Uploading files to the bucket
  return s3.upload(params).promise();
};

const deleteFromS3 = (path, bucket) => {
  // Setting up S3 delete parameters
  const params = {
    Bucket: bucket,
    Key: path,
  };
  // Deleting files from the bucket
  return s3.deleteObject(params).promise();
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
    const meta = await getMetadata(file.path);

    // destroy old photo
    const { url, thumbnail } = photo;
    const bucketMain = process.env.AWS_BUCKET_MAIN;
    const bucketThumbnail = process.env.AWS_BUCKET_THUMBNAILS;
    await destroyPhoto(url, bucketMain);
    await destroyPhoto(thumbnail, bucketThumbnail);

    // process new photo
    const str = photo.title.replaceAll(' ', '_');
    const newNameMain = `${str}_main_${Date.now()}`;
    const newNameThumb = `${str}_thumb_${Date.now()}`;
    const newPhoto = await uploadToS3(file.path, newNameMain, bucketMain);

    // upload new thumbnail
    const thumbWebp = await sharp(file.path).resize(300, 300).toFile(`uploads/${newNameThumb}.webp`);
    console.log(thumbWebp,"======> Thumbwebp")
    const thumbnailPath = `uploads/${newNameThumb}.webp`;
    const newThumbnail = await uploadToS3(thumbnailPath, newNameThumb, bucketThumbnail);

    // const meta = await getMetadata(file.path);

    await unlinkAsync(file.path);
    await unlinkAsync(thumbnailPath);

    // save to db
    const newPhotoDetails = {
      url: newPhoto.Location,
      thumbnail: newThumbnail.Location,
      metadata: meta,
    };
    const update = await Photos.findByIdAndUpdate(id, newPhotoDetails);
    await updateSearchIndex(id, newPhotoDetails);
    return update;
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const uploadPhoto = async (obj, file, userId, isDraft = false) => {
  const meta = await getMetadata(file.path);
  console.log(meta, "=====> META")
  console.log(file.path,"=====> File Path")
  const str = obj.title.replaceAll(' ', '_');
  const fileNameMain = `${str}_main_${Date.now()}`;
  const fileNameThumb = `${str}_thumb_${Date.now()}`;
  try {
    const bucketMain = process.env.AWS_BUCKET_MAIN;
    const photo = await uploadToS3(file.path, fileNameMain, bucketMain);
    console.log(fileNameMain,"====>FileNAmeMain.")
    console.log(photo, "====> service photo")

    // upload thumbnails
    const thumbWebp = await sharp(file.path).resize(300, 300).toFile(`uploads/${fileNameThumb}.webp`);
    const thumbnailPath = `uploads/${fileNameThumb}.webp`;

    const bucketThumbnail = process.env.AWS_BUCKET_THUMBNAILS;
    const thumbnail = await uploadToS3(thumbnailPath, fileNameThumb, bucketThumbnail);
    console.log(thumbnail,"=====>thumbnail2")

    // const meta = await sharp(file.path).metadata();

    await unlinkAsync(file.path);
    await unlinkAsync(thumbnailPath);

    const photoData = {
      url: photo.Location,
      thumbnail: thumbnail.Location,
      description: obj.description,
      title: obj.title,
      tags: obj.tags,
      year: obj.year,
      month: obj.month,
      meeting_id: obj.meeting_id,
      metadata: meta,
      user: userId,
    };
    console.log("========>3")

    if (!isDraft) {
      photoData.is_published = true;
    }
    const data = await Photos.create({ ...photoData });
    const index = await addToSearchIndex(data);
  console.log(index,'====> index')
    return data;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getPhotos = async (options) => {
  try {
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
    return await Photos.findOne({ _id: id, is_deleted: false });
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
    return update;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const updatePhoto = async (id, obj) => {
  // this endpoint does not allow a change to the photo itself, just it's properties.
  try {
    const photo = await Photos.findOne({ _id: id, is_private: false, is_deleted: false });
    const data = {};
    data.title = obj.title ? obj.title : photo.title;
    data.description = obj.description ? obj.description : photo.description;
    data.tags = obj.tags ? obj.tags : photo.tags;
    data.year = obj.year ? obj.year : photo.year;
    data.month = obj.month ? obj.month : photo.month;
    data.meeting_id = obj.meeting_id ? obj.meeting_id : photo.meeting_id;

    const updateDetails = { ...data, modified_at: Date.now() };
    const update = await Photos.findByIdAndUpdate(id, updateDetails, { new: true });
    await updateSearchIndex(id, updateDetails);
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

module.exports = {
  uploadPhoto,
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
};
