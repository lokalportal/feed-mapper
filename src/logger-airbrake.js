const AirbrakeClient = require('airbrake-js');
const Configuration  = require('./configuration');
const Logger         = require('./logger');

class AirbrakeLogger extends Logger {
    constructor() {
        super();
        this.airbrake = new AirbrakeClient({
            projectId: process.env.AIRBRAKE_PROJECT_ID,
            projectKey: process.env.AIRBRAKE_PROJECT_KEY
        });
    }

    error(message, options = {}) {
        let { feedUrl, feedName } = Configuration;

        let notification = {
            error: message,
            environment: {feedUrl, feedName},
            ...options
        };

        this.airbrake.notify(notification);
    }
}

module.exports = AirbrakeLogger;
