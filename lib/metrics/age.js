const logger = require('../utils/logger');
const { AgeEvent } = require('../db/models/age-event');

exports.eventAge = async ({ event, identifier }) => {
	try {
		const existingEvent = await AgeEvent.findOne({ event, identifier });

		return existingEvent ? existingEvent.age : undefined;
	} catch (err) {
		return logger.error(`Unexpected error occurred: '${err.message}'`);
	}
};

exports.eventsAge = async ({ event, operation }) => {
	try {
		if (!validOperations[operation]) { return logger.error(`Attempted to use invalid operation: ${operation}.  Valid operations are: ${Object.keys(validOperations)}`); }

		const existingEvents = await AgeEvent.find({ event });
		return existingEvents.length ? validOperations[operation](existingEvents) : undefined;
	} catch (err) {
		return logger.error(`Unexpected error occurred: '${err.message}'`);
	}
};

exports.orderedEvents = async ({ limit } = {}) => {
	try {
		const events = (await AgeEvent.find()).sort(compareByAge).slice(0, limit);
		return events.length ? events : undefined;
	} catch (err) {
		return logger.error(`Unexpected error occurred: '${err.message}'`);
	}
};

const compareByAge = (event1, event2) => event2.age - event1.age;

const average = events => events.reduce((totalAge, event) => totalAge + event.age, 0) / events.length;
const max = events => Math.max(...events.map(event => event.age));
const min = events => Math.min(...events.map(event => event.age));

const validOperations = { average, max, min };
