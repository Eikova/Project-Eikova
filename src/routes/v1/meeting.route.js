const express = require('express');
const { meetingController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();


router
  .route('/')
  .get(auth('manageMeeting'), meetingController.getAllMeetings)

router
  .route('/search')
  .get(auth('manageMeeting'), meetingController.searchMeeting)

router
  .route('/create')
  .post(auth('manageMeeting'), meetingController.createMeeting)

router
  .route('/:id')
  .get(auth('manageMeeting'), meetingController.getAMeeting)
  .patch(auth('manageMeeting'), meetingController.updateMeeting)
  .delete(auth('manageMeeting'), meetingController.deleteMeeting)


module.exports = router;


