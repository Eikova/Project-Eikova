const express = require('express');
const { locationController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .get(auth('manageMeeting'), locationController.getAllLocation)

  .post(auth('manageMeeting'), locationController.addLocation);

router.route('/search').get(auth('manageMeeting'), locationController.searchLocation);

router
  .route('/:id')
  .get(auth('manageMeeting'), locationController.getLocation)
  .patch(auth('manageMeeting'), locationController.updateLocation)
  .delete(auth('manageMeeting'), locationController.deleteLocation);

module.exports = router;
