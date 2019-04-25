const moment = require('moment-timezone');
const Configuration = require('./configuration');
const googleMapsClient = require('@google/maps').createClient({
  key:     process.env.GOOGLE_PLACES_API_KEY,
  Promise: Promise
});
const placeIDCache = {};

class ExternalEvent {
  constructor(eventData) {
    this.data = eventData;
  }

  /****************************************************************
    **                      JSON Generation
    ****************************************************************/

  toJSON() {
    return this.buildAddressJSON()
      .then(address => {
        return {
          id:            this.id,
          external_link: this.externalLink,
          title:         this.title,
          body:          this.body,
          start_time:    this.startTimeString,
          end_time:      this.endTimeString,
          category:      this.category,
          image_urls:    this.imageURLs,
          address:       address
        };
      });
  }

  buildAddressJSON() {
    let baseAddress = Object.assign({}, this.address, { google_place_id: null });

    return this.lookupGooglePlaceID()
      .then(placeID => {
        return { ...baseAddress, google_place_id: placeID };
      })
      .catch(err => {
        Configuration.logger.error(err);
        return baseAddress;
      });
  }

  /****************************************************************
    **                         Attributes
    ****************************************************************/

  get startTimeString() {
    return this.startTime.format();
  }

  get endTimeString() {
    return (this.endTime && this.endTime.format()) || this.endTime;
  }

  /****************************************************************
    **                          Helpers
    ****************************************************************/

  /**
     * @returns {boolean} +true+ if the external event contains all necessary information to build
     *   a complete address (city, zip and street)
     */
  get hasCompleteAddress() {
    return !!(this.address.street && this.address.city && this.address.zip);
  }

  lookupGooglePlaceID() {
    if (!Configuration.automagicalGooglePlaceId || !this.hasCompleteAddress)
      return Promise.resolve(null);

    // If we already have a cached promise for this lookup, simply return it
    if (placeIDCache[this.placesLookupString]) return placeIDCache[this.placesLookupString];

    // Otherwise, cache a new promise which performs the actual google places lookup
    return placeIDCache[this.placesLookupString] = this.placeLookupThroughGeocode(this.placesLookupString)
  }

  /**
   * Attempts to lookup the given query through Google's geocoding API
   *
   * @param query
   * @returns {PromiseLike<T | never> | Promise<T | never> | *}
   */
  placeLookupThroughGeocode(query) {
    return googleMapsClient.geocode({ address: query })
      .asPromise()
      .then(response => {
        if (response.json.status === 'ZERO_RESULTS') {
          Configuration.logger.error(`Zero Google Places results for "${query}"`);
          return null;
        }
        return response.json.results[0].place_id;
      })
  }

  /**
   * Attempts to lookup the given query through Google's places autocomplete API
   *
   * @param query
   * @returns {PromiseLike<T | never> | Promise<T | never> | *}
   */
  placeLookupThroughAutocomplete(query) {
    return googleMapsClient.placesAutoComplete({
        input: query,
        sessiontoken: query,
        types: ['geocode'],
        language: 'de',
        components: {country: 'de'}
      })
      .asPromise()
      .then(response => {
        if (response.json.status === 'ZERO_RESULTS') {
          Configuration.logger.error(`Zero Google Places results for "${query}"`);
          return null;
        }
        return response.json.predictions[0].place_id;
      })
  }

  static momentTime(datetimeString) {
    return moment.tz(datetimeString, 'Europe/Berlin');
  }
}

module.exports = ExternalEvent;
