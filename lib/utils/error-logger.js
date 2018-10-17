const logger = require('../utils/logger');

exports.logUnexpectedError = (err, key) => logger.error(`Unexpected error occured: '${err.message}' for key: ${key}`);
