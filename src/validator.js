const Configuration = require('./configuration');
const Ajv = require('ajv');

const schemaValidator = new Ajv({ allErrors: true, schemaId: 'auto' });
schemaValidator.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

class Validator {
  static validationMethod(schema) {
    return schemaValidator.compile(require(`../schemas/${schema}.json`));
  }

  static reportInvalidEvents(events) {
    Configuration.logger.error(`${Configuration.feedName}: Invalid Events`, {
      params: { events }
    });
  }

  /**
     * Filters out events which are not valid regarding the JSON schema
     * for Lokalportal event imports
     *
     * @param events
     *   The events to be validated as JSON object
     * @param {boolean} reportInvalid
     *   If set to +true+, invalid events will be automatically reported using the set up logger.
     */
  static validateEvents(events, reportInvalid = true) {
    let validate = Validator.validationMethod('event');
    let validEvents = events.filter(e => validate(e));

    if (reportInvalid && validEvents.length < events.length)
      Validator.reportInvalidEvents(events.filter(e => !validEvents.includes(e)));

    return validEvents;
  }
}

module.exports = Validator;
