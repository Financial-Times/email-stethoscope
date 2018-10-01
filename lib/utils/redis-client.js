const Redis = require('ioredis');

let redis;

exports.instance = () => {
	if (redis) { return redis; }

	redis = new Redis({});
	return redis;
};

exports.disconnect = () => {
	if (!redis) { return; }

	redis.disconnect();
	redis = undefined;
};
