const express = require('express');
const { tagController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();


router
  .route('/')
  .get(auth('managePhotos'), tagController.getAllTags)

router
  .route('/search')
  .get(auth('managePhotos'), tagController.searchTags)

router
  .route('/create')
  .post(auth('managePhotos'), tagController.createTag)

router
  .route('/:id')
  .get(auth('managePhotos'), tagController.getTag)
  .patch(auth('managePhotos'), tagController.updateTag)
  .delete(auth('managePhotos'), tagController.deleteTag)


module.exports = router;


