const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const SubFolderSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A name must be provided'],
    },
    photos: { type: Array },
    folder_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        required: true
      },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
SubFolderSchema.plugin(toJSON);
SubFolderSchema.plugin(paginate);
/*


/**
 * @typedef SubFolders
 */
const SubFolders = mongoose.model('SubFolder', SubFolderSchema);

module.exports = SubFolders;
