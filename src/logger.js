class Logger {
  log(message) {
    console.log(message);
  }

  error(message, options = {}) {
    console.error(message);
    if (Object.entries(options).length)
      console.error(JSON.stringify(options, null, 2));
  }
}

module.exports = Logger;
