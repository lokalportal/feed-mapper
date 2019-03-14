const Logger = require('./logger');

const Configuration = {
  feedName:                 '',
  feedUrl:                  '',
  automagicalGooglePlaceId: true,
  logger:                   new Logger()
};

module.exports = Configuration;
