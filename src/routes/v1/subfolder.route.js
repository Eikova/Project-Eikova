const express = require('express');
const { subFolderController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .get(auth('manageMeeting'), subFolderController.getSubFolders)

  .post(auth('manageMeeting'), subFolderController.createSubFolder);

router.route('/search').get(auth('manageMeeting'), subFolderController.searchSubFolder);

router
  .route('/:id')
  .get(auth('manageMeeting'), subFolderController.getSubFolder)
  .patch(auth('manageMeeting'), subFolderController.updateSubFolder)
  .delete(auth('manageMeeting'), subFolderController.deleteSubFolder);

module.exports = router;
