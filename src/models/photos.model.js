const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const PhotoSchema = mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'A photo url must be provided'],
    },
    thumbnail: {
      type: String,
      required: [true, 'A thumbnail url must be provided'],
    },
    title: {
      type: String,
      required: [true, 'A title must be provided'],
    },
    description: {
      type: String,
      required: [true, 'A description must be provided'],
    },
    tags: { type: Array },
    metadata: { type: Array },
    is_published: {
      type: Boolean,
      default: false,
    },
    is_private: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    year: {
      type: Number,
      required: [true, 'A year must be provided'],
    },
    month: {
      type: Number,
      required: [true, 'A month must be provided'],
    },
    meeting: {
      type: String,
    },
    people: {
      type: String,
    },
    location: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
PhotoSchema.plugin(toJSON);
PhotoSchema.plugin(paginate);
/*
user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
 */

/**
 * @typedef Photos
 */
const Photos = mongoose.model('Photos', PhotoSchema);

module.exports = Photos;
