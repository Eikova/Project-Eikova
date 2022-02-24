const express = require('express');
const multer = require('multer');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { photoController } = require('../../controllers');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();


router
  .route('/')
  .get(auth('managePhotos'), photoController.getPhotos)

router
  .route('/upload')
  .post(auth('managePhotos'), upload.single('image'), photoController.createPhoto)

router
  .route('/drafts')
  .post(auth('managePhotos'), upload.single('image'), photoController.createDraft)



module.exports = router;
