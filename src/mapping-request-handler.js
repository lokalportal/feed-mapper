const Configuration = require('./configuration');

class MappingRequestHandler {
  constructor(request, response, mapperClass) {
    this.request = request;
    this.response = response;
    this.MapperClass = mapperClass;
  }

  /**
     * Loads the requested external feed, maps it to the format Lokalportal expects
     * and responds with the mapped version as JSON.
     */
  handleRequest() {
    Configuration.feedUrl = this.MapperClass.feedUrl;
    Configuration.feedName = this.MapperClass.feedName;

    new this.MapperClass().getData(this.request.query)
      .then(json => this.response.send({ 'data': json }))
      .catch(error => {
        Configuration.logger.error(error);

        if (error instanceof Object)
          return this.response.send({ error: error.message, stack: error.stack.split('\n') });
        else
          return this.response.send({ error: error });
      });
  }
}

module.exports = MappingRequestHandler;
