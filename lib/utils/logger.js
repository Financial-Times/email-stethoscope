const logger = require('@financial-times/n-logger').default;

logger.addContext({
	client: 'email-stethoscope'
});

module.exports = logger;
