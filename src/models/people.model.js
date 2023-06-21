const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { peopleEnum } = require('../enums/people.enum');

const PeopleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 40,
      unique: true,
    },

    type: {
      type: String,
      enum: [peopleEnum.SONG_MINISTER, peopleEnum.MINISTER, peopleEnum.OTHERS],
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
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
PeopleSchema.plugin(toJSON);
PeopleSchema.plugin(paginate);

/**
 * @typedef People
 */
const People = mongoose.model('People', PeopleSchema);

module.exports = People;
