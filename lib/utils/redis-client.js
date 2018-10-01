const Redis = require('ioredis');
const config = require('../../config');

let redis;

exports.instance = () => {
	if (redis) { return redis; }

	redis = new Redis(config.redisUrl);
	return redis;
};

exports.disconnect = () => {
	if (!redis) { return; }

	redis.disconnect();
	redis = undefined;
};
