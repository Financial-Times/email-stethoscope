const mongoose = require('mongoose');
const { eventTTL } = require('../../../config');
const { isEpochy, baseEventSchema } = require('../base-event-schema');

const eventSchema = new mongoose.Schema({ ...baseEventSchema,
	endedAt: {
		type: Number,
		required: false,
		validate: {
			validator: isEpochy,
			message: '"endedAt" must be an epoch'
		}
	}
});

eventSchema.virtual('age').get(function age() {
	return (this.endedAt || Date.now()) - this.createdAt;
});

eventSchema.index({ event: 1, identifier: 1 }, { unique: true, background: true });
eventSchema.index({ createdAt: 1 }, { expireAfterSeconds: eventTTL, background: true });

exports.AgeEvent = mongoose.model('AgeEvent', eventSchema);
