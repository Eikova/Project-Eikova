const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const LocationSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    maxlength: 40,
    unique: true,
  },

  address: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    maxlength: 40,
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// add plugin that converts mongoose to json
LocationSchema.plugin(toJSON);
LocationSchema.plugin(paginate);

/**
 * @typedef People
 */
const Location = mongoose.model('Location', LocationSchema);

module.exports = Location;
