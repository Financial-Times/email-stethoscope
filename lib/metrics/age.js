const logger = require('@financial-times/n-logger').default;
const { eventKey } = require('../utils/event-key');
const redisClient = require('../utils/redis-client');
const errorLogger = require('../utils/error-logger');

exports.eventAge = async ({ event, identifier }) => {
	const key = eventKey(event, identifier);
	const redis = redisClient.instance();

	try {
		const existingEvent = await redis.hgetall(key);

		return (Object.keys(existingEvent).length) ? _age(existingEvent) : undefined;
	} catch (err) {
		return errorLogger.logUnexpectedError(err, key);
	}
};

exports.eventsAge = async ({ event, operation }) => {
	const key = eventKey(event);
	const redis = redisClient.instance();

	try {
		if (!validOperations[operation]) { return logger.error(`Attempted to use invalid operation: ${operation}.  Valid operations are: ${Object.keys(validOperations)}`); }

		const eventKeys = await redis.keys(`${key}*`);
		const existingEvents = await Promise.all(eventKeys.map(existingKey => redis.hgetall(existingKey)));

		return existingEvents.length ? validOperations[operation](existingEvents) : undefined;
	} catch (err) {
		return errorLogger.logUnexpectedError(err, key);
	}
};

const average = events => events.map(_age).reduce((totalAge, age) => totalAge + age) / events.length;
const max = events => Math.max(...events.map(_age));
const min = events => Math.min(...events.map(_age));

const validOperations = { average, max, min };

const _age = event => (event.endDate || Date.now()) - event.startDate;
