const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const MeetingSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    maxlength: 40,
    unique: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }, 
});

// add plugin that converts mongoose to json
MeetingSchema.plugin(toJSON);
MeetingSchema.plugin(paginate);

/**
 * @typedef Meeting
 */
const Meeting = mongoose.model('Meeting', MeetingSchema);

module.exports = Meeting;
