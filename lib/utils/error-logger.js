const logger = require('./logger');

exports.logUnexpectedError = err => logger.error(`Unexpected error occurred: '${err.message}'`);
exports.logDbNotReadyError = () => logger.warn('Stethoscope DB not ready.  Please check connection');
