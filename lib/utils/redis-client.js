const Redis = require('ioredis');
const config = require('../../config');

const REDIS_OPTIONS = {
	maxRetriesPerRequest: 1,
	showFriendlyErrorStack: true,
	reconnectOnError: false,
	retryStrategy: false
};

let redis;

exports.instance = () => {
	if (redis) { return redis; }

	redis = new Redis(config.redisUrl, REDIS_OPTIONS);
	return redis;
};

exports.disconnect = () => {
	if (!redis) { return; }

	redis.disconnect();
	redis = undefined;
};
