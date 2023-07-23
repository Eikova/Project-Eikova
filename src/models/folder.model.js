const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const FolderSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A name must be provided'],
    },
    photos: { type: Array },
    is_private: {
      type: Boolean,
      default: false,
    },
    subFolder: {
      type: Array,
      ref: 'SubFolder',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
FolderSchema.plugin(toJSON);
FolderSchema.plugin(paginate);
/*


/**
 * @typedef Folders
 */
const Folders = mongoose.model('Folder', FolderSchema);

module.exports = Folders;
