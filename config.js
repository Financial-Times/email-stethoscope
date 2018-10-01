const config = {
	redisUrl: process.env.STETHOSCOPE_REDIS_URL,
	keyTtl: 86400
};

if (process.env.NODE_ENV !== 'production') {
	config.redisUrl = 'redis://127.0.0.1:6379/0';
}

module.exports = config;
