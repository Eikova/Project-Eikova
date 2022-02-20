const httpStatus = require('http-status');
const { Photos } = require('../models');
const ApiError = require('../utils/ApiError');
const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const path = require('path');

const s3 = new S3({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const uploadToS3 = (file, bucket) => {
  // Read content from the file
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const fileStream = fs.createReadStream(file.path);

  // Setting up S3 upload parameters
  const params = {
    Bucket: bucket,
    Key: file.filename,
    Body: fileStream,
  };

  // Uploading files to the bucket
  return s3.upload(params).promise();
};

const uploadPhoto = async (obj, file) => {
  try {
    const bucketMain = process.env.AWS_BUCKET_MAIN;
    const photo = await uploadToS3(file, bucketMain);
    // upload thumbnail
    const bucketThumbnail = process.env.AWS_BUCKET_THUMBNAILS;
    const thumbnail = await uploadToS3(file, bucketThumbnail);

    return await Photos.create({
      url: photo.Location,
      thumbnail: thumbnail.Location,
      description: obj.description,
      title: obj.title,
      tags: obj.tags,
      year: obj.year,
      month: obj.month,
      meeting_id: obj.meeting_id,
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

module.exports = {
  uploadPhoto,
};
