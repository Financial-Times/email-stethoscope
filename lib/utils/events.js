const redisClient = require('../utils/redis-client');

exports.getAllEvents = async (keyPattern) => {
	const redis = redisClient.instance();

	const keys = await redis.keys(keyPattern);
	return Promise.all(keys.map(key => redis.hgetall(key)));
};
