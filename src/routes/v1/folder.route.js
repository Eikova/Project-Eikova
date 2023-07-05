const express = require('express');
const { folderController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .get(auth('manageMeeting'), folderController.getFolders)

  .post(auth('manageMeeting'), folderController.createFolder);

router.route('/search').get(auth('manageMeeting'), folderController.searchFolder);

router
  .route('/:id')
  .get(auth('manageMeeting'), folderController.getFolder)
  .patch(auth('manageMeeting'), folderController.updateFolder)
  .delete(auth('manageMeeting'), folderController.deleteFolder);

module.exports = router;
