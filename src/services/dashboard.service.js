const { People, Meeting, Location } = require('../models');

const getDashboardData = async () => {
  const [meeting, songMinister, minister, location] = await Promise.all([
    Meeting.count(),
    People.count({ type: 'song-minister' }),
    People.count({ type: 'minister' }),
    Location.count(),
  ]);

  const dashboardData = {
    meeting,
    songMinister,
    minister,
    location,
  };

  return dashboardData;
};

module.exports = {
  getDashboardData,
};
