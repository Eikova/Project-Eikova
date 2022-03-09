const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const TagsSchema = mongoose.Schema(
  {
  tag: {
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
TagsSchema.plugin(toJSON);
TagsSchema.plugin(paginate);

/**
 * @typedef Tags
 */
const Tag = mongoose.model('Tag', TagsSchema);

module.exports = Tag;
