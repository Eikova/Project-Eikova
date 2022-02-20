const express = require('express');
const multer = require('multer');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { photoController } = require('../../controllers');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router
  .route('/')
  .post(auth('managePhotos'), upload.single('image'), photoController.createPhoto)
  //.get(auth('managePhotos'), photoController.getUsers);


module.exports = router;
