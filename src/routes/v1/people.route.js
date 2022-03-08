const express = require('express');
const { peopleController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();


router
  .route('/')
  .get(auth('managePeople'), peopleController.getAllPeople)

router
  .route('/search')
  .get(auth('managePeople'), peopleController.searchPeople)

router
  .route('/create')
  .post(auth('managePeople'), peopleController.createPeople)

router
  .route('/:id')
  .get(auth('managePeople'), peopleController.getPerson)
  .patch(auth('managePeople'), peopleController.updatePeople)
  .delete(auth('managePeople'), peopleController.deletePeople)


module.exports = router;


