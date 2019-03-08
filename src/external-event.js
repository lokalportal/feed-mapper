const moment = require('moment-timezone');

class ExternalEvent {
    constructor(eventData) {
        this.data        = eventData;
        this.occurrences = [eventData];
    }

    extractUniqueEvents() {
        return Promise.all(this.occurrences.map(o => this.generateEvent(o)));
    }

    generateEvent(occurrence) {
        return {
            id: this.getID(occurrence),
            externalLink: this.getExternalLink(),
            title: this.getTitle(),
            body: this.getBody(),
            startTime: this.getStartTimeString(occurrence),
            endTime: this.getEndTimeString(occurrence),
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
