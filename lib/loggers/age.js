const logger = require('../utils/logger');
const errorLogger = require('../utils/error-logger');
const { AgeEvent } = require('../db/models/age-event');
const { isDbReady } = require('../utils/db');

exports.startEvent = async ({ event, identifier }) => {
	if (!isDbReady()) { return errorLogger.logDbNotReadyError(); }

	try {
		if (await AgeEvent.findOne({ event, identifier })) { return logger.warn(`Attempted to start an event that has already been started. ${{ event, identifier }}`); }
		return await AgeEvent.create({ event, identifier, createdAt: Date.now() });
	} catch (err) {
		return errorLogger.logUnexpectedError(err);
	}
};

exports.endEvent = async ({ event, identifier }) => {
	if (!isDbReady()) { return errorLogger.logDbNotReadyError(); }

	try {
		const existingEvent = await AgeEvent.findOne({ event, identifier });
		if (existingEvent.endedAt) { return logger.warn(`Attempted to end an event that has already ended. ${{ event, identifier }}`); }

		return await existingEvent.set({ endedAt: Date.now() }).save();
	} catch (err) {
		return errorLogger.logUnexpectedError(err);
	}
};
