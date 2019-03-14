module.exports = {
  AirbrakeLogger:        require('./src/logger-airbrake'),
  Configuration:         require('./src/configuration'),
  ExternalEvent:         require('./src/external-event'),
  Logger:                require('./src/logger'),
  MappingRequestHandler: require('./src/mapping-request-handler'),
  XMLFeedMapper:         require('./src/feed-mapper-xml'),
  Validator:             require('./src/validator')
};
