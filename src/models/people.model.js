const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const PeopleSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    maxlength: 22,
    unique: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// add plugin that converts mongoose to json
PeopleSchema.plugin(toJSON);
PeopleSchema.plugin(paginate);

/**
 * @typedef People
 */
const People = mongoose.model('People', PeopleSchema);

module.exports = People;
