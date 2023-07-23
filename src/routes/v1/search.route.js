const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { searchController } = require('../../controllers');

const router = express.Router();

router.route('/').get(auth('download'), searchController.searchPhotos);

router
  .route('/sys/index/populate')
  .post(auth('manageAdmin'), searchController.populateIndex)



module.exports = router;
