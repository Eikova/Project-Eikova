const express = require('express');
const multer = require('multer');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { photoController } = require('../../controllers');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router
  .route('/')
  .get(auth('download'), photoController.getPhotos)

router
  .route('/private')
  .get(auth('fullPhotoAccess'), photoController.getPrivatePhotos)

router
  .route('/user-contributions/:userId')
  .get(auth('managePhotos'), photoController.getContributions)

router
  .route('/:id')
  .get(auth('download'), photoController.getPhoto)
  .patch(auth('managePhotos'), photoController.updatePhoto)
  .delete(auth('fullPhotoAccess'), photoController.deletePhoto)

router
  .route('/:id/download')
  .get(auth('download'), photoController.downloadPhoto)

router
  .route('/:id/replace')
  .patch(auth('managePhotos'), upload.single('image'), photoController.replacePhoto)

router
  .route('/upload')
  .post(auth('managePhotos'), upload.single('image'), photoController.createPhoto)

router
  .route('/drafts')
  .post(auth('managePhotos'), upload.single('image'), photoController.createDraft)

router
  .route('/drafts/:id/publish')
  .patch(auth('managePhotos'), photoController.publishDraft)

router
  .route('/:id/toggle-privacy')
  .patch(auth('fullPhotoAccess'), photoController.togglePhotoPrivacy)


module.exports = router;
