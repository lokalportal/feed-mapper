class Logger {
    log(message) {
        console.log(message);
    }

    error(message, options = {}) {
        console.error(message);
    }
}

module.exports = Logger;
