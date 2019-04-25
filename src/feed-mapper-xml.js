const axios = require('axios');
const parseXMLString = require('xml2js').parseString;

class XMLFeedMapper {
  /**
     * Loads the feed set up in #feedUrl through a GET request
     *
     * @returns {Promise<String>} The feed's content
     */
  getFeed() {
    return axios.get(this.feedUrl).then(response => response.data);
  }

  /**
     * Loads the feed URL (expected to be XML) and pipes it through xml2js's parseString
     * to convert it to a javascript object.
     *
     * Please note that it will automatically make an Array out of everything even if the original
     * value from the XML file was a string, e.g. `<id>5</id>` -> `{id: [5]}.
     * There is an option to avoid this, but I found that the general handling of values was actually
     * easier knowing that everything would be an array.
     *
     * @returns {Promise<Object>} The parsed feed as javascript object
     */
  getJSONFeed() {
    return this.getFeed()
      .then(xml => {
        return new Promise((resolve, reject) => {
          parseXMLString(xml, { emptyTag: null, trim: true }, (err, result) => {
            if (err)
              reject(err);
            else
              resolve(result);
          });
        });
      });
  }
}

module.exports = XMLFeedMapper;
