const logger = require('./logger');

exports.logUnexpectedError = err => logger.error(`Unexpected error occurred: '${err.message}'`);
