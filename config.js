const config = {
	dbURI: process.env.STETHOSCOPE_MONGO_URI,
	eventTTL: process.env.STETHOSCOPE_EVENT_TTL || 86400
};

config.dbURI = process.env.STETHOSCOPE_MONGO_URI || 'mongodb://localhost:27017/ft-email-stethoscope-test';

module.exports = config;
