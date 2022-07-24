const express = require('express');
const photoRoute = require('./photos.route');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const tagRoute = require('./tags.route');
const peopleRoute = require('./people.route');
const meetingRoute = require('./meeting.route');
const searchRoute = require('./search.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/photos',
    route: photoRoute,
  },
  {
    path: '/tags',
    route: tagRoute,
  },
  {
    path: '/people',
    route: peopleRoute,
  },
  {
    path: '/meeting',
    route: meetingRoute,
  },
  {
    path: '/search',
    route: searchRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development' || config.env === 'production') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
