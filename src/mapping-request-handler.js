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
    let mapper = new this.MapperClass(this.request.query);

    Configuration.feedUrl = mapper.feedUrl;
    Configuration.feedName = mapper.feedName;

    mapper.getData()
      .then(json => this.response.status(200).send({ 'data': json }))
      .catch(error => {
        Configuration.logger.error(error);

        if (error instanceof Object)
          return this.response.status(500).send({ error: error.message, stack: error.stack.split('\n') });
        else
          return this.response.status(500).send({ error: error });
      });
  }
}

module.exports = MappingRequestHandler;
