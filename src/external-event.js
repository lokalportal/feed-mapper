const moment = require('moment-timezone');
const Ajv    = require('ajv');
const Configuration = require('./configuration');

class ExternalEvent {
    constructor(eventData) {
        this.data        = eventData;
        this.occurrences = [eventData];
    }

    static reportInvalidEvents(events) {
        Configuration.logger.error(`${Configuration.feedName}: Invalid Events`, {
            params: {events}
        });
    }

    extractUniqueEvents() {
        return Promise.all(this.occurrences.map(o => this.generateEvent(o)));
    }

    /**
     * Filters out events which are not valid regarding the JSON schema
     * for Lokalportal event imports
     *
     * @param events
     * @param reportInvalid
     */
    static validateEvents(events, reportInvalid = true) {
        const schemaValidator = new Ajv({allErrors: true, schemaId: 'auto'});
        schemaValidator.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
        let validate = schemaValidator.compile(require("../schemas/event.json"));

        let validEvents = events.filter(e => validate(e));

        if (reportInvalid && validEvents.length < events.length) {
            ExternalEvent.reportInvalidEvents(events.filter(e => !validEvents.includes(e)));
        }

        return validEvents;
    }

    generateEvent(occurrence) {
        return {
            id: this.getID(occurrence),
            externalLink: this.getExternalLink(),
            title: this.getTitle(),
            body: this.getBody(),
            startTime: this.getStartTimeString(occurrence),
            endTime: this.getEndTimeString(occurrence),
            category: this.getCategory(),
            address: this.getAddress(occurrence),
            imageURLs: this.getImageURLs()
        }
    }

    getAddress(occurrence) {
        return {
            description: this.getAddressDescription(occurrence),
            street: this.getAddressStreet(occurrence),
            zip: this.getAddressZip(occurrence),
            city: this.getAddressCity(occurrence),
        }
    }

    getStartTimeString(occurrence) {
        return this.getStartTime(occurrence).format();
    }

    getEndTimeString(occurrence) {
        let endTime = this.getEndTime(occurrence);
        return endTime ? endTime.format() : endTime;
    }

    /**
     * Helpers
     */

    static momentTime(datetimeString) {
        return moment.tz(datetimeString, 'Europe/Berlin')
    }
}

module.exports = ExternalEvent;
