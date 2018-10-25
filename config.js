const config = {
	redisUrl: process.env.STETHOSCOPE_REDIS_URL,
	redisReconnectionDelay: 0,
	keyTtl: 86400,

	// event keys
	eventKeyDelimiter: ':',
	ageEventKeyPrefix: 'AGE',
	dbURI: process.env.STETHOSCOPE_MONGO_URI,
};

if (process.env.NODE_ENV !== 'production') {
	config.redisUrl = 'redis://127.0.0.1:6379/0';
	config.dbURI = 'mongodb://localhost:27017/ft-email-stethoscope-test';
}

module.exports = config;
