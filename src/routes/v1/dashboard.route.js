const express = require('express');
const { dashboardController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.route('/').get(auth('managePeople'), dashboardController.getDashboardData);

module.exports = router;
