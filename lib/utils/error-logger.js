const logger = require('@financial-times/n-logger').default;

exports.logUnexpectedError = (err, key) => logger.error(`Unexepected error occured: '${err.message}' for key: ${key}`);
