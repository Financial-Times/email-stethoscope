const config = {
	redisUrl: process.env.STETHOSCOPE_REDIS_URL,
	redisReconnectionDelay: 0,
	keyTtl: 86400,

	// event keys
	eventKeyDelimiter: ':',
	ageEventKeyPrefix: 'AGE',
};

if (process.env.NODE_ENV !== 'production') {
	config.redisUrl = 'redis://127.0.0.1:6379/0';
}

module.exports = config;
