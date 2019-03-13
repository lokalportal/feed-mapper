const moment = require('moment-timezone');
const Ajv    = require('ajv');
const Configuration = require('./configuration');
const googleMapsClient = require('@google/maps').createClient({
    key: process.env.GOOGLE_PLACES_API_KEY,
    Promise: Promise
});
const placeIdCache = {};

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
        return this.getAddress(occurrence)
            .then(address => {
                return {
                    id: this.getID(occurrence),
                    external_link: this.getExternalLink(),
                    title: this.getTitle(),
                    body: this.getBody(),
                    start_time: this.getStartTimeString(occurrence),
                    end_time: this.getEndTimeString(occurrence),
                    category: this.getCategory(),
                    image_urls: this.getImageURLs(),
                    address: address
                }
            })
    }

    getAddress(occurrence) {
        let baseAddress = {
            description: this.getAddressDescription(occurrence),
            street: this.getAddressStreet(occurrence),
            zip: this.getAddressZip(occurrence),
            city: this.getAddressCity(occurrence),
            google_place_id: null
        };

        return this.getGooglePlaceId(occurrence)
            .then(placeID => {
                return {...baseAddress, google_place_id: placeID}
            })
            .catch(err => {
                Configuration.logger.error(err);
                return baseAddress;
            });
    }

    hasCompleteAddress(occurrence) {
        return this.getAddressStreet(occurrence) &&
            this.getAddressZip(occurrence) &&
            this.getAddressCity(occurrence);
    }

    getStartTimeString(occurrence) {
        return this.getStartTime(occurrence).format();
    }

    getEndTimeString(occurrence) {
        let endTime = this.getEndTime(occurrence);
        return endTime ? endTime.format() : endTime;
    }

    getGooglePlaceId(occurrence) {
        if (!Configuration.automagicalGooglePlaceId || !this.hasCompleteAddress(occurrence))
            return Promise.resolve(null);

        let addressString = this.getPlacesLookupString(occurrence);

        if (placeIdCache[addressString]) return placeIdCache[addressString];

        return placeIdCache[addressString] = googleMapsClient.geocode({address: addressString})
            .asPromise()
            .then(response => {
                if (response.json.status === 'ZERO_RESULTS') {
                    Configuration.logger.error(`Zero Google Places results for "${addressString}"`);
                    return null;
                }
                return response.json.results[0].place_id;
            });
    }

    /**
     * Helpers
     */

    static momentTime(datetimeString) {
        return moment.tz(datetimeString, 'Europe/Berlin')
    }
}

module.exports = ExternalEvent;
