const Configuration = require('./configuration');

class MappingRequestHandler {
    constructor(request, response, mapperClass) {
        this.request = request;
        this.response = response;
        this.mapperClass = mapperClass;
    }

    /**
     * Loads the requested external feed, maps it to the format Lokalportal expects
     * and responds with the mapped version as JSON.
     */
    handleRequest() {
        Configuration.feedUrl  = this.mapperClass.feedUrl();
        Configuration.feedName = this.mapperClass.feedName();

        new this.mapperClass().getData()
            .then(json => this.response.send({"data": json}))
            .catch(error => {
                Configuration.logger.error(error);
                return this.response.send({"error": error.message, "stack": error.stack});
            });
    }
}

module.exports = MappingRequestHandler;
