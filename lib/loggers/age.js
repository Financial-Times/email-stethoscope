const logger = require('@financial-times/n-logger').default;
const redisClient = require('../utils/redis-client');
const { eventKey } = require('../utils/event-key');
const errorLogger = require('../utils/error-logger');
const { keyTtl } = require('../../config');

module.exports.startEvent = async ({ event, identifier, expire = keyTtl }) => {
	const key = eventKey(event, identifier);
	const redis = redisClient.instance();

	try {
		const existingEvent = await redis.exists(key);
		if (existingEvent) { return logger.warn(`Attempted to start an event that has already been started.  key: ${key}`); }

		await redis.hmset(key, { startDate: Date.now() });
		return redis.expire(key, expire);
	} catch (err) {
		return errorLogger.logUnexpectedError(err, key);
	}
};

module.exports.endEvent = async ({ event, identifier }) => {
	const key = eventKey(event, identifier);
	const redis = redisClient.instance();

	try {
		const existingEvent = await redis.hgetall(key);
		if (!existingEvent.startDate) { return logger.warn(`Attempted to end an event that has not started.  key: '${key}'`); }
		if (existingEvent.endDate) { return logger.warn(`Attempted to end an event that has already ended.  key: '${key}'`); }

		return redis.hmset(key, { endDate: Date.now() });
	} catch (err) {
		return errorLogger.logUnexpectedError(err, key);
	}
};
